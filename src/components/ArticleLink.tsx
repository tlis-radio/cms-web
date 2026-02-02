'use client'
import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import Link from 'next/link';
import TlisImage from "@/components/TlisImage";
import { Article } from "@/types/article";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faImages } from "@fortawesome/free-solid-svg-icons";

type ArticleLinkProps = {
   article: Article;
}

const ArticleLink: FunctionComponent<ArticleLinkProps> = ({ article }) => {
   const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
   const descriptionRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function checkOverflow() {
         if (descriptionRef.current) {
            setIsDescriptionOverflowing(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
         }
      }

      checkOverflow();
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
   }, []);

   const formatDate = (dateString?: string) => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString("sk-SK", {
         day: "numeric",
         month: "long",
         year: "numeric"
      });
   };

   const formatEventTime = (dateString?: string) => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString("sk-SK", {
         day: "numeric",
         month: "long",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit"
      });
   };

   const hasGallery = article.gallery && article.gallery.length > 0;
   const isEvent = article.type === "event" || article.type === "report";

   return (
      <Link 
         href={`/clanky/${article.slug}`} 
         className="bg-[#1c1c1c] text-white flex cursor-pointer flex-col gap-4 border-b-2 p-4 group hover:bg-[#111] transition-colors duration-200 sm:flex-row items-start"
      >
         <div className="sm:w-48 w-full flex-shrink-0 relative">
            {article.thumbnail_image ? (
               <TlisImage src={article.thumbnail_image} alt={article.title} />
            ) : (
               <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-500">Bez obrázka</span>
               </div>
            )}
            {hasGallery && (
               <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded flex items-center gap-1">
                  <FontAwesomeIcon icon={faImages} className="w-3 h-3 text-[#d43c4a]" />
                  <span className="text-xs">{article.gallery!.length}</span>
               </div>
            )}
         </div>

         <div className="flex flex-col gap-2 text-left flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
               {article.published_at && (
                  <span>{formatDate(article.published_at)}</span>
               )}
               {article.categories && article.categories.length > 0 && (
                  <>
                     <span>•</span>
                     {article.categories.map((cat, idx) => (
                        <React.Fragment key={cat.id}>
                           <Link 
                              href={`/kategorie/${cat.Article_Category_id.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[#d43c4a] hover:text-[#f05561] transition-colors underline decoration-dotted"
                           >
                              {cat.Article_Category_id.name}
                           </Link>
                           {idx < article.categories!.length - 1 && ", "}
                        </React.Fragment>
                     ))}
                  </>
               )}
            </div>

            <h2 className="font-argentumSansBold text-2xl font-bold">{article.title}</h2>

            {isEvent && (
               <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                  {article.event_time && (
                     <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-[#d43c4a]" />
                        {formatEventTime(article.event_time)}
                     </span>
                  )}
                  {article.event_place && (
                     <span className="flex items-center gap-1">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-[#d43c4a]" />
                        {article.event_place}
                     </span>
                  )}
               </div>
            )}

            {article.author && (
               <div className="font-argentumSansLight text-sm text-gray-400">
                  Autor:{" "}
                  <Link
                     href={`/ucinkujuci/${article.author.Slug}`}
                     onClick={(e) => e.stopPropagation()}
                     className="text-white hover:text-[#d43c4a] transition-colors underline decoration-dotted font-bold"
                  >
                     {article.author.Name}
                  </Link>
               </div>
            )}

            {article.description && (
               <div className="relative">
                  <div 
                     ref={descriptionRef} 
                     className="text-justify font-argentumSansLight max-h-[80px] overflow-hidden text-overflow-ellipsis text-gray-300"
                  >
                     {article.description}
                  </div>
                  {isDescriptionOverflowing && (
                     <div className="w-full absolute bottom-0 h-10 bg-gradient-to-b from-transparent to-[#1C1C1C] group-hover:to-[#111111] transition-colors duration-200" />
                  )}
               </div>
            )}
         </div>
      </Link>
   );
}

export default ArticleLink;
