"use client"
import React, { createContext, use, useContext, useEffect, useState } from "react";

type PlayerMode = "stream" | "archive";

interface PlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;

  mode: PlayerMode;
  archiveName: string | null;
  src: string;
  setMode: (mode: PlayerMode) => void;
  setArchiveName: (name: string | null) => void;
  setArchiveMetadata: (metadata: { author: string; album: string; image: string }) => void;

  setSrc: (src: string) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  updateCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;

  setArchiveEpisodeId: (id: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<PlayerMode>("stream");
  const [archiveName, setArchiveName] = useState<string | null>(null);
  const [archiveMetadata, setArchiveMetadata] = useState<{
    author: string;
    album: string;
    image: string;
  } | null>(null);
  const [src, setSrc] = useState<string>("https://stream.tlis.sk/tlis.mp3");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [episodeId, setArchiveEpisodeId] = useState<number | null>(null);
  const [countedView, setCountedView] = useState<boolean>(false);

  useEffect(() => {
    setCountedView(false);
    if (mode == "archive") {
      setCurrentTime(0);
      const audio = new Audio();
      audio.src = src;
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      setIsPlaying(true);
    } else {
      setSrc("https://stream.tlis.sk/tlis.mp3");
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.load(); // Load the new source
    } else {
      audioRef.current = new Audio(src);
    }
  }, [mode, src]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn(err);
      });

      audioRef.current.addEventListener("timeupdate", handleAudioTimeUpdate);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleAudioTimeUpdate);
      }
    };
  }, [mode, src, countedView])

  useEffect(() => {
    if ('mediaSession' in navigator) {
      if (mode == 'stream') {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: 'Počúvaš Rádio TLIS',
          artist: 'Rádio TLIS',
          album: 'Rádio TLIS',
        });
      } else if (mode === 'archive' && archiveMetadata) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: mode === 'archive' ? archiveName! : 'Rádio TLIS',
          artist: archiveMetadata?.author! || "Rádio TLIS",
          album: archiveMetadata?.album! || "Rádio TLIS",
          artwork: [
            { src: archiveMetadata?.image!, sizes: '512x512', type: 'image/png' }
          ]
        });
      }

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
      });
    }

    // Listen for stream-title-updated and update Media Session title for stream
    if (isPlaying && mode === "stream" && 'mediaSession' in navigator && audioRef.current) {
      const handleStreamTitleUpdated = (e: Event) => {
        const customEvent = e as CustomEvent<string>;
        if (navigator.mediaSession.metadata) {
          navigator.mediaSession.metadata.title = customEvent.detail;
        }
      };

      document.addEventListener("stream-title-updated", handleStreamTitleUpdated as EventListener);

      return () => {
        document.removeEventListener("stream-title-updated", handleStreamTitleUpdated as EventListener);
      };
    }
  }, [mode, src, archiveMetadata, archiveName]);

  function handleAudioTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (countedView === false && mode === "archive" && episodeId !== null && audioRef.current.duration > 0 && audioRef.current.currentTime >= 300) {
        setCountedView(true);
        fetch(`/api/view/${episodeId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }).catch((err) => {
          console.error("Failed to count view:", err);
        });
      }
    }
  }

  function updateCurrentTime(newTime: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }

  useEffect(() => {
    let streamHandleCanPlay: (() => void) | null = null;
    let archiveHandleCanPlay: (() => void) | null = null;
    if (audioRef.current && mode === "stream") {
      setArchiveMetadata(null);
      if (isPlaying) {
        setIsLoading(true);
        audioRef.current.src = "https://stream.tlis.sk/tlis.mp3";
        audioRef.current.load();

        streamHandleCanPlay = () => {
          setIsLoading(false);
          audioRef.current?.removeEventListener("canplay", streamHandleCanPlay!);
        };
        audioRef.current.addEventListener("canplay", streamHandleCanPlay);
        audioRef.current.play().catch((err) => {
          console.warn(err);
        });
      } else {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
        setIsLoading(false);
        if (streamHandleCanPlay) {
          audioRef.current.removeEventListener("canplay", streamHandleCanPlay);
        }
      }
    } else if (audioRef.current) {
      if (isPlaying) {
        setIsLoading(true);
  
        audioRef.current.load();
        archiveHandleCanPlay = () => {
          setIsLoading(false);
          audioRef.current?.removeEventListener("canplay", archiveHandleCanPlay!);
        };
        audioRef.current.addEventListener("canplay", archiveHandleCanPlay);

        audioRef.current.play().catch((err) => {
          console.warn(err);
        });
      } else {
        audioRef.current.pause();
        if (archiveHandleCanPlay) {
          audioRef.current.removeEventListener("canplay", archiveHandleCanPlay);
        }
        setIsLoading(false);
      }
    }
  }, [isPlaying, mode]);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        isLoading,
        setIsLoading,
        isPlaying,
        setIsPlaying,
        mode,
        archiveName,
        setArchiveMetadata,
        src,
        currentTime,
        setCurrentTime,
        updateCurrentTime,
        setMode,
        setArchiveName,
        setSrc,
        duration,
        setDuration,
        setArchiveEpisodeId,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
