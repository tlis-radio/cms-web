import PlayerDisplay from "./song-data";
import PlayerControl from "./player-control";
import React, { useState, useRef, useEffect } from 'react';
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { usePlayer } from "@/context/PlayerContext";

const SlideButton: React.FC<{ isVisible: boolean, onClick: () => void }> = ({ isVisible, onClick }) => {
   const buttonStyle = {
      transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
      transition: 'transform 0.3s ease-in-out',
   };

   return (
      <div className={`fixed ${isVisible ? 'bottom-[4.5rem]' : 'bottom-5'} right-4 z-20 lg:hidden transition-all duration-300 ease-in-out`}>
         <span
            role="button"
            tabIndex={0}
            className="flex items-center justify-center w-10 h-10 cursor-pointer text-xl rounded-full bg-[#d43c4a] shadow-lg"
            onClick={onClick}
         >
            <FontAwesomeIcon icon={faChevronDown} style={buttonStyle} />
         </span>
      </div>
   );
};

const Player: React.FC<{}> = () => {
   const { mode, archiveName, currentTime, duration, updateCurrentTime, setMode, setIsPlaying } = usePlayer();
   const [isVisible, setIsVisible] = useState(true);

   const toggleVisibility = () => setIsVisible(!isVisible);

   const playerWrapper = useRef<HTMLDivElement | null>(null);

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
      'flex items-center bg-[#2e2b2c] p-3 fixed bottom-0 inset-x-0 w-full gap-3 z-10 h-20',
      {
         'translate-y-0': isVisible,
         'translate-y-full lg:translate-y-0': !isVisible,
      },
      'transition-transform duration-300 ease-in-out',
      'lg:w-[55%] lg:pr-0 lg:relative lg:rounded-xl lg:h-16 lg:top-[5px] lg:mx-auto',
      'xl:w-2/3',
      '2xl:w-1/2'
   );

   return (
      <>
         {mode !== "stream" && (
            <div
               className={classNames(
                 "fixed left-4 lg:relative lg:ml-auto mr-7 z-20 transition-all duration-300 ease-in-out flex items-center justify-center",
                 isVisible ? "max-lg:bottom-[4.5rem] bottom-4 lg:bottom-0" : "bottom-5 lg:bottom-0"
               )}
            >
               <button 
                  onClick={() => {
                     setMode("stream");
                     setIsPlaying(true);
                  }}
                  className="flex items-center justify-center whitespace-nowrap w-auto h-10 text-xl rounded-full bg-[#d43c4a] shadow-lg text-white px-4"
                  aria-label="Live"
                  type="button"
               >
                  ● LIVE
               </button>
            </div>
         )}
         <div ref={playerWrapper} className={playerClasses}>
            <PlayerControl />
            <div className="flex flex-col flex-1 min-w-0">
               <PlayerDisplay
                  mode={mode}
                  archiveName={archiveName}
                  currentTime={currentTime}
                  duration={duration}
                  updateCurrentTime={updateCurrentTime}
               />
            </div>
         </div>
         <SlideButton isVisible={isVisible} onClick={toggleVisibility} />
      </>
   );
};

export default Player;