"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { getEmbedSessionId } from "@/components/EmbedSessionInit";

interface EmbedPlayerContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  
  episodeName: string | null;
  setEpisodeName: (name: string | null) => void;
  episodeCover: string | null;
  setEpisodeCover: (cover: string | null) => void;
  src: string | null;
  setSrc: (src: string | null) => void;
  
  currentTime: number;
  setCurrentTime: (time: number) => void;
  updateCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  
  episodeId: number | null;
  setEpisodeId: (id: number | null) => void;
}

const EmbedPlayerContext = createContext<EmbedPlayerContextType | null>(null);

export const useEmbedPlayer = () => {
  const ctx = useContext(EmbedPlayerContext);
  if (!ctx) throw new Error("useEmbedPlayer must be used within EmbedPlayerProvider");
  return ctx;
};

export const EmbedPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [episodeName, setEpisodeName] = useState<string | null>(null);
  const [episodeCover, setEpisodeCover] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [episodeId, setEpisodeId] = useState<number | null>(null);
  const [countedView, setCountedView] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset view count when src changes
  useEffect(() => {
    setCountedView(false);
    setCurrentTime(0);
    
    if (src) {
      const audio = new Audio();
      audio.src = src;
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
    }

    if (audioRef.current) {
      audioRef.current.pause();
      if (src) {
        audioRef.current.src = src;
        audioRef.current.load();
      }
    } else if (src) {
      audioRef.current = new Audio(src);
    }
  }, [src]);

  // Handle time updates and view counting
  useEffect(() => {
    function handleTimeUpdate() {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        if (
          !countedView &&
          episodeId !== null &&
          audioRef.current.duration > 0 &&
          audioRef.current.currentTime >= 300
        ) {
          setCountedView(true);
          fetch(`/api/view/${episodeId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }).catch((err) => console.error("Failed to count view:", err));
        }
      }
    }

    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [src, countedView, episodeId]);

  // Handle play/pause
  useEffect(() => {
    let handleCanPlay: (() => void) | null = null;

    if (audioRef.current && src) {
      if (isPlaying) {
        setIsLoading(true);
        audioRef.current.load();

        handleCanPlay = () => {
          setIsLoading(false);
          if (audioRef.current) {
            audioRef.current.currentTime = currentTime;
            audioRef.current.removeEventListener("canplay", handleCanPlay!);
          }
        };
        audioRef.current.addEventListener("canplay", handleCanPlay);

        audioRef.current.play().catch((err) => {
          console.warn(err);
          setIsLoading(false);
        });
      } else {
        audioRef.current.pause();
        if (handleCanPlay) {
          audioRef.current.removeEventListener("canplay", handleCanPlay);
        }
        setIsLoading(false);
      }
    }
  }, [isPlaying]);

  // Media Session API
  useEffect(() => {
    if ("mediaSession" in navigator && episodeName) {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: episodeName,
        artist: "Rádio TLIS",
        album: "Rádio TLIS",
        artwork: episodeCover
          ? [{ src: episodeCover, sizes: "512x512", type: "image/png" }]
          : [],
      });

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    }
  }, [episodeName, episodeCover]);

  function updateCurrentTime(newTime: number) {
    if (audioRef.current && isFinite(newTime) && !isNaN(newTime) && newTime >= 0) {
      const clampedTime = Math.min(newTime, audioRef.current.duration || newTime);
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }

  // Segment tracking for archive playback
  const lastTrackedSegment = useRef<number>(-1);

  useEffect(() => {
    if (episodeId === null) {
      lastTrackedSegment.current = -1;
      return;
    }

    const sendHeartbeat = async () => {
      const audio = audioRef.current;
      if (!audio || audio.paused || audio.ended) return;

      const segmentIndex = Math.floor(audio.currentTime / 15);
      if (segmentIndex === lastTrackedSegment.current) return;
      lastTrackedSegment.current = segmentIndex;

      const sessionId = getEmbedSessionId();
      if (!sessionId) {
        console.warn("No session ID available for tracking");
        return;
      }

      try {
        await fetch("/api/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            episodeId: episodeId, 
            currentTime: audio.currentTime,
            sessionId: sessionId 
          }),
        });
      } catch (err) {
        console.error("Segment tracking failed:", err);
      }
    };

    const handlePlay = () => {
      lastTrackedSegment.current = -1;
      sendHeartbeat();
    };

    const interval = setInterval(sendHeartbeat, 15000);

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("play", handlePlay);
    }

    if (audio && !audio.paused) {
      sendHeartbeat();
    }

    return () => {
      clearInterval(interval);
      if (audio) {
        audio.removeEventListener("play", handlePlay);
      }
    };
  }, [episodeId]);

  return (
    <EmbedPlayerContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        isLoading,
        setIsLoading,
        audioRef,
        episodeName,
        setEpisodeName,
        episodeCover,
        setEpisodeCover,
        src,
        setSrc,
        // assetId removed; use episodeId/setEpisodeId
        currentTime,
        setCurrentTime,
        updateCurrentTime,
        duration,
        setDuration,
        episodeId,
        setEpisodeId,
      }}
    >
      {children}
    </EmbedPlayerContext.Provider>
  );
};
