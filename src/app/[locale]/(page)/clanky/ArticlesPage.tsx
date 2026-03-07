"use client";
import ArticleLink from "@/components/ArticleLink";
import Pagination from "@/components/pagination/Pagination";
import { ARTICLES_PAGE_SIZE } from "@/services/cms-api-service";
import { Article } from "@/types/article";

export default function ArticlesPage({ 
   articles, 
   loadingError, 
   totalCount, 
   currentPage,
   showHeader = true
}: { 
   articles: Article[], 
   loadingError?: boolean, 
   totalCount: number, 
   currentPage: number,
   showHeader?: boolean
}) {
   const totalPages = Math.ceil(totalCount / ARTICLES_PAGE_SIZE);

   return (
      <>
         {showHeader && (
            <div className="flex flex-wrap items-center justify-between mb-8 px-8">
               <h1 className="text-4xl text-white font-semibold">
                  <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> články
               </h1>
            </div>
         )}

         {loadingError && (
            <div className="relative py-8 px-8">
               <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
                  Chyba pri načítaní článkov
               </h3>
               <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
            </div>
         )}

         <div className="px-8">
            {articles.map((article) => (
               <ArticleLink key={article.id} article={article} />
            ))}
         </div>

         {articles.length === 0 && !loadingError && (
            <div className="px-8 text-center py-12">
               <p className="text-gray-400">Zatiaľ tu nie sú žiadne články.</p>
            </div>
         )}
         
         <Pagination currentPage={currentPage} totalPages={totalPages} />
      </>
   );
}
