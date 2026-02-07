"use client";
import ShowLink from "@/components/pagination/show-link";
import ArticleLink from "@/components/ArticleLink";
import { Show } from "@/models/show";
import { Article } from "@/types/article";
import Pagination from "@/components/pagination/Pagination";
import { CAST_PAGE_SIZE, ARTICLES_PAGE_SIZE } from "@/services/cms-api-service";
import Link from "next/link";
import { useState, useEffect } from "react";
import TlisImage from "@/components/TlisImage";

var roles = {
   boss: "Vedúci a zástupcovia",
   moderator: "Moderátori",
   technic: "Technici",
   pr: "PR-isti",
   web: "Webový tím",
   dj: "DJi",
   playwright: "Dramaturgovia",
};

export default function CastPage({ 
   cast, 
   shows, 
   articles,
   loadingError, 
   showsTotalCount,
   articlesTotalCount,
   currentPage 
}: { 
   cast: any; 
   shows: Show[];
   articles: Article[];
   loadingError?: boolean; 
   showsTotalCount: number;
   articlesTotalCount: number;
   currentPage: number; 
}) {
   // Auto-select articles tab if no shows
   const defaultTab = showsTotalCount === 0 && articlesTotalCount > 0 ? 'articles' : 'shows';
   const [activeTab, setActiveTab] = useState<'shows' | 'articles'>(defaultTab);
   
   // Update tab when data changes
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
               Chyba pri načítaní údajov
            </h3>
            <p className="text-gray-200 mb-4">
               Účinkujúci nebol najdený alebo došlo k chybe pri načítaní.
            </p>
            <Link
               href="/relacie"
               className="inline-block bg-[#d43c4a] hover:bg-[#b83744] text-white px-6 py-2 rounded-full transition-colors"
            >
               Späť na relácie
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
                  href="/relacie" 
                  className="text-gray-400 hover:text-white transition-colors"
               >
                  ← Späť na relácie
               </Link>
            </div>
            
            {/* Profile header with picture if member exists */}
            {cast.Member && (
               <div className="flex items-start gap-6 mb-6 flex-col md:flex-row items-center">
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
                           alt="Tlisák Mesiaca"
                           className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-28 h-28 z-10"
                           style={{
                              transform: "translate(-50%, -33%) rotate(-18deg)",
                              transformOrigin: "bottom center",
                           }}
                        />
                     )}
                  </div>
                  
                  <div className="flex-1 items-center flex flex-col">
                     <h1 className="text-4xl text-white font-semibold mb-2">
                        {cast.Name}
                     </h1>
                     
                     {cast.Member.BestOfTheMonth && (
                        <span className="inline-block bg-[#D43C4A] text-white text-sm px-3 py-1 rounded-full mb-2">
                           Tlisák Mesiaca
                        </span>
                     )}
                     
                     {cast.Member.Role && (
                        <p className="text-gray-300 text-lg mb-4">
                           {roles[cast.Member.Role as keyof typeof roles] || cast.Member.Role}
                        </p>
                     )}

                     {cast.Description && (
                        <p className="text-gray-400 text-center mb-4 max-w-2xl">
                           {cast.Description}
                        </p>
                     )}
                     
                     <div className="flex gap-2 text-sm">
                        <span className="text-gray-400">
                           {showsTotalCount} {showsTotalCount === 1 ? "relácia" : showsTotalCount < 5 ? "relácie" : "relácií"}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">
                           {articlesTotalCount} {articlesTotalCount === 1 ? "článok" : articlesTotalCount < 5 ? "články" : "článkov"}
                        </span>
                     </div>
                  </div>
               </div>
            )}
            
            {/* Fallback for cast without member data */}
            {!cast.Member && (
               <>
                  <h1 className="text-4xl text-white font-semibold mb-4">
                     {cast.Name}
                  </h1>

                  <div className="flex gap-2 text-sm">
                     <span className="text-gray-400">
                        {showsTotalCount} {showsTotalCount === 1 ? "relácia" : showsTotalCount < 5 ? "relácie" : "relácií"}
                     </span>
                     <span className="text-gray-600">•</span>
                     <span className="text-gray-400">
                        {articlesTotalCount} {articlesTotalCount === 1 ? "článok" : articlesTotalCount < 5 ? "články" : "článkov"}
                     </span>
                  </div>
               </>
            )}
         </div>

         {/* Tabs */}
         <div className="px-8 mb-6 border-b border-gray-700">
            <div className="flex gap-6">
               <button
                  onClick={() => setActiveTab('shows')}
                  className={`pb-3 px-1 font-semibold text-lg transition-all relative ${
                     activeTab === 'shows'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                  }`}
               >
                  Relácie ({showsTotalCount})
                  {activeTab === 'shows' && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d43c4a] to-[#f05561] rounded-full" />
                  )}
               </button>
               <button
                  onClick={() => setActiveTab('articles')}
                  className={`pb-3 px-1 font-semibold text-lg transition-all relative ${
                     activeTab === 'articles'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                  }`}
               >
                  Články ({articlesTotalCount})
                  {activeTab === 'articles' && (
                     <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#d43c4a] to-[#f05561] rounded-full" />
                  )}
               </button>
            </div>
         </div>

         <div className="px-8">
            {activeTab === 'shows' ? (
               shows.length > 0 ? (
                  createShowLinks()
               ) : (
                  <div className="text-gray-400 py-8">
                     Zatiaľ žiadne relácie
                  </div>
               )
            ) : (
               articles.length > 0 ? (
                  articles.map((article, index) => (
                     <ArticleLink key={index} article={article} />
                  ))
               ) : (
                  <div className="text-gray-400 py-8">
                     Zatiaľ žiadne články
                  </div>
               )
            )}
         </div>

         {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
         )}
      </>
   );
}
