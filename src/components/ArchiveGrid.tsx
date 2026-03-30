import React from "react";
import CmsApiService from "@/services/cms-api-service";
import { Link } from '@/navigation';
import TlisImage from "./TlisImage";
import { getTranslations } from "next-intl/server";

interface ShowGridProps {
   limit?: number;
}

const ShowGrid: React.FC<ShowGridProps> = async ({ limit = 5 }) => {
   // Initialize translations for server component
   const t = await getTranslations("ShowListPage");
   const tNav = await getTranslations("player");

   var loadingError = false;
   const shows = await CmsApiService.Show.listShows().catch((error) => {
      console.error("Error fetching shows:", error);
      loadingError = true;
      return [];
   });
   const limitedShows = shows.slice(0, limit);

   return (
      <div className="mb-12 py-16">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 px-4 md:px-8 pb-2">
            <h2 className="text-4xl text-white font-semibold pb-0">
               <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
               {tNav('archive_label')}
            </h2>
            <Link
               href="/relacie"
               className="font-argentumSansBold bg-[#d43c4a] rounded-full px-4 py-2 text-white hover:underline mt-2 md:mt-0 hidden sm:block"
            >
               {t('view_all')}
            </Link>
         </div>

         {loadingError && (
            <div className="relative py-8 px-4 md:px-8">
               <h3 className="text-xl mb-3 text-white">
                  {t('fetch_error_title')}
               </h3>
               <p className="text-gray-200 mb-4">{t('fetch_error_subtitle')}</p>
            </div>
         )}

         <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-4 md:px-8">
            {limitedShows.map((show: any, index: number) => (
               <Link
                  key={index}
                  href={`/relacie/${show.Slug}`}
                  className="group transition-transform hover:scale-105 flex flex-col"
               >
                  <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg order-1 sm:order-0 mb-8 sm:mb-2">
                     <TlisImage
                        src={show.Cover}
                        width={500}
                        height={500}
                        alt={show.Title}
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <h3 className="font-argentumSansLight text-white text-left text-2xl line-clamp-1 order-0 sm:order-1 sm:mt-2 sm:mb-0 mb-2 font-bold">
                     {show.Title}
                  </h3>
               </Link>
            ))}
         </div>

         <Link
            href="/relacie"
            className="font-argentumSansBold bg-[#d43c4a] rounded-full px-4 py-2 text-white block sm:hidden w-fit m-auto mt-10"
         >
            {t('view_all')}
         </Link>
      </div>
   );
};

export default ShowGrid;