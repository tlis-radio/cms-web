"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl"; // Added imports
import { UmamiTrack } from "@/components/Analytics";

function ProgramCarousel({
  carouselPosts,
  loadingError,
}: {
  carouselPosts: any;
  loadingError?: boolean;
}) {
  const t = useTranslations("ProgramCarousel"); // Hook for text
  const locale = useLocale(); // Hook for date formatting
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const getNextEventIndex = () => {
    const now = new Date();

    for (let i = 0; i < carouselPosts.length; i++) {
      const eventDate = new Date(carouselPosts[i].Date);
      if (eventDate > now) {
        return i;
      }
    }

    return 0;
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
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < carouselPosts.length - 1) {
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

  return (
    <div className="relative w-full py-2">
      <div className="relative flex items-center justify-center">
        <div className="relative w-full max-w-7xl mx-auto px-4 overflow-hidden">
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
                
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
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
                          className="w-full h-auto object-cover select-none"
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