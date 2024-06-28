import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Navigation, A11y } from 'swiper/modules';
import { Swiper as SwiperClass } from 'swiper';

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
         slidesPerView={3}
         speed={1000} // Speed of the sliding movement in miliseconds
         centeredSlides={true}
         navigation
      >
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/448656717_1010263371099577_8325107832581048915_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=101&_nc_ohc=UTAdy22JjL4Q7kNvgFmw0W9&edm=AEhyXUkAAAAA&ccb=7-5&ig_cache_key=MzM5NTE0ODE1NzI2NzMxMTMzNg%3D%3D.2-ccb7-5&oh=00_AYBzTwmQUv4AfSTgXBAr1UA9xV-GGU5ObIQsyKIwdvrhjg&oe=668483B9&_nc_sid=8f1549" alt="Slide 1" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/444226405_994269226032325_125323137515081025_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=101&_nc_ohc=0Xv5nBCSliYQ7kNvgFFOnwi&edm=AEhyXUkAAAAA&ccb=7-5&ig_cache_key=MzM3ODQ3ODM4NTIxNzcwNzc5OA%3D%3D.2-ccb7-5&oh=00_AYAflZ2pCSxld8Gq3djumdJhasGl43DFO3IkD5Svadkx3A&oe=6684548F&_nc_sid=8f1549" alt="Slide 2" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/437539631_965390092253572_1835127043143057288_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=104&_nc_ohc=ZKRxg9PtGPMQ7kNvgHsNovb&edm=AFg4Q8wAAAAA&ccb=7-5&ig_cache_key=MzM0OTUxNzQ0NjA1Njc4MzY2NQ%3D%3D.2-ccb7-5&oh=00_AYDEFaGZqztH9axApwAfXCQ_hkmgu6-Lkrdaomdlh7Unag&oe=66847344&_nc_sid=0b30b7" alt="Slide 3" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent.cdninstagram.com/v/t39.30808-6/438086008_970463231746258_1894319194455648312_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=110&_nc_ohc=KzBOPeYWR2sQ7kNvgHRCb9Z&edm=APs17CUAAAAA&ccb=7-5&ig_cache_key=MzM1NTU4NzUwMDE2NjMwMzc5MA%3D%3D.2-ccb7-5&oh=00_AYBGO-aKnAoUfJff4Mb4tFKWRIMKzujDjw49esQnKd1n8w&oe=6681F356&_nc_sid=10d13b" alt="Slide 4" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/431486173_934386535353928_3756580517607962580_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=104&_nc_ohc=XhzN8mW7MKkQ7kNvgFOtCHn&edm=AFg4Q8wAAAAA&ccb=7-5&ig_cache_key=MzMxNzkyOTQwNjM2NDQ4ODYwOA%3D%3D.2-ccb7-5&oh=00_AYCo8avb9uXIUJLoawYE8TaoK7_R8h_zLDkyJT39xSW5vA&oe=6684542E&_nc_sid=0b30b7" alt="Slide 5" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/448656717_1010263371099577_8325107832581048915_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=101&_nc_ohc=UTAdy22JjL4Q7kNvgFmw0W9&edm=AEhyXUkAAAAA&ccb=7-5&ig_cache_key=MzM5NTE0ODE1NzI2NzMxMTMzNg%3D%3D.2-ccb7-5&oh=00_AYBzTwmQUv4AfSTgXBAr1UA9xV-GGU5ObIQsyKIwdvrhjg&oe=668483B9&_nc_sid=8f1549" alt="Slide 1" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/444226405_994269226032325_125323137515081025_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=101&_nc_ohc=0Xv5nBCSliYQ7kNvgFFOnwi&edm=AEhyXUkAAAAA&ccb=7-5&ig_cache_key=MzM3ODQ3ODM4NTIxNzcwNzc5OA%3D%3D.2-ccb7-5&oh=00_AYAflZ2pCSxld8Gq3djumdJhasGl43DFO3IkD5Svadkx3A&oe=6684548F&_nc_sid=8f1549" alt="Slide 2" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/437539631_965390092253572_1835127043143057288_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=104&_nc_ohc=ZKRxg9PtGPMQ7kNvgHsNovb&edm=AFg4Q8wAAAAA&ccb=7-5&ig_cache_key=MzM0OTUxNzQ0NjA1Njc4MzY2NQ%3D%3D.2-ccb7-5&oh=00_AYDEFaGZqztH9axApwAfXCQ_hkmgu6-Lkrdaomdlh7Unag&oe=66847344&_nc_sid=0b30b7" alt="Slide 3" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent.cdninstagram.com/v/t39.30808-6/438086008_970463231746258_1894319194455648312_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=110&_nc_ohc=KzBOPeYWR2sQ7kNvgHRCb9Z&edm=APs17CUAAAAA&ccb=7-5&ig_cache_key=MzM1NTU4NzUwMDE2NjMwMzc5MA%3D%3D.2-ccb7-5&oh=00_AYBGO-aKnAoUfJff4Mb4tFKWRIMKzujDjw49esQnKd1n8w&oe=6681F356&_nc_sid=10d13b" alt="Slide 4" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent-vie1-1.cdninstagram.com/v/t39.30808-6/431486173_934386535353928_3756580517607962580_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent-vie1-1.cdninstagram.com&_nc_cat=104&_nc_ohc=XhzN8mW7MKkQ7kNvgFOtCHn&edm=AFg4Q8wAAAAA&ccb=7-5&ig_cache_key=MzMxNzkyOTQwNjM2NDQ4ODYwOA%3D%3D.2-ccb7-5&oh=00_AYCo8avb9uXIUJLoawYE8TaoK7_R8h_zLDkyJT39xSW5vA&oe=6684542E&_nc_sid=0b30b7" alt="Slide 5" />
            <h2>Lorem ipsum</h2>
         </SwiperSlide>
      </Swiper>
   );
};

export default SwiperCarousel;
