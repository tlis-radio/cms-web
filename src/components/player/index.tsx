'use client';
import React, { useState, useRef } from 'react';
import { isMobile, isTablet } from "react-device-detect";
import PlayerControl from "./player-control";
import PlayerDisplay from "./song-data";

const Player: React.FC = () => {
   const audio = useRef<HTMLAudioElement | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const source = "https://stream.tlis.sk/tlis.mp3"
   const title = "NOOT NOOT";

   return (
      <div
         className={`flex ${isMobile && !isTablet ? "w-full" : "w-1/2"
            } items-center bg-[#2e2b2c] py-2 px-4 text-white lg:w-1/3 `}
      >
         <PlayerControl
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            audioSource={source}
            audioRef={audio}
         />
         <div className="mr-2 flex w-[calc(100%-44px)] flex-col">
            <PlayerDisplay title={title} />
         </div>
      </div>
   );
};

export default Player;