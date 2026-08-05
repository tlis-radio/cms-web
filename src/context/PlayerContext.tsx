"use client"
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import { UmamiTrack } from "@/components/Analytics";
import { isAnonymousConsent } from "@/lib/clientConsent";
import StreamPasswordPrompt from "@/components/player/StreamPasswordPrompt";

type PlayerMode = "stream" | "archive";

const STREAM_URL = "/api/stream-proxy";

function buildAuthenticatedStreamUrl(password: string): string {
  return `${STREAM_URL}?password=${encodeURIComponent(password)}`;
}

interface PlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;

  mode: PlayerMode;
  archiveName: string | null;
  archiveShowSlug: string | null;
  archiveShowName: string | null;
  archiveEpisodeCover: string | null;
  src: string;
  setMode: (mode: PlayerMode) => void;
  setArchiveName: (name: string | null) => void;
  setArchiveShowSlug: (show: string | null) => void;
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
  const [archiveShowSlug, setArchiveShowSlug] = useState<string | null>(null);
  const [archiveShowName, setArchiveShowName] = useState<string | null>(null);
  const [archiveEpisodeCover, setArchiveEpisodeCover] = useState<string | null>(null);
  const [archiveMetadata, setArchiveMetadata] = useState<{
    author: string;
    album: string;
    image: string;
  } | null>(null);
  const [src, setSrc] = useState<string>(STREAM_URL);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Only set after the stream has actually returned a 401 and the user supplied a working password.
  const [streamPassword, setStreamPassword] = useState<string | null>(null);
  const [isStreamPasswordPromptOpen, setIsStreamPasswordPromptOpen] = useState(false);
  const [streamPasswordError, setStreamPasswordError] = useState<string | null>(null);

  const [episodeId, setArchiveEpisodeId] = useState<number | null>(null);
  const [countedView, setCountedView] = useState<boolean>(false);

  // In-memory session id for anonymous (rejected/no consent) listeners.
  // Ties heartbeats for every episode/stream played in this tab together,
  // without ever touching a cookie - a hard reload (F5) generates a new one.
  const [anonymousSessionId] = useState<string>(() => uuidv4());

  useEffect(() => {
    let cancelled = false;
    async function resolveShowSlug() {
      if (episodeId === null) {
        setArchiveShowSlug(null);
        return;
      }

      try {
        const res = await fetch(`/api/show-by-episode/${episodeId}`);
        if (!res.ok) {
          setArchiveShowSlug(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setArchiveShowSlug(data.slug ?? null);
      } catch (err) {
        console.error('Failed to resolve show slug for episode', episodeId, err);
        if (!cancelled) setArchiveShowSlug(null);
      }
    }

    resolveShowSlug();
    return () => { cancelled = true; };
  }, [episodeId]);

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
      setSrc(STREAM_URL);
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
      if (countedView === false && mode === "archive" && episodeId !== null && audioRef.current.duration > 0 && audioRef.current.currentTime >= Math.min(300, audioRef.current.duration * 0.33)) {
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
    let cancelled = false;

    async function startStreamPlayback() {
      const audio = audioRef.current;
      if (!audio) return;
      setIsLoading(true);

      const urlToUse = streamPassword ? buildAuthenticatedStreamUrl(streamPassword) : STREAM_URL;

      // Proxy forwards Icecast's status as-is, so one aborted GET tells us if this src works.
      const probeController = new AbortController();
      try {
        const probe = await fetch(urlToUse, { method: "GET", signal: probeController.signal });
        probeController.abort();
        if (probe.status === 401) {
          if (cancelled) return;
          setIsLoading(false);
          setIsPlaying(false);
          if (streamPassword) {
            setStreamPassword(null);
            setStreamPasswordError("invalid");
          } else {
            setStreamPasswordError(null);
          }
          setIsStreamPasswordPromptOpen(true);
          return;
        }
      } catch (err) {
        if (!probeController.signal.aborted) {
          console.warn("Stream auth probe failed, attempting playback anyway:", err);
        }
      }

      if (cancelled || !audioRef.current) return;

      audioRef.current.src = urlToUse;
      audioRef.current.load();

      streamHandleCanPlay = () => {
        setIsLoading(false);
        audioRef.current?.removeEventListener("canplay", streamHandleCanPlay!);
      };
      audioRef.current.addEventListener("canplay", streamHandleCanPlay);
      audioRef.current.play().catch((err) => {
        console.warn(err);
      });
    }

    if (audioRef.current && mode === "stream") {
      setArchiveMetadata(null);
      if (isPlaying) {
        startStreamPlayback();
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

    return () => {
      cancelled = true;
    };
  }, [isPlaying, mode, streamPassword]);

  // Segment tracking for archive and periodic heartbeat for stream
  const lastTrackedSegment = useRef<number>(-1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      lastTrackedSegment.current = -1;
      return;
    }

    // Archive heartbeat: sends episodeId + currentTime
    const sendArchiveHeartbeat = async () => {
      if (!audio || audio.paused || audio.ended) return;
      const segmentIndex = Math.floor(audio.currentTime / 15);
      if (segmentIndex === lastTrackedSegment.current) return;
      lastTrackedSegment.current = segmentIndex;

      try {
        const anonymous = isAnonymousConsent();
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episodeId: episodeId,
            currentTime: audio.currentTime,
            sessionId: anonymous ? anonymousSessionId : undefined,
          }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Segment tracking failed:", err);
      }
    };

    // Stream heartbeat: notify server while stream is playing
    const sendStreamHeartbeat = async () => {
      if (!audio || audio.paused || audio.ended) return;
      const segmentIndex = Math.floor(audio.currentTime / 15);
      if (segmentIndex === lastTrackedSegment.current) return;
      lastTrackedSegment.current = segmentIndex;

      try {
        const anonymous = isAnonymousConsent();
        await fetch("/api/heartbeat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: anonymous ? anonymousSessionId : undefined,
          }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Stream heartbeat failed:", err);
      }
    };

    // Analytics: Umami track listening duration
    const analyticsInterval = isPlaying ? setInterval(() => {
      const minutes = Math.floor(audio.currentTime / 60);
      // Track at 5, 15, 30, 60+ minute marks for stream/archive
      if (minutes > 0 && minutes % 5 === 0) {
        UmamiTrack('player_listening_time', {
          duration_minutes: minutes,
          mode: mode,
          episode_id: mode === 'archive' ? (episodeId || undefined) : undefined,
          show_slug: mode === 'archive' ? (archiveShowSlug || undefined) : undefined
        });
      }
    }, 60000) : null;

    const handlePlay = () => {
      lastTrackedSegment.current = -1;
      if (mode === "archive") {
        sendArchiveHeartbeat();
      } else if (mode === "stream") {
        sendStreamHeartbeat();
      }
    };

    // run appropriate heartbeat immediately if playing
    if (!audio.paused) {
      if (mode === "archive" && episodeId !== null) sendArchiveHeartbeat();
      else if (mode === "stream") sendStreamHeartbeat();
    }

    // Periodic tracking every 15 seconds
    const interval = setInterval(() => {
      if (mode === "archive" && episodeId !== null) {
        sendArchiveHeartbeat();
      } else if (mode === "stream") {
        sendStreamHeartbeat();
      }
    }, 15000);

    if (audio) {
      audio.addEventListener("play", handlePlay);
    }

    return () => {
      clearInterval(interval);
      if (analyticsInterval) clearInterval(analyticsInterval);
      if (audio) {
        audio.removeEventListener("play", handlePlay);
      }
      lastTrackedSegment.current = -1;
    };
  }, [mode, episodeId]);

  function submitStreamPassword(password: string) {
    setStreamPassword(password);
    setStreamPasswordError(null);
    setIsStreamPasswordPromptOpen(false);
    setIsPlaying(true);
  }

  function cancelStreamPassword() {
    setIsStreamPasswordPromptOpen(false);
    setStreamPasswordError(null);
    setIsPlaying(false);
  }

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
        archiveShowSlug,
        setArchiveShowSlug,
      }}
    >
      {children}
      <StreamPasswordPrompt
        open={isStreamPasswordPromptOpen}
        error={streamPasswordError}
        onSubmit={submitStreamPassword}
        onCancel={cancelStreamPassword}
      />
    </PlayerContext.Provider>
  );
};
