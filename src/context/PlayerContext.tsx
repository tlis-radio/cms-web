"use client"
import React, { createContext, useContext, useEffect, useState } from "react";

type PlayerMode = "stream" | "archive";

interface PlayerContextType {
  mode: PlayerMode;
  archiveName: string | null;
  src: string;
  setMode: (mode: PlayerMode) => void;
  setArchiveName: (name: string | null) => void;
  setSrc: (src: string) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
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
  const [mode, setMode] = useState<PlayerMode>("stream");
  const [archiveName, setArchiveName] = useState<string | null>(null);
  const [src, setSrc] = useState<string>("https://stream.tlis.sk/tlis.mp3");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    if(mode == "archive"){
      // ziskat dlzku src
    }
  }, [mode, src])

  return (
    <PlayerContext.Provider
      value={{
        mode,
        archiveName,
        src,
        currentTime,
        setCurrentTime,
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
