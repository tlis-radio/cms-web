/**
 * This component created more problems then it resolved. - Jizzus 11:13 4.9.2024
 */

import PlayerDisplay from "./song-data";
import PlayerControl from "./player-control";
import React, { useState, useRef } from 'react';

const MobilePlayer: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {

   const playerStyle = {
      transform: isVisible ? 'translateY(0)' : 'translateY(100%)', // Adjust as needed
      transition: 'transform 0.3s ease-in-out',
   };

   const audio = useRef<HTMLAudioElement | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const source = "https://stream.tlis.sk/tlis.mp3"

   return (
      <>
      <div
         className="flex items-center bg-[#2e2b2c] p-2 pr-11 gap-2 z-10 fixed bottom-0 inset-x-0 w-full
            lg:hidden"
            style={playerStyle}
      >
         <PlayerControl
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            audioSource={source}
            audioRef={audio}
         />
         <div className="mr-2 flex flex-col">
            <PlayerDisplay />
         </div>
      </div>
      </>
   );
   
};

// TODO: Add another file called PlayerContent which will contain the PlayerDisplay and PlayerControl components and based on the PlayerContent we will create 2 components called MobilePlayer and DesktopPlayer (find out which styles are applied for which player)
// 


export default MobilePlayer;