'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Show } from '@/models/show';
import { Episode } from '@/models/episode';
import { useParams, useRouter } from 'next/navigation';
import FilterBar from '@/components/dashboard/FilterBar';
import CoverThumb from '@/components/dashboard/CoverThumb';
import { TIME_FILTER_OPTIONS, useDashboardPeriod } from '@/lib/dashboard/useDashboardPeriod';

type EpisodeWithViews = Episode & { viewCount: number };
type SortBy = 'date' | 'views';
type SortOrder = 'asc' | 'desc';

export default function DashboardShowDetailPage() {
   const params = useParams();
   const router = useRouter();
   const slug = params.slug as string;
   const { directusClient } = useDashboardAuth();
   const [show, setShow] = useState<Show | null>(null);
   const [episodes, setEpisodes] = useState<EpisodeWithViews[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [sortBy, setSortBy] = useState<SortBy>('date');
   const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
   const [timeFilter, setTimeFilter] = useDashboardPeriod();

   useEffect(() => {
      if (!directusClient || !slug) return;

      const service = new DashboardService(directusClient);

      service.getShowBySlug(slug).then(async (showData) => {
         if (!showData) {
            router.push('/404');
            return;
         }
         setShow(showData);
         const episodesData = await service.getShowEpisodes(showData.id);

         // Same number as the home dashboard and episode page. Used to read
         // Episodes.Views, which is decoration, not a statistic.
         const listenCounts = await service.getQualifiedListenCountsForEpisodes(
            episodesData,
            timeFilter
         );

         const episodesWithViews = episodesData.map((episode) => ({
            ...episode,
            viewCount: listenCounts.get(String(episode.id)) || 0,
         }));

         setEpisodes(episodesWithViews);
         setIsLoading(false);
      });
   }, [directusClient, slug, timeFilter]);

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('sk-SK', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
      });
   };

   const getSortedEpisodes = () => {
      const sorted = [...episodes].sort((a, b) => {
         if (sortBy === 'date') {
            const dateA = new Date(a.Date).getTime();
            const dateB = new Date(b.Date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
         } else {
            return sortOrder === 'asc' ? a.viewCount - b.viewCount : b.viewCount - a.viewCount;
         }
      });
      return sorted;
   };

   const toggleSort = (field: SortBy) => {
      if (sortBy === field) {
         setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
         setSortBy(field);
         setSortOrder('desc');
      }
   };

   return (
      <div className="max-w-7xl mx-auto">
         <Link
            href="/dashboard/shows"
            className="text-red-400 hover:text-red-300 transition text-sm mb-4 inline-block"
         >
            ← Späť na relácie
         </Link>

         {isLoading ? (
            <div className="text-white text-center text-sm">Načítavam...</div>
         ) : show ? (
            <>
               <div data-tour="show-header" className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex gap-4">
                     <CoverThumb assetId={show.Cover} alt={show.Title} className="w-32 h-32 rounded-lg" />
                     <div className="flex-1">
                        <h1 className="text-xl font-bold text-white mb-2">
                           {show.Title}
                        </h1>
                        {show.Description && (
                           <p className="text-gray-300 text-sm mb-2 line-clamp-3">{show.Description}</p>
                        )}
                        {show.Cast && show.Cast.length > 0 && (
                           <div className="text-gray-400 text-xs">
                              <strong>Obsadenie:</strong>{' '}
                              {show.Cast.map((c) => c.Cast_id.Name).join(', ')}
                           </div>
                        )}
                        <div className="text-gray-400 text-xs mt-1">
                           {episodes.length} epizód
                        </div>
                     </div>
                  </div>
               </div>

               <FilterBar title="Epizódy" data-tour="episode-sort">
                  {TIME_FILTER_OPTIONS.map((option) => (
                     <button
                        key={option.value}
                        onClick={() => setTimeFilter(option.value)}
                        className={`px-2 py-1 text-xs rounded transition ${
                           timeFilter === option.value
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                     >
                        {option.label}
                     </button>
                  ))}
                  <button
                     onClick={() => toggleSort('date')}
                     className={`px-3 py-1.5 text-xs rounded transition ${
                        sortBy === 'date'
                           ? 'bg-red-600 text-white'
                           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                     }`}
                  >
                     Dátum {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button
                     onClick={() => toggleSort('views')}
                     className={`px-3 py-1.5 text-xs rounded transition ${
                        sortBy === 'views'
                           ? 'bg-red-600 text-white'
                           : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                     }`}
                  >
                     Vypočutia {sortBy === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
               </FilterBar>

               <div data-tour="episode-list" className="space-y-2">
                  {getSortedEpisodes().map((episode) => (
                     <Link
                        key={episode.id}
                        href={`/dashboard/shows/${slug}/${episode.id}`}
                        className="block bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition"
                     >
                        <div className="flex gap-3 items-center">
                           <CoverThumb assetId={episode.Cover} alt={episode.Title} size="md" />
                           <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-white truncate">
                                 {episode.Title}
                              </h3>
                              <div className="flex items-center gap-3">
                                 <div className="text-gray-400 text-xs">
                                    {formatDate(episode.Date)}
                                 </div>
                                 <div className="text-red-400 text-xs font-semibold">
                                    {episode.viewCount} vypočutí
                                 </div>
                              </div>
                              {episode.Tags && episode.Tags.length > 0 && (
                                 <div className="flex gap-1.5 mt-1">
                                    {episode.Tags.map((tagRelation) => (
                                       <span
                                          key={tagRelation.Tags_id.id}
                                          className="px-1.5 py-0.5 text-[10px] rounded"
                                          style={{
                                             backgroundColor: tagRelation.Tags_id.Color || '#666',
                                          }}
                                       >
                                          {tagRelation.Tags_id.Title}
                                       </span>
                                    ))}
                                 </div>
                              )}
                           </div>
                           <div className="text-red-400 text-xs flex-shrink-0">
                              Analytika →
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>

               {episodes.length === 0 && (
                  <div className="text-center text-gray-400 mt-12 text-sm">
                     Pre túto reláciu neboli nájdené žiadne epizódy.
                  </div>
               )}
            </>
         ) : (
            <div className="text-center text-gray-400 mt-12 text-sm">
               Relácia nebola nájdená.
            </div>
         )}
      </div>
   );
}
