'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Show } from '@/models/show';
import Select from '@/components/primitives/Select';
import FilterBar from '@/components/dashboard/FilterBar';
import CoverThumb from '@/components/dashboard/CoverThumb';

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
      <div className="max-w-7xl mx-auto">
         <FilterBar title="Relácie">
            <div data-tour="shows-filter">
               <Select
                  compact
                  options={[
                     { value: 'active', label: 'Aktívne' },
                     { value: 'archived', label: 'Archívne' },
                     { value: 'digital', label: 'Starý archív' },
                  ]}
                  value={filter}
                  onChange={(val) => setFilter(val as FilterProps)}
                  className="bg-gray-800 text-white min-w-[140px]"
               />
            </div>
         </FilterBar>

         {isLoading ? (
            <div className="text-white text-center text-sm">Načítavam relácie...</div>
         ) : (
            <div data-tour="shows-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
               {filteredShows.map((show) => (
                  <Link
                     key={show.id}
                     href={`/dashboard/shows/${show.Slug}`}
                     className="block bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition"
                  >
                     <CoverThumb assetId={show.Cover} alt={show.Title} className="w-full aspect-square" />
                     <div className="p-2">
                        <h3 className="text-sm font-medium text-white line-clamp-1">
                           {show.Title}
                        </h3>
                        <div className="mt-1 text-xs text-gray-500">
                           {show.Episodes?.length || 0} epizód
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         )}

         {!isLoading && filteredShows.length === 0 && (
            <div className="text-center text-gray-400 mt-12 text-sm">
               V tejto kategórii sa nenašli žiadne relácie.
            </div>
         )}
      </div>
   );
}
