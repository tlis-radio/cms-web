import React, { useState } from 'react';
import { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, A11y } from 'swiper/modules';
import krivko from "@/../public/images/whodba.jpg";
import dia from "@/../public/images/citanie_s_diou.jpg";
import eren from "@/../public/images/eren_radioshow.jpg";
import spachtla from "@/../public/images/okno_do_duse.jpg";
import kajo from "@/../public/images/zakutlisie_s_kajom.jpg";
import valcek from "@/../public/images/rozpravky_na_dobru_noc.jpg";

import 'swiper/css';
import 'swiper/css/navigation';

const SwiperCarousel: React.FC = () => {
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

   return (
      <>
      <h1 className='font-argentumSansMedium text-white text-2xl'>
         P R O G R A M
      </h1>
      <Swiper
         modules={[EffectCoverflow, Navigation, A11y]}
         effect='coverflow'
         onSwiper={setSwiperInstance}

         // Takes care of the scale changing
         coverflowEffect={{
            stretch: 0,
            rotate: 0,
            depth: 50,
            modifier: 8,
            slideShadows: false
         }}

         speed={1000} // Speed of the sliding movement in miliseconds
         centeredSlides={true}
         navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
            disabledClass: "swiper-button-disabled"
         }}
         breakpoints={
            {
               1: {
                  slidesPerView: 2,
                  spaceBetween: 6
               },
               640: {
                  slidesPerView: 3,
                  spaceBetween: 20
               },
            }
         }
      >
         <SwiperSlide>
            <img src={krivko.src} alt="Slide 1" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={dia.src} alt="Slide 2" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={eren.src} alt="Slide 3" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={spachtla.src} alt="Slide 4" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={kajo.src} alt="Slide 5" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={valcek.src} alt="Slide 6" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={krivko.src} alt="Slide 1" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={dia.src} alt="Slide 2" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={eren.src} alt="Slide 3" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={spachtla.src} alt="Slide 4" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={kajo.src} alt="Slide 5" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={valcek.src} alt="Slide 6" />
            <h2 className='font-sans text-white'>PIATOK 18_00</h2>
         </SwiperSlide>
         <div className='bg-red-950'>
            <div>
               <button className='swiper-button-prev'></button>
               <button className='swiper-button-next'></button>
            </div>
         </div>
      </Swiper>
      <div className='flex place-content-between'>
         <span className='font-argentumSansRegular text-white relative left-9
         xs:bottom-10
         md:bottom-3
         lg:left-[144px] 
         xl:left-[170px]
         2xl:bottom-1 2xl:left-[200px]'>
            Zmeškal si
         </span>
         <span className='font-argentumSansRegular text-white relative right-10
         xs:bottom-10
         md:bottom-3
         lg:right-[148px] 
         xl:right-[174px]
         2xl:bottom-1 2xl:right-[204px]'>
            Zmeškáš
         </span>
      </div>
      </>
   );
};

export default SwiperCarousel;
