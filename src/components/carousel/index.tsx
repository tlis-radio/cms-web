"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Link } from "@/navigation";
import { useTranslations, useLocale } from "next-intl"; // Added imports
import { UmamiTrack } from "@/components/Analytics";
import { usePlayer } from "@/context/PlayerContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faChevronLeft, faChevronRight, faSpinner } from "@fortawesome/free-solid-svg-icons";

function ProgramCarousel({
  carouselPosts,
  loadingError,
  compact = false,
  isFallback = false,
}: {
  carouselPosts: any;
  loadingError?: boolean;
  compact?: boolean;
  isFallback?: boolean;
}) {
  const t = useTranslations("ProgramCarousel"); // Hook for text
  const locale = useLocale(); // Hook for date formatting
  const {
    setMode,
    setArchiveName,
    setArchiveShowName,
    setArchiveEpisodeCover,
    setArchiveMetadata,
    setSrc,
    setArchiveEpisodeId,
  } = usePlayer();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isCoverLoading, setIsCoverLoading] = useState(true);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 640);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    setIsCoverLoading(true);
  }, [carouselPosts[currentIndex]?.Cover]);

  const getNextEventIndex = () => {
    const now = new Date();

    for (let i = 0; i < carouselPosts.length; i++) {
      const eventDate = new Date(carouselPosts[i].Date);
      if (eventDate > now) {
        return i;
      }
    }

    // No upcoming episode - default to the newest (last, since carouselPosts
    // is sorted oldest-to-newest) rather than the oldest.
    return carouselPosts.length - 1;
  };

  useEffect(() => {
    if (carouselPosts.length > 0) {
      setCurrentIndex(getNextEventIndex());
    }
  }, [carouselPosts]);

  // Updated to use the active locale
  const getDate = (dateString: string) => {
    const date = new Date(dateString);

    const datePart = date.toLocaleDateString(locale === 'sk' ? "sk-SK" : "en-US", {
      day: "2-digit",
      month: "2-digit",
    });

    const timePart = date.toLocaleTimeString(locale === 'sk' ? "sk-SK" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${datePart} | ${timePart.replace(":", "_")}`.toUpperCase();
  };

  const isPastEpisode = (episodeDate: string) => {
    return new Date(episodeDate) < new Date();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      UmamiTrack("carousel_swipe", { action: "previous", currentIndex });
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < carouselPosts.length - 1) {
      UmamiTrack("carousel_swipe", { action: "next", currentIndex });
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const swipeThreshold = 50;

    if (info.offset.x > swipeThreshold) {
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold) {
      handleNext();
    }
  };

  const handleEpisodeClick = (episodeId: number) => {
    UmamiTrack("Program Episode Click", { episodeId });
  };

  const playEpisode = (episode: any) => {
    UmamiTrack("Program Episode Play", { episodeId: episode.id });
    setMode("archive");
    setArchiveName(episode.Title);
    setArchiveShowName(episode.showData?.Title || "");
    setArchiveEpisodeCover(episode.Cover);
    setArchiveMetadata({
      author: episode.showData?.Title || "",
      album: episode.showData?.Title || "",
      image: episode.Cover,
    });
    setSrc(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio?.id || episode.Audio}`);
    setArchiveEpisodeId(episode.id);
  };

  const getVisibleSlides = () => {
    if (carouselPosts.length === 0) return [];
    if (carouselPosts.length === 1)
      return [{ ...carouselPosts[0], position: 0 }];

    const slides = [];
    if (currentIndex > 0) {
      slides.push({ ...carouselPosts[currentIndex - 1], position: -1 });
    }
    slides.push({ ...carouselPosts[currentIndex], position: 0 });
    if (currentIndex < carouselPosts.length - 1) {
      slides.push({ ...carouselPosts[currentIndex + 1], position: 1 });
    }

    return slides;
  };

  if (loadingError) {
    return (
      <div className="relative py-8">
        <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
          {t('fetch_error_title')}
        </h3>
        <p className="text-gray-200 mb-4">{t('fetch_error_subtitle')}</p>
      </div>
    );
  }

  if (carouselPosts.length === 0) {
    return (
      <div className="relative py-8">
        <h3 className="font-argentumSansLight text-xl mb-3 text-white">
          {t('empty_title')}
        </h3>
        <p className="text-gray-200 mb-4">
          {t('empty_subtitle')}
        </p>
        <Link
          href="/relacie"
          className="inline-block bg-[#d43c4a] hover:bg-[#b83744] text-white px-6 py-2 rounded-full transition-colors"
        >
          {t('open_archive')}
        </Link>
      </div>
    );
  }

  const visibleSlides = getVisibleSlides();

  if (compact) {
    const activeEpisode = carouselPosts[currentIndex];
    const hasAudio = activeEpisode?.Audio && (activeEpisode.Audio.id || activeEpisode.Audio);

    return (
      <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-full min-w-0 rounded-lg overflow-hidden shadow-lg bg-[#1c1c1c]">
        <Link
          href={`/relacie/${activeEpisode.showData?.Slug}?programEpisode=${activeEpisode.id}`}
          onClick={() => handleEpisodeClick(activeEpisode.id)}
          className="absolute inset-0 block group"
        >
          <img
            key={activeEpisode.Cover}
            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${activeEpisode.Cover}`}
            alt={activeEpisode.Title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            draggable="false"
            onLoad={() => setIsCoverLoading(false)}
            onError={() => setIsCoverLoading(false)}
          />
          {isCoverLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1c1c1c] z-10">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-white text-3xl" />
            </div>
          )}
          {isFallback && (
            <span className="absolute top-0 left-0 bg-[#d43c4a] text-white text-xs uppercase font-bold px-3 py-1 rounded-br-lg shadow-md">
              {t('missed_label')}
            </span>
          )}
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col text-left">
          <h3 className="font-argentumSansBold text-white text-lg line-clamp-2 mb-1 drop-shadow">{activeEpisode.Title}</h3>
          <p className="text-gray-200 text-sm mb-4 drop-shadow">[ {getDate(activeEpisode.Date)} ]</p>
          <div className="flex items-center gap-3">
            {hasAudio && (
              <button
                onClick={() => playEpisode(activeEpisode)}
                aria-label="Play episode"
                className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-[#d43c4a] hover:bg-[#b83744] text-white transition-colors"
              >
                <FontAwesomeIcon icon={faPlay} className="ml-0.5" />
              </button>
            )}
            <Link
              href={`/relacie/${activeEpisode.showData?.Slug}`}
              className="flex-shrink-0 h-11 px-4 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-argentumSansBold transition-colors"
            >
              {t('open_show')}
            </Link>
            {carouselPosts.length > 1 && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  aria-label={t('prev_aria')}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-white transition-colors ${currentIndex > 0 ? "bg-white/10 hover:bg-white/20" : "bg-white/5 cursor-not-allowed opacity-40"}`}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === carouselPosts.length - 1}
                  aria-label={t('next_aria')}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-white transition-colors ${currentIndex < carouselPosts.length - 1 ? "bg-white/10 hover:bg-white/20" : "bg-white/5 cursor-not-allowed opacity-40"}`}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full py-2 overflow-hidden">
      <div className="relative flex items-center justify-center">
        <div className="relative w-full max-w-7xl mx-auto px-4">
          <motion.div
            className="relative h-[350px] sm:h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction}>
              {visibleSlides.map((slide) => {
                const scale = slide.position === 0 ? 1 : 0.7;
                const zIndex = slide.position === 0 ? 10 : 1;
                const opacity = slide.position === 0 ? 1 : 0.4;
                
                const baseOffset = isMobile ? 160 : 280;
                const xOffset = slide.position === -1 ? -baseOffset : slide.position === 1 ? baseOffset : 0;

                return (
                  <motion.div
                    key={`${slide.id}-${currentIndex}-${slide.position}`}
                    custom={direction}
                    initial={{ opacity: 0, scale: 0.6, x: xOffset }}
                    animate={{ opacity, scale, x: xOffset, zIndex }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute"
                    style={{ pointerEvents: slide.position === 0 ? "auto" : "none" }}
                  >
                    <Link
                      href={`/relacie/${slide.showData?.Slug}?programEpisode=${slide.id}`}
                      onClick={() => handleEpisodeClick(slide.id)}
                      className="flex flex-col items-center group"
                    >
                      <motion.div
                        whileHover={slide.position === 0 ? { scale: 1.05 } : {}}
                        transition={{ duration: 0.3 }}
                        className="relative w-[250px] sm:w-[350px] overflow-hidden rounded-lg shadow-2xl"
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${slide.Cover}`}
                          alt={slide.Title}
                          className="w-full h-auto object-cover select-none aspect-square"
                          draggable="false"
                        />
                      </motion.div>
                      <motion.h2
                        className="font-argentumSansLight text-white text-lg sm:text-xl pt-3 font-bold text-center select-none"
                        animate={{ opacity: slide.position === 0 ? 1 : 0.5, y: 0 }}
                      >
                        [ {getDate(slide.Date)} ]
                      </motion.h2>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>

        {carouselPosts.length > 1 && (
          <div className="font-argentumSansLight absolute top-1/2 -translate-y-1/2 w-full max-w-7xl px-4 sm:px-8 pointer-events-none z-10 hidden sm:block">
            <div className="flex justify-between items-center">
              <motion.div className="flex flex-col items-center gap-2 pointer-events-auto">
                <button
                  onClick={handlePrevious}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-colors ${
                    currentIndex > 0 ? "bg-[#d43c4a] hover:bg-[#b83744]" : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  disabled={currentIndex === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-white uppercase font-bold text-sm sm:text-base">
                  {t('missed_label')}
                </span>
              </motion.div>

              <motion.div className="flex flex-col items-center gap-2 pointer-events-auto">
                <button
                  onClick={handleNext}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-colors ${
                    currentIndex < carouselPosts.length - 1 ? "bg-[#d43c4a] hover:bg-[#b83744]" : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  disabled={currentIndex === carouselPosts.length - 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
                <span className="text-white uppercase font-bold text-sm sm:text-base">
                  {t('will_miss_label')}
                </span>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramCarousel;