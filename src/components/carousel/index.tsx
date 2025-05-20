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

function SwiperCarousel({ carouselPosts }: { carouselPosts: any }) {
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
          <img src={`https://directus.tlis.sk/assets/${program.Cover}`} alt={program.Title} />
          <h2 className="font-sans text-white pt-3">{getDate(program.Date)}</h2>
        </SwiperSlide>
      );
    });
  };

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


          <div className="relative">
            <div className="relative h-[100px] flex justify-between px-[2rem]">
              <div className="relative h-[100px] flex items-center flex-col gap-3">
                <button className="swiper-button-prev"></button>
                <span className="font-argentumSansRegular text-white relative">Zmeškal si</span>
              </div>
              <div className="relative h-[100px] flex items-center flex-col gap-3">
                <button className="swiper-button-next"></button>
                <span className="font-argentumSansRegular text-white relative">Zmeškáš</span>
              </div>
            </div>
          </div>

        </Swiper>) : (
        <div className="relative pb-8">
          {/* placeholder ked nemame relaciu */}
          <img src="/images/tlisaci.jpg" alt="Žiadne nastávajúce relácie"></img>
        </div>
      )}
    </>
  );
};

export default SwiperCarousel;
