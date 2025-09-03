"use client";

import React, { useState } from "react";
import { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, A11y } from "swiper/modules";
import krivko from "@/../public/images/whodba.jpg";
import dia from "@/../public/images/citanie_s_diou.jpg";
import eren from "@/../public/images/eren_radioshow.jpg";
import spachtla from "@/../public/images/okno_do_duse.jpg";
import kajo from "@/../public/images/zakutlisie_s_kajom.jpg";
import valcek from "@/../public/images/rozpravky_na_dobru_noc.jpg";

import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import TlisImage from "../TlisImage";

function SwiperCarousel({ carouselPosts, loadingError }: { carouselPosts: any, loadingError?: boolean }) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);

  /*const handleSlideChange = (swiper: SwiperClass) => {
      console.log('slide changing');
      
      // Remove 'active' class from all slides
      swiper.slides.forEach(slide => {
         slide.classList.remove('active');
      });
   
      // Add 'active' class to the active slide
      swiper.slides[swiper.activeIndex].classList.add('active');
   };*/

  function getDate(dateString: string) {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("sk-SK", options).replace(/\//g, ".").toUpperCase();
  }

  const createProgramLinks = () => {
    return carouselPosts.map((program: any, index: number) => {
      return (
        <SwiperSlide key={index}>
          <TlisImage src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${program.Cover}`} alt={program.Title} />
          <h2 className="font-sans text-white pt-3">{getDate(program.Date)}</h2>
        </SwiperSlide>
      );
    });
  };

  if (loadingError) {
    return <div className="relative py-8">
      <h3 className="font-argentumSansMedium text-xl mb-3 text-white">Chyba pri načítaní programu</h3>
      <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
    </div>
  }

  return (
    <>
      {carouselPosts.length > 0 ? (
        <Swiper
          modules={[EffectCoverflow, Navigation, A11y]}
          effect="coverflow"
          onSwiper={setSwiperInstance}
          // Takes care of the scale changing
          coverflowEffect={{
            stretch: 0,
            rotate: 0,
            depth: 50,
            modifier: 8,
            slideShadows: false,
          }}
          speed={1000} // Speed of the sliding movement in miliseconds
          centeredSlides={true}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
            disabledClass: "swiper-button-disabled",
          }}
          breakpoints={{
            1: {
              slidesPerView: 2,
              spaceBetween: 6,
            },
            640: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          }}
        >
          {
            /**
             ** creating Program slides (Later they will coded to be links to the specific show)
             */
            createProgramLinks()
          }

          {carouselPosts.length > 1 ?
          <div className="relative w-full sm:absolute sm:top-1/2 sm:-translate-y-1/2 z-10 pointer-events-none">
            <div className="relative h-[100px] flex justify-between px-[2rem]">
              <div className="relative h-[100px] flex items-center flex-col gap-3 pointer-events-auto">
                <button className="swiper-button-prev"></button>
                <span className="font-argentumSansRegular text-white relative uppercase mt-2">Zmeškal si</span>
              </div>
              <div className="relative h-[100px] flex items-center flex-col gap-3 pointer-events-auto">
                <button className="swiper-button-next"></button>
                <span className="font-argentumSansRegular text-white relative uppercase mt-2">Zmeškáš</span>
              </div>
            </div>
          </div> : null}

        </Swiper>) : (
        <div className="relative py-8">
          <h3 className="font-argentumSansMedium text-xl mb-3 text-white">Momentálne nie je žiadny program</h3>
          <p className="text-gray-200 mb-4">Pozrite si náš archív minulých relácií</p>
          <Link
            href="/relacie"
            className="inline-block bg-[#d43c4a] hover:bg-[#b83744] text-white px-6 py-2 rounded-full transition-colors"
          >
            Otvoriť archív
          </Link>
        </div>
      )}
    </>
  );
};

export default SwiperCarousel;
