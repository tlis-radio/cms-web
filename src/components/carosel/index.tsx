import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';


const SwiperCarousel: React.FC = () => {
   return (
      <Swiper
         modules={[Navigation, Pagination, Scrollbar, A11y]}
         spaceBetween={10}
         slidesPerView={3}
         centeredSlides={true}
         navigation
         pagination={{dynamicBullets: true, clickable: true }}
         onSwiper={(swiper) => console.log(swiper)}
         onSlideChange={() => console.log('slide change')}
      >
         <SwiperSlide>
            <img src="https://scontent.cdninstagram.com/v/t39.30808-6/444226405_994269226032325_125323137515081025_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=101&_nc_ohc=9Gs0cx1mHygQ7kNvgHkWY0O&edm=APs17CUAAAAA&ccb=7-5&ig_cache_key=MzM3ODQ3ODM4NTIxNzcwNzc5OA%3D%3D.2-ccb7-5&oh=00_AYBcEpzfHpZFarZw1Vn-AjrpGGx0BtfPTLmJKS-o9641zQ&oe=667E2D8F&_nc_sid=10d13b" alt="Slide 1" />
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://scontent.cdninstagram.com/v/t39.30808-6/438094737_970461668413081_9008734142533829834_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=scontent.cdninstagram.com&_nc_cat=101&_nc_ohc=bY5AKJlTlOkQ7kNvgE_IuEA&edm=APs17CUAAAAA&ccb=7-5&ig_cache_key=MzM1NDU2MDcwMjk3ODk1OTgyNg%3D%3D.2-ccb7-5&oh=00_AYDuj8O3RK-Tto34HxjqjDP8zIkqOgpHPEYY7m2EvlomAQ&oe=667E30E0&_nc_sid=10d13b" alt="Slide 2" />
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://instagram.fbts3-1.fna.fbcdn.net/v/t39.30808-6/437539631_965390092253572_1835127043143057288_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=instagram.fbts3-1.fna.fbcdn.net&_nc_cat=104&_nc_ohc=mcWm9G8ZhmQQ7kNvgFKeMUk&edm=AFg4Q8wAAAAA&ccb=7-5&ig_cache_key=MzM0OTUxNzQ0NjA1Njc4MzY2NQ%3D%3D.2-ccb7-5&oh=00_AYD8lOPN5cBKkJ6dno9RGhDyKuvNXdRHl_fauovYrfOMDQ&oe=667E1404&_nc_sid=cf751b" alt="Slide 3" />
         </SwiperSlide>
         <SwiperSlide>
            <img src="https://instagram.fbts3-1.fna.fbcdn.net/v/t39.30808-6/431486173_934386535353928_3756580517607962580_n.jpg?stp=dst-jpg_e35&efg=eyJ2ZW5jb2RlX3RhZyI6ImltYWdlX3VybGdlbi4xMDgweDEwODAuc2RyLmYzMDgwOCJ9&_nc_ht=instagram.fbts3-1.fna.fbcdn.net&_nc_cat=104&_nc_ohc=RQrQokJglF8Q7kNvgGL4wxD&edm=AFg4Q8wAAAAA&ccb=7-5&ig_cache_key=MzMxNzkyOTQwNjM2NDQ4ODYwOA%3D%3D.2-ccb7-5&oh=00_AYA82iQf6E6y2qihuR6Yl-4Ok1N-6rc43ftzdFN3FG_1cg&oe=667E2D2E&_nc_sid=cf751b" alt="Slide 4" />
         </SwiperSlide>
      </Swiper>
   );
};

export default SwiperCarousel;
