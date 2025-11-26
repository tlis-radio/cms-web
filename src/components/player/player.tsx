"use client";
import React, { useState, useRef, useEffect } from 'react';
import { faChevronDown, faPause, faPlay, faSpinner, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import ProgressBar from "./progress-bar";
import Marquee from "./marquee";
import Link from "next/link";

const SlideButton: React.FC<{ isVisible: boolean, onClick: () => void }> = ({ isVisible, onClick }) => {
   const buttonStyle = {
      transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
      transition: 'transform 0.3s ease-in-out',
   };

   return (
      <div className={`fixed inset-x-0 ${isVisible ? 'bottom-[8rem]' : 'bottom-[3.5rem]'} z-20 transition-all duration-300 ease-in-out pointer-events-none`}>
         <div className="max-w-7xl mx-auto relative px-4">
            <div className="absolute right-0 -translate-x-3 2xl:translate-x-12">
               <span
                  role="button"
                  tabIndex={0}
                  className="pointer-events-auto flex items-center justify-center w-10 h-10 cursor-pointer text-xl rounded-full bg-[#d43c4a] shadow-lg"
                  onClick={onClick}
               >
                  <FontAwesomeIcon icon={faChevronDown} style={buttonStyle} />
               </span>
            </div>
         </div>
      </div>
   );
};

function getTimeFromMs(ms: number): string {
   const hours = Math.floor(ms / 3600);
   const minutes = Math.floor((ms % 3600) / 60);
   const seconds = Math.floor(ms % 60);
   return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const VolumeControl: React.FC<{ volume: number; handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void }> = ({ volume, handleVolumeChange }) => {
   return (
      <div className="group relative inline-flex items-center">
         <button
            aria-label="Volume"
            className="flex items-center justify-center w-10 h-10 cursor-pointer text-lg rounded-full bg-[#d43c4a] text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
         >
            <FontAwesomeIcon icon={faVolumeHigh} />
         </button>
         <div className="absolute z-50 right-full pr-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity duration-150">
            <div className="px-3 py-2 rounded-full bg-[#d43c4a]">
               <input
                  aria-label="Volume slider"
                  className="w-[150px] cursor-pointer"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
               />
            </div>
         </div>
      </div>
   );
};

const Player: React.FC<{}> = () => {
   const { 
      mode, 
      archiveName, 
      archiveShowSlug, 
      archiveShowName,
      archiveEpisodeCover,
      currentTime, 
      duration, 
      updateCurrentTime,
      isPlaying,
      setIsPlaying,
      isLoading,
      audioRef
   } = usePlayer();
   
   const [isVisible, setIsVisible] = useState(true);
   const [volume, setVolume] = useState(1);
   const [streamTitle, setStreamTitle] = useState("Rádio TLIS");

   const playerWrapper = useRef<HTMLDivElement | null>(null);

   const toggleVisibility = () => setIsVisible(!isVisible);

   useEffect(() => {
      window.addEventListener("resize", shiftBody);
      shiftBody();
      return () => window.removeEventListener("resize", shiftBody);
   }, [isVisible]);

   useEffect(() => {
      if (audioRef.current) {
         audioRef.current.volume = volume;
      }
   }, [volume, audioRef]);

   useEffect(() => {
      const fetchTitle = async () => {
         if (mode === "archive") return;

         const currentStreamTitleResponse = await fetch('/api/stream');
         const currentStreamTitle = await currentStreamTitleResponse.text();
         if (currentStreamTitle) {
            setStreamTitle(currentStreamTitle);
         } else {
            setStreamTitle("Neznáme rádio");
         }
      };

      fetchTitle();
      const intervalId = setInterval(fetchTitle, 5000);
      return () => clearInterval(intervalId);
   }, [mode]);

   function shiftBody() {
      const padding = isVisible ? playerWrapper.current?.clientHeight + 'px' : '0';
      document.querySelector('body')?.style.setProperty('padding-bottom', padding);
   }

   const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(event.target.value));
   };

   // Seek by delta seconds (positive or negative). Uses updateCurrentTime from context
   const seekBy = (delta: number) => {
      const dur = duration || 0;
      const newTime = Math.max(0, Math.min((currentTime || 0) + delta, dur || Number.MAX_SAFE_INTEGER));
      updateCurrentTime(newTime);
   };

   useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
         // Ignore when typing in inputs or editable elements
         const target = e.target as HTMLElement | null;
         if (target) {
            const tag = target.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return;
         }

         if (e.key === 'ArrowLeft') {
            e.preventDefault();
            seekBy(-15);
         } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            seekBy(15);
         }
      };

      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
   }, [currentTime, duration]);

   const playerClasses = classNames(
      'fixed bottom-0 inset-x-0 w-full z-10 bg-[#2e2b2c] transition-transform duration-300 ease-in-out',
      {
         'translate-y-0': isVisible,
         'translate-y-[calc(100%-4px)]': !isVisible,
      }
   );

   // Determine the cover image to display
   const coverImage = mode === "archive" && archiveEpisodeCover
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${archiveEpisodeCover}`
      : "/images/03_TLIS_logo2020_white_no-bkg.svg";

   // Determine the title and subtitle
   const title = mode === "archive" ? archiveName : streamTitle;
   const subtitle = mode === "archive" 
      ? archiveShowName || "Rádio TLIS"
      : "Rádio TLIS";

   return (
      <>
         <div ref={playerWrapper} className={playerClasses}>
            {/* Progress bar for archive mode */}
            {mode === "archive" && (
               <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={updateCurrentTime}
                  isVisible={isVisible}
               />
            )}
            {/* If live, show a colored top border instead */}
            {mode === "stream" && (
               <div className="absolute top-0 left-0 w-full h-1 bg-[#d43c4a]" />
            )}

            {/* Main player content */}
            <div className="max-w-7xl mx-auto flex items-center gap-3 p-3 pt-4">
               {/* Cover Image */}
               <div className="w-14 h-14 flex-shrink-0 relative">
                  <Image
                     src={coverImage}
                     alt={title || "Radio TLIS"}
                     width={56}
                     height={56}
                     className="w-full h-full object-cover rounded"
                  />
               </div>

               {/* Title and Subtitle Container */}
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {mode === "archive" && archiveShowSlug ? (
                     <Link href={`/relacie/${archiveShowSlug}`}>
                        <Marquee 
                           className="font-argentumSansLight text-sm sm:text-base font-semibold text-white"
                           text={title || ''}
                        />
                     </Link>
                  ) : (
                     <Marquee 
                        className="font-argentumSansLight text-sm sm:text-base font-semibold text-white"
                        text={title || ''}
                     />
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-300 flex-wrap">
                     <span>{subtitle}</span>
                     {mode === "archive" && duration > 0 && (
                        <>
                           <span>•</span>
                           <span>{getTimeFromMs(currentTime)} / {getTimeFromMs(duration)}</span>
                        </>
                     )}
                  </div>
               </div>

               {/* Actions: Volume (desktop only) + Play Button */}
               <div className="flex items-center gap-2 flex-shrink-0">
                  <div className='hidden lg:block'>
                     <VolumeControl volume={volume} handleVolumeChange={handleVolumeChange} />
                  </div>

                  {/* Back 15s */}
                  { mode === "archive" && 
                  <button
                     aria-label="Back 15 seconds"
                     onClick={() => seekBy(-15)}
                     className="hidden md:flex ml-5 items-center justify-center w-10 h-10 cursor-pointer text-xl rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none"
                     type="button"
                  >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <path d="M16.5 8.5H13.8604C13.6452 8.5 13.4541 8.63772 13.386 8.84189L12.7194 10.8419C12.6114 11.1657 12.8524 11.5 13.1937 11.5H14.5C15.6046 11.5 16.5 12.3954 16.5 13.5C16.5 14.6046 15.6046 15.5 14.5 15.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M7.5 10.5L10 8.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 4.5L12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C8.7288 22 5.82446 20.4293 4 18.001M8 2.83209C6.87754 3.32251 5.86251 4.01303 5 4.85857C3.14864 6.67349 2 9.20261 2 12C2 12.6849 2.06886 13.3538 2.20004 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button> }

                  {/* Play / Pause */}
                  <button
                     className="flex items-center justify-center w-10 h-10 cursor-pointer text-xl rounded-full bg-[#d43c4a]/90 hover:bg-[#d43c4a] focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                     onClick={() => setIsPlaying(!isPlaying)}
                     aria-label={isPlaying ? "Pause" : "Play"}
                     type="button"
                  >
                     {isLoading && <FontAwesomeIcon className="animate-spin" icon={faSpinner} />}
                     {!isPlaying && !isLoading && <FontAwesomeIcon icon={faPlay} />}
                     {!isLoading && isPlaying && <FontAwesomeIcon icon={faPause} />}
                  </button>

                  {/* Forward 15s */}
                  { mode === "archive" &&
                  <button
                     aria-label="Forward 15 seconds"
                     onClick={() => seekBy(15)}
                     className="hidden md:flex items-center justify-center w-10 h-10 cursor-pointer text-xl rounded-full bg-white/10 hover:bg-white/20 text-white focus:outline-none"
                     type="button"
                  >
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                        <path d="M16.5 8.5H13.8604C13.6452 8.5 13.4541 8.63772 13.386 8.84189L12.7194 10.8419C12.6114 11.1657 12.8524 11.5 13.1937 11.5H14.5C15.6046 11.5 16.5 12.3954 16.5 13.5C16.5 14.6046 15.6046 15.5 14.5 15.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M7.5 10.5L10 8.5V15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 4.5L12 2C6.47715 2 2 6.47715 2 12C2 12.6849 2.06886 13.3538 2.20004 14M16 2.83209C19.5318 4.3752 22 7.89936 22 12C22 17.5228 17.5228 22 12 22C8.72852 22 5.82443 20.4287 4 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                  </button> }
               </div>
            </div>
         </div>
         <SlideButton isVisible={isVisible} onClick={toggleVisibility} />
      </>
   );
};

export default Player;
