"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useGallery } from "@/components/carousel/gallery/GalleryProvider";

interface ArticleGalleryProps {
   images: string[];
   initialVisibleCount?: number;
}

export default function ArticleGallery({ images, initialVisibleCount = 4 }: ArticleGalleryProps) {
   const [isExpanded, setIsExpanded] = useState(false);
   const { showImages, setOpen } = useGallery();

   if (!images || images.length === 0) {
      return null;
   }

   const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
   const visibleImages = isExpanded ? images : images.slice(0, initialVisibleCount);
   const hasMore = images.length > initialVisibleCount;

   const handleImageClick = (index: number) => {
      const fullImages = images.map((img) => `${DIRECTUS_URL}/assets/${img}?quality=90`);
      showImages(fullImages, index);
   };

   return (
      <div className="mb-8">
         <h3 className="text-white font-semibold mb-4 text-lg flex items-center gap-2">
            Galéria 
            <span className="text-gray-400 font-normal text-sm">({images.length} fotiek)</span>
         </h3>
         
         <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {visibleImages.map((image, index) => (
               <button
                  key={image}
                  onClick={() => handleImageClick(index)}
                  className="aspect-square overflow-hidden rounded bg-gray-800 hover:opacity-90 transition-opacity cursor-pointer"
               >
                  <img
                     src={`${DIRECTUS_URL}/assets/${image}?width=200&height=200&fit=cover&quality=80`}
                     alt={`Galéria obrázok ${index + 1}`}
                     className="w-full h-full object-cover"
                     loading="lazy"
                  />
               </button>
            ))}
         </div>

         {hasMore && (
            <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="mt-4 flex items-center gap-2 text-[#d43c4a] hover:text-[#f05561] transition-colors mx-auto"
            >
               <FontAwesomeIcon icon={isExpanded ? faChevronUp : faChevronDown} className="w-4 h-4" />
               {isExpanded ? "Zobraziť menej" : `Zobraziť všetky (${images.length})`}
            </button>
         )}
      </div>
   );
}
