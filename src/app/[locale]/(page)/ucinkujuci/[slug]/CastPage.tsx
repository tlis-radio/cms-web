"use client";
import React from "react";
import ShowLink from "@/components/pagination/show-link";
import ArticleLink from "@/components/ArticleLink";
import { Show } from "@/models/show";
import { Article } from "@/types/article";
import Pagination from "@/components/pagination/Pagination";
import { CAST_PAGE_SIZE, ARTICLES_PAGE_SIZE } from "@/services/cms-api-service";
import Link from "next/link";
import { useState, useEffect } from "react";
import TlisImage from "@/components/TlisImage";
import { useTranslations, useLocale } from "next-intl";

export default function CastPage({ 
   cast, 
   shows, 
   articles,
   loadingError, 
   showsTotalCount,
   articlesTotalCount,
   currentPage,
   locale: propLocale 
}: { 
   cast: any; 
   shows: Show[];
   articles: Article[];
   loadingError?: boolean; 
   showsTotalCount: number;
   articlesTotalCount: number;
   currentPage: number;
   locale?: string;
}) {
   const t = useTranslations("CastMemberPage");
   const locale = useLocale();
   
   // Mapovanie rolí z prekladov
   const rolesMap: Record<string, string> = {
      boss: t('roles.boss'),
      moderator: t('roles.moderator'),
      technic: t('roles.technic'),
      pr: t('roles.pr'),
      web: t('roles.web'),
      dj: t('roles.dj'),
      playwright: t('roles.playwright'),
   };

   const defaultTab = showsTotalCount === 0 && articlesTotalCount > 0 ? 'articles' : 'shows';
   const [activeTab, setActiveTab] = useState<'shows' | 'articles'>(defaultTab);
   
   useEffect(() => {
      if (showsTotalCount === 0 && articlesTotalCount > 0) {
          setActiveTab('articles');
      }
   }, [showsTotalCount, articlesTotalCount]);
   
   const totalPages = activeTab === 'shows' 
      ? Math.ceil(showsTotalCount / CAST_PAGE_SIZE)
      : Math.ceil(articlesTotalCount / ARTICLES_PAGE_SIZE);

   if (loadingError || !cast) {
      return (
         <div className="relative py-8 px-8">
            <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
                {t('error_title')}
            </h3>
            <p className="text-gray-200 mb-4">
                {t('error_subtitle')}
            </p>
            <Link
                href={`/${locale}/relacie`}
                className="inline-block bg-[#d43c4a] hover:bg-[#b83744] text-white px-6 py-2 rounded-full transition-colors"
            >
                {t('back_to_shows')}
            </Link>
         </div>
      );
   }

   const createShowLinks = () => {
      return shows.map((show: any, index: number) => {
         return <ShowLink key={index} show={show} />;
      });
   };

   return (
      <>
         <div className="flex flex-col mb-8 px-8">
            <div className="flex items-center gap-4 mb-4">
               <Link 
                  href={`/${locale}/relacie`} 
                  className="text-gray-400 hover:text-white transition-colors"
               >
                  ← {t('back_to_shows')}
               </Link>
            </div>
            
            <div className="flex items-start gap-6 mb-6 flex-col md:flex-row items-center">
               {cast.Member && (
                  <div className="relative">
                     <div className="aspect-square relative rounded-full overflow-hidden shadow-lg w-32 h-32">
                        <TlisImage
                           src={cast.Member.Picture}
                           alt={cast.Name}
                           sizeMultiplier={2}
                           className="object-cover h-full w-full"
                        />
                     </div>
                     {cast.Member.BestOfTheMonth && (
                        <img
                           src="/images/crown.webp"
                           alt={t('best_of_month')}
                           className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-28 h-28 z-10"
                           style={{
                              transform: "translate(-50%, -33%) rotate(-18deg)",
                              transformOrigin: "bottom center",
                           }}
                        />
                     )}
                  </div>
               )}
               
               <div className="flex-1 items-center flex flex-col">
                  <h1 className="text-4xl text-white font-semibold mb-2">
                     {cast.Name}
                  </h1>
                  
                  {cast.Member?.BestOfTheMonth && (
                     <span className="inline-block bg-[#D43C4A] text-white text-sm px-3 py-1 rounded-full mb-2">
                        {t('best_of_month')}
                     </span>
                  )}
                  
                  {cast.Member?.Role && (
                     <p className="text-gray-300 text-lg mb-4">
                        {rolesMap[cast.Member.Role] || cast.Member.Role}
                     </p>
                  )}

                  {cast.Description && (
                     <p className="text-gray-400 text-center mb-4 max-w-2xl">
                        {cast.Description}
                     </p>
                  )}
                  
                  <div className="flex gap-2 text-sm">
                     <span className="text-gray-400">
                        {showsTotalCount} {t('shows_count', { count: showsTotalCount })}
                     </span>
                     <span className="text-gray-600">•</span>
                     <span className="text-gray-400">
                        {articlesTotalCount} {t('articles_count', { count: articlesTotalCount })}
                     </span>
                  </div>
               </div>
            </div>
         </div>

         {/* Tabs */}
         <div className="px-8 mb-6 border-b border-gray-700">
            <div className="flex gap-6">
               <button
                  onClick={() => setActiveTab('shows')}
                  className={`pb-3 px-1 font-semibold text-lg transition-all relative ${
                     activeTab === 'shows' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
               >
                  {t('tabs.shows')} ({showsTotalCount})
                  {activeTab === 'shows' && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d43c4a] to-[#f05561] rounded-full" />
                  )}
               </button>
               <button
                  onClick={() => setActiveTab('articles')}
                  className={`pb-3 px-1 font-semibold text-lg transition-all relative ${
                     activeTab === 'articles' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
               >
                  {t('tabs.articles')} ({articlesTotalCount})
                  {activeTab === 'articles' && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d43c4a] to-[#f05561] rounded-full" />
                  )}
               </button>
            </div>
         </div>

         <div className="px-8">
            {activeTab === 'shows' ? (
               shows.length > 0 ? createShowLinks() : (
                  <div className="text-gray-400 py-8">{t('empty_shows')}</div>
               )
            ) : (
               articles.length > 0 ? (
                  articles.map((article, index) => (
                     <ArticleLink key={index} article={article} />
                  ))
               ) : (
                  <div className="text-gray-400 py-8">{t('empty_articles')}</div>
               )
            )}
         </div>

         {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
         )}
      </>
   );
}