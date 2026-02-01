"use client";
import ShowLink from "@/components/pagination/show-link";
import { Show } from "@/models/show";
import Pagination from "@/components/pagination/Pagination";
import { CAST_PAGE_SIZE } from "@/services/cms-api-service";
import Link from "next/link";

export default function CastPage({ 
   cast, 
   shows, 
   loadingError, 
   totalCount, 
   currentPage 
}: { 
   cast: any; 
   shows: Show[]; 
   loadingError?: boolean; 
   totalCount: number; 
   currentPage: number; 
}) {
   const totalPages = Math.ceil(totalCount / CAST_PAGE_SIZE);

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
            
            <h1 className="text-4xl text-white font-semibold mb-4">
               {cast.Name}
            </h1>

            {cast.Description && (
               <p className="text-gray-200 text-lg max-w-3xl mb-6">
                  {cast.Description}
               </p>
            )}

            <p className="text-gray-400">
               {totalCount} {totalCount === 1 ? "relácia" : totalCount < 5 ? "relácie" : "relácií"}
            </p>
         </div>

         <div className="px-8">
            {shows.length > 0 ? (
               createShowLinks()
            ) : (
               <div className="text-gray-400 py-8">
                  Zatiaľ žiadne relácie
               </div>
            )}
         </div>

         {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} />
         )}
      </>
   );
}
