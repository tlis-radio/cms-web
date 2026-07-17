'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import FilterBar from '@/components/dashboard/FilterBar';
import { Show } from '@/models/show';

type TimeFilter = 'all' | '12m' | '6m' | '3m' | '1m' | '7d';

export default function DashboardPage() {
   const { directusClient } = useDashboardAuth();
   const [summary, setSummary] = useState<{ showsCount: number; usersCount: number } | null>(null);
   const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
   const [topByRetention, setTopByRetention] = useState<Array<{ show: Show; avgRetention: number; episodeCount: number }>>([]);
   const [topByStreamRetention, setTopByStreamRetention] = useState<Array<{ show: Show; avgRetention: number; episodeCount: number }>>([]);
   const [topByListeners, setTopByListeners] = useState<Array<{ show: Show; listenerCount: number; episodeCount: number }>>([]);
   const [isLoadingSummary, setIsLoadingSummary] = useState(true);
   const [isLoadingStats, setIsLoadingStats] = useState(false);
   const [dashboardData, setDashboardData] = useState<any>(null);
   const [loadingProgress, setLoadingProgress] = useState(0);
   const [loadingMessage, setLoadingMessage] = useState('');
   const [streamListeners, setStreamListeners] = useState<Array<{ id: number; count: number; date_created: string }>>([]);
   const [trackShares, setTrackShares] = useState<Array<{ id: number; episode: { id: number; title: string }; name: string; date_created: string }>>([]);
   const [isLoadingStreamData, setIsLoadingStreamData] = useState(true);
   const [maxStreamListeners, setMaxStreamListeners] = useState<number | null>(null);

   // Load summary first
   useEffect(() => {
      if (directusClient) {
         const service = new DashboardService(directusClient);
         service.getDashboardSummary().then((data) => {
            setSummary(data);
            setIsLoadingSummary(false);
         }).catch((error) => {
            console.error('Error loading dashboard summary:', error);
            setIsLoadingSummary(false);
         });
      }
   }, [directusClient]);

   // Load stream listeners and track shares
   useEffect(() => {
      if (directusClient) {
         const service = new DashboardService(directusClient);
         Promise.all([
            service.getAllStreamListeners(),
            service.getAllTrackShares(),
         ]).then(([listenersData, sharesData]) => {
            setStreamListeners(listenersData);
            setTrackShares(sharesData);

            // Calculate max from last 24 hours
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() - 24);
            const recentListeners = listenersData.filter(l => new Date(l.date_created) >= cutoffTime);
            const max = recentListeners.length > 0 ? Math.max(...recentListeners.map(l => l.count)) : null;
            setMaxStreamListeners(max);

            setIsLoadingStreamData(false);
         }).catch((error) => {
            console.error('Error loading stream data:', error);
            setIsLoadingStreamData(false);
         });
      }
   }, [directusClient]);

   // Load all data with progress
   useEffect(() => {
      if (directusClient && !dashboardData) {
         setIsLoadingStats(true);
         const service = new DashboardService(directusClient);

         service.getAllDashboardDataWithProgress((progress, message) => {
            setLoadingProgress(progress);
            setLoadingMessage(message);
         }).then((data) => {
            setDashboardData(data);
            setLoadingProgress(100);
            setLoadingMessage('Počítam štatistiky...');

            // Allow UI to render progress before heavy calculation
            setTimeout(() => {
               // Calculate initial stats
               const retentionData = service.getTopShowsByRetention(
                  { shows: data.shows, episodes: data.episodes, listeningSessions: data.listeningSessions },
                  timeFilter
               );
               const streamRetentionData = service.getTopShowsByStreamRetention(
                  { shows: data.shows, episodes: data.episodes, listeningSessionsStream: data.listeningSessionsStream },
                  timeFilter
               );
               const listenersData = service.getTopShowsByListeners(
                  { shows: data.shows, episodes: data.episodes, listeningSessions: data.listeningSessions, listeningSessionsStream: data.listeningSessionsStream },
                  timeFilter
               );

               setTopByRetention(retentionData);
               setTopByStreamRetention(streamRetentionData);
               setTopByListeners(listenersData);
               setIsLoadingStats(false);
            }, 100);
         }).catch((error) => {
            console.error('Error loading dashboard data:', error);
            setIsLoadingStats(false);
         });
      }
   }, [directusClient]);

   // Recalculate when time filter changes
   useEffect(() => {
      if (dashboardData && directusClient) {
         const service = new DashboardService(directusClient);

         const retentionData = service.getTopShowsByRetention(
            { shows: dashboardData.shows, episodes: dashboardData.episodes, listeningSessions: dashboardData.listeningSessions },
            timeFilter
         );
         const streamRetentionData = service.getTopShowsByStreamRetention(
            { shows: dashboardData.shows, episodes: dashboardData.episodes, listeningSessionsStream: dashboardData.listeningSessionsStream },
            timeFilter
         );
         const listenersData = service.getTopShowsByListeners(
            { shows: dashboardData.shows, episodes: dashboardData.episodes, listeningSessions: dashboardData.listeningSessions, listeningSessionsStream: dashboardData.listeningSessionsStream },
            timeFilter
         );

         setTopByRetention(retentionData);
         setTopByStreamRetention(streamRetentionData);
         setTopByListeners(listenersData);
      }
   }, [timeFilter, dashboardData, directusClient]);

   const timeFilterOptions: { value: TimeFilter; label: string }[] = [
      { value: 'all', label: 'Celé obdobie' },
      { value: '12m', label: 'Posledných 12 mesiacov' },
      { value: '6m', label: 'Posledných 6 mesiacov' },
      { value: '3m', label: 'Posledné 3 mesiace' },
      { value: '1m', label: 'Posledný mesiac' },
      { value: '7d', label: 'Posledných 7 dní' },
   ];

   return (
      <div className="max-w-7xl mx-auto">
         {/* Summary Cards - Show immediately */}
         {isLoadingSummary ? (
            <div className="text-white text-center mb-6 text-sm">Načítavam prehľad...</div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
               <StatCard label="Relácie" value={summary?.showsCount || 0} accent="red" href="/dashboard/shows" />
               <StatCard label="Poslucháči" value={summary?.usersCount || 0} accent="red" href="/dashboard/users" />
               <StatCard
                  label="Poslucháči vysielania (max 24h)"
                  value={isLoadingStreamData ? '...' : (maxStreamListeners !== null ? maxStreamListeners : 'Žiadne dáta')}
                  accent="blue"
                  href="/dashboard/stream-listeners"
               />
               <StatCard
                  label="Zdieľania"
                  value={isLoadingStreamData ? '...' : trackShares.length}
                  accent="purple"
                  href="/dashboard/track-shares"
               />
            </div>
         )}

         {/* Time Filter and Stats */}
         {isLoadingStats ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center mb-6">
               <h3 className="text-sm font-bold text-white mb-3">Načítavam analytické dáta...</h3>
               <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2 max-w-md mx-auto">
                  <div
                     className="bg-blue-500 h-full transition-all duration-300 ease-out"
                     style={{ width: `${loadingProgress}%` }}
                  />
               </div>
               <p className="text-gray-400 text-xs">{loadingMessage}</p>
            </div>
         ) : dashboardData ? (
            <>
               <FilterBar data-tour="filter-bar">
                  {timeFilterOptions.map((option) => (
                     <button
                        key={option.value}
                        onClick={() => setTimeFilter(option.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition ${
                           timeFilter === option.value
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                     >
                        {option.label}
                     </button>
                  ))}
               </FilterBar>

               {/* Top Shows Section */}
               <div data-tour="list-density" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Top by Average Retention */}
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-3">
                        Top relácie podľa priemernej udržateľnosti
                     </h2>
                     {topByRetention.length > 0 ? (
                        <div className="space-y-1.5">
                           {topByRetention.map((stat, index) => (
                              <Link
                                 key={stat.show.id}
                                 href={`/dashboard/shows/${stat.show.Slug}`}
                                 className="flex items-center justify-between p-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="text-sm font-bold text-gray-400 w-6">
                                       #{index + 1}
                                    </div>
                                    <div>
                                       <div className="text-sm font-medium text-white">
                                          {stat.show.Title}
                                       </div>
                                       <div className="text-xs text-gray-400">
                                          {stat.episodeCount} epizód
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-sm font-bold text-blue-400">
                                       {stat.avgRetention.toFixed(1)}%
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center text-gray-400 py-6 text-xs">
                           Žiadne dáta pre toto obdobie
                        </div>
                     )}
                  </div>

                  {/* Top by Stream Retention */}
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-3">
                        Top relácie podľa udržateľnosti vysielania
                     </h2>
                     {topByStreamRetention.length > 0 ? (
                        <div className="space-y-1.5">
                           {topByStreamRetention.map((stat, index) => (
                              <Link
                                 key={stat.show.id}
                                 href={`/dashboard/shows/${stat.show.Slug}`}
                                 className="flex items-center justify-between p-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="text-sm font-bold text-gray-400 w-6">
                                       #{index + 1}
                                    </div>
                                    <div>
                                       <div className="text-sm font-medium text-white">
                                          {stat.show.Title}
                                       </div>
                                       <div className="text-xs text-gray-400">
                                          {stat.episodeCount} epizód
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-sm font-bold text-green-400">
                                       {stat.avgRetention.toFixed(1)}%
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center text-gray-400 py-6 text-xs">
                           Žiadne dáta pre toto obdobie
                        </div>
                     )}
                  </div>

                  {/* Top by Listeners */}
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-3">
                        Top relácie podľa počtu poslucháčov
                     </h2>
                     {topByListeners.length > 0 ? (
                        <div className="space-y-1.5">
                           {topByListeners.map((stat, index) => (
                              <Link
                                 key={stat.show.id}
                                 href={`/dashboard/shows/${stat.show.Slug}`}
                                 className="flex items-center justify-between p-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="text-sm font-bold text-gray-400 w-6">
                                       #{index + 1}
                                    </div>
                                    <div>
                                       <div className="text-sm font-medium text-white">
                                          {stat.show.Title}
                                       </div>
                                       <div className="text-xs text-gray-400">
                                          {stat.episodeCount} epizód
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="text-sm font-bold text-purple-400">
                                       {stat.listenerCount}
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center text-gray-400 py-6 text-xs">
                           Žiadne dáta pre toto obdobie
                        </div>
                     )}
                  </div>
               </div>
            </>
         ) : null}
      </div>
   );
}
