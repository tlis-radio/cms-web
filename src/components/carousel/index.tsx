import React, { useState } from 'react';
import { Swiper as SwiperClass } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, A11y } from 'swiper/modules';
import krivko from '../../../public/whodba.jpg';
import dia from '../../../public/citanie_s_diou.jpg';
import eren from '../../../public/eren_radioshow.jpg';
import spachtla from '../../../public/okno_do_duse.jpg';
import kajo from '../../../public/zakutlisie_s_kajom.jpg';
import valcek from '../../../public/rozpravky_na_dobru_noc.jpg';
import { isMobile } from 'react-device-detect';

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

         spaceBetween={6}
         slidesPerView={isMobile ? 2 : 3}
         speed={1000} // Speed of the sliding movement in miliseconds
         centeredSlides={true}
         navigation
      >
         <SwiperSlide>
            <img src={krivko.src} alt="Slide 1" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={dia.src} alt="Slide 2" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={eren.src} alt="Slide 3" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={spachtla.src} alt="Slide 4" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={kajo.src} alt="Slide 5" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={valcek.src} alt="Slide 6" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={krivko.src} alt="Slide 1" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={dia.src} alt="Slide 2" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={eren.src} alt="Slide 3" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={spachtla.src} alt="Slide 4" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={kajo.src} alt="Slide 5" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src={valcek.src} alt="Slide 6" />
            <h2 className='font-sans'>PIATOK 18_00</h2>
         </SwiperSlide>
      </Swiper>
   );
};

export default SwiperCarousel;
