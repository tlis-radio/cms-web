'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Show } from '@/models/show';
import { Episode } from '@/models/episode';
import { useParams, useRouter } from 'next/navigation';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

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
         
         // Use Views field from episode directly
         const episodesWithViews = episodesData.map((episode) => ({
            ...episode,
            viewCount: episode.Views || 0,
         }));
         
         setEpisodes(episodesWithViews);
         setIsLoading(false);
      });
   }, [directusClient, slug]);

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
      <AuthGuard>
         <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
               <DashboardHeader>
                  <Link
                     href="/dashboard/shows"
                     className="text-red-400 hover:text-red-300 transition"
                  >
                     ← Back to Shows
                  </Link>
               </DashboardHeader>

               {isLoading ? (
                  <div className="text-white text-center">Loading...</div>
               ) : show ? (
                  <>
                     <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <div className="flex gap-6">
                           {show.Cover && (
                              <div className="w-48 h-48 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                 <img
                                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${show.Cover}`}
                                    alt={show.Title}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           )}
                           <div className="flex-1">
                              <h1 className="text-4xl font-bold text-white mb-4">
                                 {show.Title}
                              </h1>
                              {show.Description && (
                                 <p className="text-gray-300 mb-4">{show.Description}</p>
                              )}
                              {show.Cast && show.Cast.length > 0 && (
                                 <div className="text-gray-400">
                                    <strong>Cast:</strong>{' '}
                                    {show.Cast.map((c) => c.Cast_id.Name).join(', ')}
                                 </div>
                              )}
                              <div className="text-gray-400 mt-2">
                                 {episodes.length} episodes
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Episodes</h2>
                        <div className="flex gap-2">
                           <button
                              onClick={() => toggleSort('date')}
                              className={`px-4 py-2 rounded transition ${
                                 sortBy === 'date' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                           >
                              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                           </button>
                           <button
                              onClick={() => toggleSort('views')}
                              className={`px-4 py-2 rounded transition ${
                                 sortBy === 'views' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              }`}
                           >
                              Views {sortBy === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        {getSortedEpisodes().map((episode) => (
                           <Link
                              key={episode.id}
                              href={`/dashboard/shows/${slug}/${episode.id}`}
                              className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition"
                           >
                              <div className="flex gap-4">
                                 {episode.Cover && (
                                    <div className="w-20 h-20 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                       <img
                                          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Cover}`}
                                          alt={episode.Title}
                                          className="w-full h-full object-cover"
                                       />
                                    </div>
                                 )}
                                 <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                       {episode.Title}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                       <div className="text-gray-400 text-sm">
                                          {formatDate(episode.Date)}
                                       </div>
                                       <div className="text-red-400 text-sm font-semibold">
                                          {episode.viewCount} views
                                       </div>
                                    </div>
                                    {episode.Tags && episode.Tags.length > 0 && (
                                       <div className="flex gap-2 mt-2">
                                          {episode.Tags.map((tagRelation) => (
                                             <span
                                                key={tagRelation.Tags_id.id}
                                                className="px-2 py-1 text-xs rounded"
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
                                 <div className="text-red-400 self-center">
                                    View Analytics →
                                 </div>
                              </div>
                           </Link>
                        ))}
                     </div>

                     {episodes.length === 0 && (
                        <div className="text-center text-gray-400 mt-12">
                           No episodes found for this show.
                        </div>
                     )}
                  </>
               ) : (
                  <div className="text-center text-gray-400 mt-12">
                     Show not found.
                  </div>
               )}
            </div>
         </div>
      </AuthGuard>
   );
}
