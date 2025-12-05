"use client"
import React, { createContext, useContext, useEffect, useState } from "react";

type PlayerMode = "stream" | "archive";

interface EmbeddedPlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;

  mode: PlayerMode;
  archiveName: string | null;
  archiveShowName: string | null;
  archiveEpisodeCover: string | null;
  src: string;
  setMode: (mode: PlayerMode) => void;
  setArchiveName: (name: string | null) => void;
  setArchiveShowName: (name: string | null) => void;
  setArchiveEpisodeCover: (cover: string | null) => void;
  setArchiveMetadata: (metadata: { author: string; album: string; image: string }) => void;

  setSrc: (src: string) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  updateCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;

  setArchiveEpisodeId: (id: number) => void;
}

const EmbeddedPlayerContext = createContext<EmbeddedPlayerContextType | null>(null);

export const useEmbeddedPlayer = () => {
  const ctx = useContext(EmbeddedPlayerContext);
  if (!ctx) throw new Error("useEmbeddedPlayer must be used within EmbeddedPlayerProvider");
  return ctx;
};

export const EmbeddedPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<PlayerMode>("archive");
  const [archiveName, setArchiveName] = useState<string | null>(null);
  const [archiveShowName, setArchiveShowName] = useState<string | null>(null);
  const [archiveEpisodeCover, setArchiveEpisodeCover] = useState<string | null>(null);
  const [archiveMetadata, setArchiveMetadata] = useState<{
    author: string;
    album: string;
    image: string;
  } | null>(null);
  const [src, setSrc] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [episodeId, setArchiveEpisodeId] = useState<number | null>(null);
  const [countedView, setCountedView] = useState<boolean>(false);

  useEffect(() => {
    setCountedView(false);
    if (mode == "archive" && src) {
      setCurrentTime(0);
      const audio = new Audio();
      audio.src = src;
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.load();
    } else if (src) {
      audioRef.current = new Audio(src);
    }
  }, [mode, src]);

  useEffect(() => {
    if (audioRef.current && src) {
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
      if (mode === 'archive' && archiveMetadata) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: archiveName || 'Rádio TLIS',
          artist: archiveMetadata?.author || "Rádio TLIS",
          album: archiveMetadata?.album || "Rádio TLIS",
          artwork: archiveMetadata?.image ? [
            { src: archiveMetadata.image, sizes: '512x512', type: 'image/png' }
          ] : undefined
        });
      }

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
      });
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
    let archiveHandleCanPlay: (() => void) | null = null;
    if (audioRef.current && src) {
      if (isPlaying) {
        setIsLoading(true);
        audioRef.current.load();
        archiveHandleCanPlay = () => {
          setIsLoading(false);
          if(audioRef.current){
            audioRef.current.currentTime = currentTime;
            audioRef.current.removeEventListener("canplay", archiveHandleCanPlay!);
          }
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
    <EmbeddedPlayerContext.Provider
      value={{
        audioRef,
        isLoading,
        setIsLoading,
        isPlaying,
        setIsPlaying,
        mode,
        archiveName,
        archiveShowName,
        archiveEpisodeCover,
        setArchiveMetadata,
        src,
        currentTime,
        setCurrentTime,
        updateCurrentTime,
        setMode,
        setArchiveName,
        setArchiveShowName,
        setArchiveEpisodeCover,
        setSrc,
        duration,
        setDuration,
        setArchiveEpisodeId,
      }}
    >
      {children}
    </EmbeddedPlayerContext.Provider>
  );
};
