"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Link from "next/link";

function ProgramCarousel({
  carouselPosts,
  loadingError,
}: {
  carouselPosts: any;
  loadingError?: boolean;
}) {
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

  const getDate = (dateString: string) => {
    const date = new Date(dateString);

    const datePart = date.toLocaleDateString("sk-SK", {
      day: "2-digit",
      month: "2-digit",
    });

    const timePart = date.toLocaleTimeString("sk-SK", {
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
      // Swiped right - go to previous
      handlePrevious();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left - go to next
      handleNext();
    }
  };

  const handleEpisodeClick = (episodeId: number) => {
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track("Program Episode Click", { episodeId });
    }
  };

  const getVisibleSlides = () => {
    if (carouselPosts.length === 0) return [];
    if (carouselPosts.length === 1)
      return [{ ...carouselPosts[0], position: 0 }];

    const currentEpisode = carouselPosts[currentIndex];
    const slides = [];

    // Show previous slide only if not at the beginning
    if (currentIndex > 0) {
      slides.push({ ...carouselPosts[currentIndex - 1], position: -1 });
    }

    // Always show current slide
    slides.push({ ...currentEpisode, position: 0 });

    // Show next slide only if not at the end
    if (currentIndex < carouselPosts.length - 1) {
      slides.push({ ...carouselPosts[currentIndex + 1], position: 1 });
    }

    return slides;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.6,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.6,
    }),
  };

  if (loadingError) {
    return (
      <div className="relative py-8">
        <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
          Chyba pri načítaní programu
        </h3>
        <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
      </div>
    );
  }

  if (carouselPosts.length === 0) {
    return (
      <div className="relative py-8">
        <h3 className="font-argentumSansLight text-xl mb-3 text-white">
          Momentálne nie je žiadny program
        </h3>
        <p className="text-gray-200 mb-4">
          Pozrite si náš archív minulých relácií
        </p>
        <Link
          href="/relacie"
          className="inline-block bg-[#d43c4a] hover:bg-[#b83744] text-white px-6 py-2 rounded-full transition-colors"
        >
          Otvoriť archív
        </Link>
      </div>
    );
  }

  const visibleSlides = getVisibleSlides();

  return (
    <div className="relative w-full py-8">
      <div className="relative flex items-center justify-center min-h-[400px] sm:min-h-[500px]">
        {/* Carousel Container */}
        <div className="relative w-full max-w-7xl mx-auto px-4 overflow-hidden">
          <motion.div
            className="relative h-[350px] sm:h-[450px] flex items-center justify-center cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence initial={false} custom={direction}>
              {visibleSlides.map((slide, idx) => {
                const scale = slide.position === 0 ? 1 : 0.7;
                const zIndex = slide.position === 0 ? 10 : 1;
                const opacity = slide.position === 0 ? 1 : 0.4;
                
                // Responsive offset: closer on mobile, further on desktop
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
                const baseOffset = isMobile ? 160 : 280;
                const xOffset =
                  slide.position === -1 ? -baseOffset : slide.position === 1 ? baseOffset : 0;

                return (
                  <motion.div
                    key={`${slide.id}-${currentIndex}-${slide.position}`}
                    custom={direction}
                    initial={{ opacity: 0, scale: 0.6, x: xOffset }}
                    animate={{
                      opacity,
                      scale,
                      x: xOffset,
                      zIndex,
                    }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className="absolute"
                    style={{
                      pointerEvents: slide.position === 0 ? "auto" : "none",
                    }}
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
                        {slide.position === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        )}
                      </motion.div>
                      <motion.h2
                        className="font-argentumSansLight text-white text-lg sm:text-xl pt-3 font-bold text-center select-none"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: slide.position === 0 ? 1 : 0.5,
                          y: 0,
                        }}
                        transition={{ delay: 0.2 }}
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

        {/* Navigation Buttons */}
        {carouselPosts.length > 1 && (
          <div className="font-argentumSansLight absolute top-1/2 -translate-y-1/2 w-full max-w-7xl px-4 sm:px-8 pointer-events-none z-20 hidden sm:block">
            <div className="flex justify-between items-center">
              <motion.div
                className="flex flex-col items-center gap-2 pointer-events-auto"
                whileHover={currentIndex > 0 ? { scale: 1.1 } : {}}
                whileTap={currentIndex > 0 ? { scale: 0.95 } : {}}
              >
                <button
                  onClick={handlePrevious}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-colors touch-none ${
                    currentIndex > 0
                      ? "bg-[#d43c4a] hover:bg-[#b83744]"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  aria-label="Previous episode"
                  disabled={currentIndex === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </button>
                <span className="text-white uppercase font-bold text-sm sm:text-base">
                  Zmeškal si
                </span>
              </motion.div>

              <motion.div
                className="flex flex-col items-center gap-2 pointer-events-auto"
                whileHover={currentIndex < carouselPosts.length - 1 ? { scale: 1.1 } : {}}
                whileTap={currentIndex < carouselPosts.length - 1 ? { scale: 0.95 } : {}}
              >
                <button
                  onClick={handleNext}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-white shadow-lg transition-colors touch-none ${
                    currentIndex < carouselPosts.length - 1
                      ? "bg-[#d43c4a] hover:bg-[#b83744]"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                  aria-label="Next episode"
                  disabled={currentIndex === carouselPosts.length - 1}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
                <span className="text-white uppercase font-bold text-sm sm:text-base">
                  Zmeškáš
                </span>
              </motion.div>
            </div>
          </div>
        )}

        {/* Indicator Dots */}
        {carouselPosts.length > 1 && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {carouselPosts.map((_: any, idx: number) => (
              <motion.button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-[#d43c4a] w-8"
                    : "bg-gray-400 hover:bg-gray-300"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramCarousel;
