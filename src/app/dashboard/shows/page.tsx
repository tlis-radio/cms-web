'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Show } from '@/models/show';
import Select from '@/components/primitives/Select';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

type FilterProps = 'active' | 'archived' | 'digital';

export default function DashboardShowsPage() {
   const { directusClient } = useDashboardAuth();
   const [shows, setShows] = useState<Show[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [filter, setFilter] = useState<FilterProps>('active');

   useEffect(() => {
      if (directusClient) {
         const service = new DashboardService(directusClient);
         service.getAllShows().then((data) => {
            setShows(data);
            setIsLoading(false);
         }).catch((error) => {
            console.error('Error loading shows:', error);
            setIsLoading(false);
         });
      }
   }, [directusClient]);

   const filteredShows = shows.filter((show) => show.Filter === filter);

   return (
      <AuthGuard>
         <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
               <DashboardHeader>
                  <Link
                     href="/dashboard"
                     className="text-red-400 hover:text-red-300 transition"
                  >
                     ← Back to Dashboard
                  </Link>
                  <h1 className="text-4xl font-bold text-white">Shows</h1>
               </DashboardHeader>

               <div className="mb-6">
                  <Select
                     options={[
                        { value: 'active', label: 'ACTIVE SHOWS' },
                        { value: 'archived', label: 'ARCHIVED SHOWS' },
                        { value: 'digital', label: 'OLD ARCHIVE' },
                     ]}
                     value={filter}
                     onChange={(val) => setFilter(val as FilterProps)}
                     className="bg-gray-800 text-white min-w-[180px]"
                  />
               </div>

               {isLoading ? (
                  <div className="text-white text-center">Loading shows...</div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredShows.map((show) => (
                        <Link
                           key={show.id}
                           href={`/dashboard/shows/${show.Slug}`}
                           className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
                        >
                           {show.Cover && (
                              <div className="aspect-square bg-gray-700">
                                 <img
                                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${show.Cover}`}
                                    alt={show.Title}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           )}
                           <div className="p-4">
                              <h3 className="text-xl font-semibold text-white mb-2">
                                 {show.Title}
                              </h3>
                              {show.Description && (
                                 <p className="text-gray-400 text-sm line-clamp-2">
                                    {show.Description}
                                 </p>
                              )}
                              <div className="mt-2 text-sm text-gray-500">
                                 {show.Episodes?.length || 0} episodes
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               )}

               {!isLoading && filteredShows.length === 0 && (
                  <div className="text-center text-gray-400 mt-12">
                     No shows found in this category.
                  </div>
               )}
            </div>
         </div>
      </AuthGuard>
   );
}
