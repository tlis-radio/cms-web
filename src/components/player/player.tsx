"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from "framer-motion";
import { faChevronDown, faClockRotateLeft, faPause, faPlay, faSpinner, faVolumeHigh, faVolumeLow, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import classNames from "classnames";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import ProgressBar from "./progress-bar";
import Marquee from "./marquee";
import Link from "next/link";
import { useTranslations } from "next-intl";

const SlideButton: React.FC<{ isVisible: boolean, onClick: () => void, extraOffset: number }> = ({ isVisible, onClick, extraOffset }) => {
   const buttonStyle = {
      transform: isVisible ? 'rotate(0deg)' : 'rotate(180deg)',
      transition: 'transform 0.3s ease-in-out',
   };

   return (
      <div
         className="fixed inset-x-0 z-20 transition-[bottom] duration-300 ease-in-out pointer-events-none"
         style={{ bottom: `calc(${isVisible ? '8rem' : '3.5rem'} + ${extraOffset}px)` }}
      >
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

// FontAwesome's free set only ships speaker icons with one wave (faVolumeLow) or
// three waves (faVolumeHigh) - no two-wave variant. Built from FontAwesome's own
// speaker + inner-wave + middle-wave path segments so it matches their style exactly.
const faVolumeMedium: IconDefinition = {
   prefix: "fas",
   iconName: "volume-medium" as IconDefinition["iconName"],
   icon: [
      544,
      512,
      [],
      "",
      "M301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3zM412.6 181.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5z",
   ],
};

// The slider position (0-1) is what the user drags and what drives the icon
// tiers, but human hearing perceives loudness logarithmically, not linearly -
// so a slider mapped straight to gain feels like it "does nothing" until near
// the top. Mapping position to gain along a dB curve (like YouTube's player
// does) makes equal slider movements feel like equal loudness steps.
const VOLUME_DB_RANGE = 40;

function sliderPositionToGain(position: number): number {
   if (position <= 0) return 0;
   if (position >= 1) return 1;
   return Math.pow(10, (position - 1) * (VOLUME_DB_RANGE / 20));
}

function getVolumeIcon(volume: number) {
   if (volume === 0) return faVolumeXmark;
   if (volume <= 0.33) return faVolumeLow;
   if (volume <= 0.66) return faVolumeMedium;
   return faVolumeHigh;
}

const VolumeControl: React.FC<{ volume: number; handleVolumeChange: (event: React.ChangeEvent<HTMLInputElement>) => void; onToggleMute: () => void }> = ({ volume, handleVolumeChange, onToggleMute }) => {
   const isMuted = volume === 0;

   return (
      <div className="group relative flex flex-row-reverse items-center h-10 w-10 hover:w-48 focus-within:w-48 rounded-full bg-[#d43c4a] text-white overflow-hidden transition-[width] duration-300 ease-in-out">
         <button
            type="button"
            aria-label={isMuted ? "Unmute" : "Mute"}
            aria-pressed={isMuted}
            onClick={onToggleMute}
            className="flex items-center justify-center w-10 h-10 flex-shrink-0 text-lg cursor-pointer focus:outline-none"
         >
            <FontAwesomeIcon icon={getVolumeIcon(volume)} />
         </button>
         <input
            aria-label="Volume slider"
            className="w-0 group-hover:w-[150px] group-focus-within:w-[150px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pl-2 cursor-pointer transition-all duration-300 ease-in-out"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
         />
      </div>
   );
};

interface RecentTrack {
   artist?: string;
   title: string;
   cover: string | null;
}

const RECENT_TRACKS_LIMIT = 5;

const QueueButton: React.FC<{ isOpen: boolean; onClick: () => void; label: string }> = ({ isOpen, onClick, label }) => {
   return (
      <button
         aria-label={label}
         aria-pressed={isOpen}
         onClick={onClick}
         className={classNames(
            "flex items-center justify-center w-10 h-10 cursor-pointer text-lg rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors",
            { "bg-white/20": isOpen, "bg-[#d43c4a]": !isOpen }
         )}
      >
         <FontAwesomeIcon icon={faClockRotateLeft} />
      </button>
   );
};

const Player: React.FC<{}> = () => {
   const t = useTranslations("player");
   const [isClient, setIsClient] = useState(false);
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
   const previousVolumeRef = useRef(1);
   const [streamTitle, setStreamTitle] = useState("Radio TLIS");
   const [streamArtist, setStreamArtist] = useState<string | undefined>("Radio TLIS");
   const [albumCover, setAlbumCover] = useState<string | null>(null);
   const [displayTitle, setDisplayTitle] = useState<string>("RADIO TLIS");
   const [activeDisplayTitle, setActiveDisplayTitle] = useState<string>("RADIO TLIS");
   const originalTitleRef = useRef<string>("");
   const [recentTracks, setRecentTracks] = useState<RecentTrack[]>([]);
   const [isQueueOpen, setIsQueueOpen] = useState(false);
   const [queuePanelHeight, setQueuePanelHeight] = useState(0);
   const queuePanelRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const node = queuePanelRef.current;
      if (!node || typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver((entries) => {
         setQueuePanelHeight(entries[0]?.contentRect.height || 0);
      });
      observer.observe(node);
      return () => observer.disconnect();
   }, []);

   useEffect(() => {
      setIsClient(true);
   }, []);

   useEffect(() => {
      let length = displayTitle.length;
      let position = 0;
      if (length < 24) {
         setActiveDisplayTitle(displayTitle);
         return;
      }
      let singleIteration: NodeJS.Timeout;
      let waitTimeout: NodeJS.Timeout;
      function startIteration() {
         setActiveDisplayTitle(displayTitle);
         waitTimeout = setTimeout(() => {
            singleIteration = setInterval(() => {
               setActiveDisplayTitle(displayTitle.substring(position, position + 24));
               position += 3;
               if (position > length - 24) {
                  clearInterval(singleIteration);
                  position = 0;
                  startIteration();
               }
            }, 200);
         }, 2000);
      }
      startIteration();
      return () => {
         clearTimeout(waitTimeout);
         clearInterval(singleIteration);
      };
   }, [displayTitle]);

   useEffect(() => {
      const handleVisibilityChange = () => {
         if (document.hidden) {
            originalTitleRef.current = document.title;
            document.title = activeDisplayTitle;
         } else {
            if (originalTitleRef.current) {
               document.title = originalTitleRef.current;
            }
         }
      };
      if (document.hidden) {
         document.title = activeDisplayTitle;
      }
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
   }, [activeDisplayTitle]);

   const playerWrapper = useRef<HTMLDivElement | null>(null);

   const toggleVisibility = () => setIsVisible(!isVisible);

   const resolveCover = async (artist: string, title: string): Promise<string | null> => {
      try {
         const params = new URLSearchParams({ artist, title });
         const response = await fetch(`/api/album-art?${params.toString()}`);
         const result = await response.json();
         return result.artworkUrl || null;
      } catch (err) {
         return null;
      }
   };

   const fetchAlbumArt = async (artist: string, title: string) => {
      setAlbumCover(await resolveCover(artist, title));
   };

   const albumCoverRef = useRef<string | null>(null);
   useEffect(() => {
      albumCoverRef.current = albumCover;
   }, [albumCover]);

   const hasSeededHistoryRef = useRef(false);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (playerWrapper.current && !playerWrapper.current.contains(event.target as Node)) {
            setIsQueueOpen(false);
         }
      };
      if (isQueueOpen) {
         document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [isQueueOpen]);

   useEffect(() => {
      const node = playerWrapper.current;
      window.addEventListener("resize", shiftBody);
      shiftBody();

      if (!node || typeof ResizeObserver === "undefined") {
         return () => window.removeEventListener("resize", shiftBody);
      }

      const observer = new ResizeObserver(() => shiftBody());
      observer.observe(node);
      return () => {
         window.removeEventListener("resize", shiftBody);
         observer.disconnect();
      };
   }, [isVisible, isClient]);

   useEffect(() => {
      if (audioRef.current) {
         audioRef.current.volume = sliderPositionToGain(volume);
      }
      if (volume > 0) {
         previousVolumeRef.current = volume;
      }
   }, [volume, audioRef]);

   useEffect(() => {
      const fetchTitle = async () => {
         if (mode === "archive") {
            if (archiveName) {
               setDisplayTitle(`▶️ ${archiveName}`);
            }
            return;
         }
         try {
            const response = await fetch('/api/stream');
            if (!response.ok) return;
            const text = await response.text();
            if (!text) return;
            const data = JSON.parse(text);

            if (!hasSeededHistoryRef.current) {
               hasSeededHistoryRef.current = true;
               if (Array.isArray(data.history) && data.history.length > 0) {
                  Promise.all(
                     (data.history as Array<{ artist?: string; songTitle?: string }>).map(async (item) => ({
                        artist: item.artist,
                        title: item.songTitle || "",
                        cover: await resolveCover(item.artist || "", item.songTitle || ""),
                     }))
                  ).then((seeded) => {
                     setRecentTracks((prev) => (prev.length > 0 ? prev : seeded.filter((track) => track.title)));
                  });
               }
            }

            const idleTitle = t("now_playing");
            const isPlaceholderTitle = (value?: string) => !value || value === "Radio TLIS" || value === idleTitle;

            let tempDisplayTitle = "Radio TLIS";
            if (data.artist && data.songTitle) {
               if (data.songTitle !== streamTitle || data.artist !== streamArtist) {
                  if (!isPlaceholderTitle(streamTitle)) {
                     setRecentTracks((prev) => [
                        { artist: streamArtist, title: streamTitle, cover: albumCoverRef.current },
                        ...prev,
                     ].slice(0, RECENT_TRACKS_LIMIT));
                  }
                  fetchAlbumArt(data.artist, data.songTitle);
               }
               setStreamTitle(data.songTitle);
               setStreamArtist(data.artist);
               tempDisplayTitle = `${data.artist} - ${data.songTitle}`;
            } else if (data.idle) {
               if (idleTitle !== streamTitle) {
                  if (!isPlaceholderTitle(streamTitle)) {
                     setRecentTracks((prev) => [
                        { artist: streamArtist, title: streamTitle, cover: albumCoverRef.current },
                        ...prev,
                     ].slice(0, RECENT_TRACKS_LIMIT));
                  }
                  setAlbumCover(null);
               }
               setStreamTitle(idleTitle);
               setStreamArtist(undefined);
               tempDisplayTitle = idleTitle;
            } else if (data.songTitle) {
               if (data.songTitle !== streamTitle) {
                  if (!isPlaceholderTitle(streamTitle)) {
                     setRecentTracks((prev) => [
                        { artist: streamArtist, title: streamTitle, cover: albumCoverRef.current },
                        ...prev,
                     ].slice(0, RECENT_TRACKS_LIMIT));
                  }
                  fetchAlbumArt("", data.songTitle);
               }
               setStreamTitle(data.songTitle);
               tempDisplayTitle = data.songTitle;
            }
            setDisplayTitle(tempDisplayTitle);
         } catch (error) {
            console.error('Failed to fetch stream title:', error);
         }
      };
      fetchTitle();
      const intervalId = setInterval(fetchTitle, 5000);
      return () => clearInterval(intervalId);
   }, [mode, archiveName, streamTitle, streamArtist]);

   function shiftBody() {
      const padding = isVisible ? playerWrapper.current?.clientHeight + 'px' : '0';
      document.querySelector('body')?.style.setProperty('padding-bottom', padding);
   }

   const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(Number(event.target.value));
   };

   const toggleMute = () => {
      setVolume((current) => (current > 0 ? 0 : previousVolumeRef.current || 1));
   };

   const seekBy = (delta: number) => {
      const dur = duration || 0;
      const newTime = Math.max(0, Math.min((currentTime || 0) + delta, dur || Number.MAX_SAFE_INTEGER));
      updateCurrentTime(newTime);
   };

   useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
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

   if (!isClient) return null;

   const playerClasses = classNames(
      'fixed bottom-0 inset-x-0 w-full z-10 bg-[#2e2b2c] transition-transform duration-300 ease-in-out',
      {
         'translate-y-0': isVisible,
         'translate-y-[calc(100%-4px)]': !isVisible,
      }
   );

   const coverImage = mode === "archive" && archiveEpisodeCover
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${archiveEpisodeCover}`
      : (albumCover || "/images/03_TLIS_logo2020_white_no-bkg.svg");

   const title = mode === "archive" ? archiveName : streamTitle;
   const subtitle = mode === "archive" 
      ? archiveShowName || "Radio TLIS"
      : streamArtist || "Radio TLIS";

   return (
      <>
         <div ref={playerWrapper} className={playerClasses}>
            <motion.div
               ref={queuePanelRef}
               initial={false}
               animate={{ height: isQueueOpen ? "auto" : 0, opacity: isQueueOpen ? 1 : 0 }}
               transition={{ duration: 0.3, ease: "easeInOut" }}
               className={classNames(
                  "absolute bottom-full inset-x-0 bg-[#2e2b2c] shadow-2xl rounded-t-md overflow-hidden",
                  { "border-t border-white/10": isQueueOpen }
               )}
               style={{ pointerEvents: isQueueOpen ? "auto" : "none" }}
            >
               <div className="max-w-7xl mx-auto px-4 py-3 max-h-[50vh] overflow-y-auto">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 px-1 pb-2">
                     {t("recently_played")}
                  </p>
                  {recentTracks.length === 0 ? (
                     <p className="text-sm text-gray-400 px-1 pb-3">{t("recently_played_empty")}</p>
                  ) : (
                     <ul className="flex flex-col gap-1 pb-1">
                        {recentTracks.map((track, index) => (
                           <li
                              key={`${track.title}-${track.artist}-${index}`}
                              className="flex items-center gap-3 px-1 py-2 rounded-lg hover:bg-white/5"
                           >
                              <div className="w-10 h-10 flex-shrink-0 relative">
                                 <Image
                                    src={track.cover || "/images/03_TLIS_logo2020_white_no-bkg.svg"}
                                    alt={track.title}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover rounded shadow-sm"
                                 />
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm text-white truncate">{track.title}</p>
                                 <p className="text-xs text-gray-400 truncate">{track.artist || t("radio_tlis")}</p>
                              </div>
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            </motion.div>
            {mode === "archive" && (
               <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={updateCurrentTime}
                  isVisible={isVisible}
               />
            )}
            {mode === "stream" && (
               <div className="absolute top-0 left-0 w-full h-1 bg-[#d43c4a]" />
            )}
            <div className="max-w-7xl mx-auto flex items-center gap-3 p-3 pt-4">
               <div className="w-14 h-14 flex-shrink-0 relative">
                  <Image
                     src={coverImage}
                     alt={title || "Radio TLIS"}
                     width={56}
                     height={56}
                     className="w-full h-full object-cover rounded shadow-sm"
                  />
               </div>
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
                     <span suppressHydrationWarning>{subtitle}</span>
                     {mode === "archive" && duration > 0 && (
                        <>
                           <span>•</span>
                           <span suppressHydrationWarning>{getTimeFromMs(currentTime)} / {getTimeFromMs(duration)}</span>
                        </>
                     )}
                  </div>
               </div>
               <div className="flex items-center gap-2 flex-shrink-0">
                  <div className='hidden lg:block'>
                     <VolumeControl volume={volume} handleVolumeChange={handleVolumeChange} onToggleMute={toggleMute} />
                  </div>
                  <QueueButton isOpen={isQueueOpen} onClick={() => setIsQueueOpen((prev) => !prev)} label={t("recently_played")} />
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
         <SlideButton isVisible={isVisible} onClick={toggleVisibility} extraOffset={queuePanelHeight} />
      </>
   );
};

export default Player;