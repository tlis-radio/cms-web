import React from "react";
import CmsApiService from "@/services/cms-api-service";
import { Link } from '@/navigation';
import TlisImage from "./TlisImage";
import ViewAllButton from "./ViewAllButton";
import { getTranslations } from "next-intl/server";

interface FotoreportsPanelProps {
   limit?: number;
}

const formatDate = (dateString?: string) => {
   if (!dateString) return null;
   return new Date(dateString).toLocaleDateString("sk-SK", {
      day: "numeric",
      month: "long",
   });
};

const FotoreportsPanel: React.FC<FotoreportsPanelProps> = async ({ limit = 4 }) => {
   const t = await getTranslations("HomePage");

   const events = await CmsApiService.Article.getRecentEvents(limit).catch((error) => {
      console.error("Error fetching fotoreports:", error);
      return [];
   });

   if (events.length === 0) return null;

   return (
      <div className="flex flex-col h-full min-w-0 bg-[#1c1c1c] rounded-lg p-4 shadow-lg">
         <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl text-white font-semibold">
               <span className="text-[#d43c4a] italic text-[1.2em] mr-1">TLIS</span> {t('fotoreportsTitle')}
            </h1>
            <ViewAllButton href="/clanky" label={t('viewAll')} />
         </div>

         <div className="flex flex-col gap-3 justify-center flex-1">
            {events.map((article: any, index: number) => (
               <Link
                  key={article.id || article.slug || index}
                  href={`/clanky/${article.slug}`}
                  className="flex items-center gap-3 group"
               >
                  <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                     {article.thumbnail_image ? (
                        <TlisImage
                           src={article.thumbnail_image}
                           width={112}
                           height={112}
                           alt={article.title}
                           className="w-full h-full object-cover"
                        />
                     ) : (
                        <div className="w-full h-full bg-gray-800" />
                     )}
                  </div>
                  <div className="min-w-0 text-left">
                     <h3 className="font-argentumSansLight text-white text-sm line-clamp-2 font-bold group-hover:text-[#d43c4a] transition-colors">
                        {article.title}
                     </h3>
                     {(article.published_at || article.event_time) && (
                        <p className="text-xs text-gray-400 mt-1">
                           {formatDate(article.published_at || article.event_time)}
                        </p>
                     )}
                  </div>
               </Link>
            ))}
         </div>
      </div>
   );
};

export default FotoreportsPanel;
