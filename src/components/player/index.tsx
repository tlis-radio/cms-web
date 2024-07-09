import Image from "next/image";
import PlayerDisplay from "./song-data";
import PlayerControl from "./player-control";
import React, { useState, useRef } from 'react';
import logo from "../../../public/03_TLIS_logo2020_white_no-bkg.svg";

const Player: React.FC = () => {
   const audio = useRef<HTMLAudioElement | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const source = "https://stream.tlis.sk/tlis.mp3"
   const title = "NOOT NOOT";

   return (
      <div
         className="flex items-center bg-[#2e2b2c] p-2 text-white fixed bottom-0 inset-x-0 w-full 
             sm:w-1/2 sm:static 
             lg:w-1/3 gap-2"
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
         <Image
            src={logo}
            alt="Logo"
            height={64}
            priority={true}
         />
      </div>
   );
};

export default Player;