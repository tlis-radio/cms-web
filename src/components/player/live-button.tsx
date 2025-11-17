"use client";
import { usePlayer } from "@/context/PlayerContext";

const LiveButton = () => {
   const { mode, setMode, setIsPlaying } = usePlayer();

   if (mode === "stream") return null;

   return (
      <button 
         onClick={() => {
            setMode("stream");
            setIsPlaying(true);
         }}
         className="flex items-center justify-center whitespace-nowrap h-10 text-sm sm:text-base rounded-full bg-[#d43c4a] shadow-lg text-white px-3 sm:px-4 flex-shrink-0"
         aria-label="Live"
         type="button"
      >
         ● LIVE
      </button>
   );
};

export default LiveButton;
