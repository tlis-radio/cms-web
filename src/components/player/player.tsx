import PlayerDisplay from "./song-data";
import PlayerControl from "./player-control";
import React, { useState, useRef, useEffect } from 'react';
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";


const SlideButton: React.FC<{ isVisible: boolean, onClick: () => void }> = ({ isVisible, onClick }) => {

   const buttonStyle = {
      transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
      transition: 'transform 0.3s ease-in-out',
   };


   return (
      <div className="fixed bottom-2 right-2 z-20 lg:hidden">
         <span
            role="button"
            tabIndex={0}
            className="flex cursor-pointer text-2xl p-2.5 rounded-full bg-[#d43c4a]"
            onClick={onClick}
         >
            <FontAwesomeIcon icon={faChevronDown} style={buttonStyle} />
         </span>
      </div>
   );
};

const Player: React.FC<{}> = () => {
   const [isVisible, setIsVisible] = useState(true);

   const toggleVisibility = () => setIsVisible(!isVisible);

   const playerWrapper = useRef<HTMLDivElement | null>(null);

   const audio = useRef<HTMLAudioElement | null>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const source = "https://stream.tlis.sk/tlis.mp3"

   useEffect(() => {
      window.addEventListener("resize", shiftBody);
      shiftBody();
      return () => window.removeEventListener("resize", shiftBody);
   }, [isVisible]);

   function shiftBody() {
      if (window.innerWidth >= 1024) {
         document.querySelector('body')?.style.setProperty('padding-bottom', '0');
         return;
      };
      document.querySelector('body')?.style.setProperty('padding-bottom', isVisible ? playerWrapper.current?.clientHeight + 'px' : '0');
   }

   const playerClasses = classNames(
      'flex items-center bg-[#2e2b2c] p-2 pr-11 fixed bottom-0 inset-x-0 w-full gap-2 z-10',
      {
         'translate-y-0': isVisible,
         'translate-y-full lg:translate-y-0': !isVisible,
      },
      'transition-transform duration-300 ease-in-out',
      'lg:w-2/3 lg:pr-0 lg:relative lg:rounded-2xl lg:h-[70px] lg:top-[5px]',
      'xl:w-2/3',
      '2xl:w-1/2'
   );

   return (
      <>
         <div ref={playerWrapper}
            className={playerClasses}
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
         <SlideButton isVisible={isVisible} onClick={toggleVisibility} />
      </>
   );
};

export default Player;