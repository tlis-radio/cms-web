"use client";
import React from "react";
import Link from "next/link";
import { Article } from "@/types/article";
import { Episode } from "@/models/episode";
import { ShowDto } from "@/types/show";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleContent from "@/components/ArticleContent";
import ArticleGallery from "@/components/ArticleGallery";
import TableOfContents from "@/components/TableOfContents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faMapMarkerAlt, faUser, faClock } from "@fortawesome/free-solid-svg-icons";

interface ArticleDetailProps {
   article: Article;
   episodes: Map<number, Episode>;
   episodeShows: Map<number, ShowDto>;
   galleryImages: string[];
}

export default function ArticleDetail({ article, episodes, episodeShows, galleryImages }: ArticleDetailProps) {
   const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";

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

   const breadcrumbs = [
      { label: "Články", href: "/clanky" },
      { label: article.title, href: `/clanky/${article.slug}` }
   ];

   const isEvent = article.type === "event" || article.type === "report";
   const hasGallery = galleryImages.length > 0;

   return (
      <div className="w-full">
         {/* Cover Image Hero */}
         <div className="relative w-full max-w-7xl mx-auto mb-8">
            {article.cover_image ? (
               <div className="relative aspect-[21/9] sm:aspect-[21/7] w-full overflow-hidden rounded-lg">
                  <img
                     src={`${DIRECTUS_URL}/assets/${article.cover_image}?width=1400&quality=85`}
                     alt={article.title}
                     className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                     {/* Breadcrumbs on cover */}
                     <div className="mb-4">
                        <Breadcrumbs items={breadcrumbs} className="text-gray-300" />
                     </div>

                     {/* Categories */}
                     {article.categories && article.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                           {article.categories.map((cat) => (
                              <Link
                                 key={cat.id}
                                 href={`/kategorie/${cat.Article_Category_id.slug}`}
                                 className="bg-[#d43c4a] text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-[#b83744] transition-colors"
                              >
                                 {cat.Article_Category_id.name}
                              </Link>
                           ))}
                        </div>
                     )}

                     {/* Title */}
                     <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 text-left">
                        {article.title}
                     </h1>

                     {/* Meta info */}
                     <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                        {article.published_at && (
                           <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                              {formatDate(article.published_at)}
                           </span>
                        )}
                        {article.author && (
                           <Link 
                              href={`/ucinkujuci/${article.author.Slug}`}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                           >
                              <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                              {article.author.Name}
                           </Link>
                        )}
                        {isEvent && article.event_time && (
                           <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 text-[#d43c4a]" />
                              {formatEventTime(article.event_time)}
                           </span>
                        )}
                        {isEvent && article.event_place && (
                           <span className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 text-[#d43c4a]" />
                              {article.event_place}
                           </span>
                        )}
                     </div>

                     {/* Description */}
                     {article.description && (
                        <p className="mt-4 text-gray-300 text-left max-w-3xl">
                           {article.description}
                        </p>
                     )}
                  </div>
               </div>
            ) : (
               <div className="px-8">
                  <Breadcrumbs items={breadcrumbs} className="mb-4" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-left">
                     {article.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                     {article.published_at && (
                        <span className="flex items-center gap-1">
                           <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                           {formatDate(article.published_at)}
                        </span>
                     )}
                     {article.author && (
                        <Link 
                           href={`/ucinkujuci/${article.author.Slug}`}
                           className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                           <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                           {article.author.Name}
                        </Link>
                     )}
                  </div>
                  {article.description && (
                     <p className="text-gray-300 text-left mb-6">{article.description}</p>
                  )}
               </div>
            )}
         </div>

         {/* Main Content Area */}
         <div className="max-w-7xl mx-auto px-4 sm:px-8">
            {/* Gallery (if report) */}
            {hasGallery && (
               <ArticleGallery images={galleryImages} initialVisibleCount={4} />
            )}

            {/* Content with sidebar */}
            <div className="flex flex-col lg:flex-row gap-8">
               {/* Main content - 9/12 */}
               <div className="lg:w-9/12">
                  {article.content && (
                     <ArticleContent content={article.content} episodes={episodes} episodeShows={episodeShows} />
                  )}
               </div>

               {/* Sidebar - 3/12 */}
               <aside className="lg:w-3/12">
                  {/* Author card */}
                  {article.author && (
                     <div className="bg-[#1c1c1c] rounded-lg p-4 mb-6">
                        <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
                           Autor
                        </h4>
                        <Link 
                           href={`/ucinkujuci/${article.author.Slug}`}
                           className="flex items-center gap-3 group"
                        >
                           <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                              {article.author.Name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-white font-medium group-hover:text-[#d43c4a] transition-colors">
                                 {article.author.Name}
                              </p>
                           </div>
                        </Link>
                     </div>
                  )}

                  {/* Table of Contents */}
                  {article.content && (
                     <div className="bg-[#1c1c1c] rounded-lg p-4">
                        <TableOfContents content={article.content} />
                     </div>
                  )}
               </aside>
            </div>
         </div>
      </div>
   );
}
