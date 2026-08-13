import React from "react";
import CmsApiService from "@/services/cms-api-service";
import { Link } from '@/navigation';
import TlisImage from "./TlisImage";
import ViewAllButton from "./ViewAllButton";
import { getTranslations } from "next-intl/server";

interface UpNextGridProps {
   limit?: number;
}

const UpNextGrid: React.FC<UpNextGridProps> = async ({ limit = 6 }) => {
   const t = await getTranslations("HomePage");

   const { shows } = await CmsApiService.Show.listShowsPaginated(1, "active").catch((error) => {
      console.error("Error fetching shows:", error);
      return { shows: [], totalCount: 0 };
   });
   const limitedShows = shows.slice(0, limit);

   if (limitedShows.length === 0) return null;

   return (
      <div className="flex flex-col h-full min-w-0 rounded-lg">
         <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl text-white font-semibold">
               <span className="text-[#d43c4a] italic text-[1.2em] mr-1">TLIS</span> {t('upNextTitle')}
            </h1>
            <ViewAllButton href="/relacie" label={t('viewAll')} />
         </div>

         <div className="grid grid-cols-3 gap-3 content-evenly flex-1 min-h-0">
            {limitedShows.map((show: any, index: number) => (
               <Link
                  key={index}
                  href={`/relacie/${show.Slug}`}
                  className="group transition-transform hover:scale-105 flex flex-col"
               >
                  <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg mb-1">
                     <TlisImage
                        src={show.Cover}
                        width={200}
                        height={200}
                        alt={show.Title}
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <h3 className="font-argentumSansLight text-white text-left text-xs line-clamp-1 font-bold">
                     {show.Title}
                  </h3>
               </Link>
            ))}
         </div>
      </div>
   );
};

export default UpNextGrid;
