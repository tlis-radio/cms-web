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
  setSrc: (src: string) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  updateCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
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
  const [src, setSrc] = useState<string>("https://stream.tlis.sk/tlis.mp3");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (mode == "archive") {
      setCurrentTime(0);
      const audio = new Audio();
      audio.src = src;
      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      setIsPlaying(true);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = src;
      audioRef.current.load(); // Load the new source
    } else {
      audioRef.current = new Audio(src);
    }

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

  }, [mode, src]);

  function handleAudioTimeUpdate() {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }

  function updateCurrentTime(newTime: number) {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn(err);
        });
      }
    }
    else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

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
        src,
        currentTime,
        setCurrentTime,
        updateCurrentTime,
        setMode,
        setArchiveName,
        setSrc,
        duration,
        setDuration
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
