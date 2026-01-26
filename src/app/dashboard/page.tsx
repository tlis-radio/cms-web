'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
            setLoadingMessage('Calculating stats...');
            
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
      { value: 'all', label: 'All Time' },
      { value: '12m', label: 'Last 12 Months' },
      { value: '6m', label: 'Last 6 Months' },
      { value: '3m', label: 'Last 3 Months' },
      { value: '1m', label: 'Last Month' },
      { value: '7d', label: 'Last 7 Days' },
   ];

   return (
      <AuthGuard>
         <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
               <DashboardHeader>
                  <h1 className="text-4xl font-bold text-white">
                     Dashboard
                  </h1>
               </DashboardHeader>
               <div className='py-8'>
                  <p className='text-white'>
                     Všetky dáta udržania poslucháčov sú počítané od 18.12.2025, kedy bol spustený nový analytický systém. 
                     Dáta epizód ovysielaných pred týmto dátuom majú náhodne vygenerované vypočutia,
                     ktoré nezodpovedajú realite a treba sa riadiť podľa dát udržatelnosti.
                     Náhodne generované vypočutia boli od 0-50 poslucháčov na epizódu.
                     <br/> <br/>
                     Každá epizóda má <b>vypočutia (možno náhodne generované)</b>, živých a archívnych poslucháčov (z reálnych dát). Poslucháč má priradené id.
                     Každý poslucháč môže mať viacero vypočutí na rôznych epizódach. Pozeraj kolekcie Shows a Users nižšie.
                  </p>
               </div>

               {/* Summary Cards - Show immediately */}
               {isLoadingSummary ? (
                  <div className="text-white text-center mb-8">Loading summary...</div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                     <Link
                        href="/dashboard/shows"
                        className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                     >
                        <h2 className="text-2xl font-semibold text-white mb-2">
                           Shows
                        </h2>
                        <p className="text-4xl font-bold text-red-500">
                           {summary?.showsCount || 0}
                        </p>
                        <p className="text-gray-400 mt-2">
                           Total shows in the system
                        </p>
                     </Link>

                     <Link
                        href="/dashboard/users"
                        className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                     >
                        <h2 className="text-2xl font-semibold text-white mb-2">
                           Users
                        </h2>
                        <p className="text-4xl font-bold text-red-500">
                           {summary?.usersCount || 0}
                        </p>
                        <p className="text-gray-400 mt-2">
                           Unique listeners
                        </p>
                     </Link>
                  </div>
               )}

               {/* Time Filter and Stats */}
               {isLoadingStats ? (
                  <div className="bg-gray-800 rounded-lg p-8 text-center mb-8">
                     <h3 className="text-xl font-bold text-white mb-4">Loading Analytics Data...</h3>
                     <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden mb-2 max-w-md mx-auto">
                        <div 
                           className="bg-blue-500 h-full transition-all duration-300 ease-out"
                           style={{ width: `${loadingProgress}%` }}
                        />
                     </div>
                     <p className="text-gray-400">{loadingMessage}</p>
                  </div>
               ) : dashboardData ? (
                  <>
                     <div className="mb-6">
                        <div className="flex gap-2 flex-wrap">
                           {timeFilterOptions.map((option) => (
                              <button
                                 key={option.value}
                                 onClick={() => setTimeFilter(option.value)}
                                 className={`px-4 py-2 rounded-lg transition ${
                                    timeFilter === option.value
                                       ? 'bg-red-500 text-white'
                                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                 }`}
                              >
                                 {option.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Top Shows Section */}
                     <div className="grid grid-cols-3 gap-4">
                        {/* Top by Average Retention */}
                        <div className="bg-gray-800 rounded-lg p-6">
                           <h2 className="text-2xl font-bold text-white mb-4">
                              Top Shows by Average Retention Rate
                           </h2>
                           {topByRetention.length > 0 ? (
                              <div className="space-y-3">
                                 {topByRetention.map((stat, index) => (
                                    <Link
                                       key={stat.show.id}
                                       href={`/dashboard/shows/${stat.show.Slug}`}
                                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                    >
                                       <div className="flex items-center gap-4">
                                          <div className="text-2xl font-bold text-gray-400 w-8">
                                             #{index + 1}
                                          </div>
                                          <div>
                                             <div className="text-lg font-semibold text-white">
                                                {stat.show.Title}
                                             </div>
                                             <div className="text-sm text-gray-400">
                                                {stat.episodeCount} episode{stat.episodeCount !== 1 ? 's' : ''}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <div className="text-2xl font-bold text-blue-400">
                                             {stat.avgRetention.toFixed(1)}%
                                          </div>
                                          <div className="text-sm text-gray-400">avg retention</div>
                                       </div>
                                    </Link>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center text-gray-400 py-8">
                                 No data available for this time period
                              </div>
                           )}
                        </div>

                        {/* Top by Stream Retention */}
                        <div className="bg-gray-800 rounded-lg p-6">
                           <h2 className="text-2xl font-bold text-white mb-4">
                              Top Shows by Stream Retention Rate
                           </h2>
                           {topByStreamRetention.length > 0 ? (
                              <div className="space-y-3">
                                 {topByStreamRetention.map((stat, index) => (
                                    <Link
                                       key={stat.show.id}
                                       href={`/dashboard/shows/${stat.show.Slug}`}
                                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                    >
                                       <div className="flex items-center gap-4">
                                          <div className="text-2xl font-bold text-gray-400 w-8">
                                             #{index + 1}
                                          </div>
                                          <div>
                                             <div className="text-lg font-semibold text-white">
                                                {stat.show.Title}
                                             </div>
                                             <div className="text-sm text-gray-400">
                                                {stat.episodeCount} episode{stat.episodeCount !== 1 ? 's' : ''}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <div className="text-2xl font-bold text-green-400">
                                             {stat.avgRetention.toFixed(1)}%
                                          </div>
                                          <div className="text-sm text-gray-400">avg stream retention</div>
                                       </div>
                                    </Link>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center text-gray-400 py-8">
                                 No data available for this time period
                              </div>
                           )}
                        </div>

                        {/* Top by Listeners */}
                        <div className="bg-gray-800 rounded-lg p-6">
                           <h2 className="text-2xl font-bold text-white mb-4">
                              Top Shows by Individual Listeners
                           </h2>
                           {topByListeners.length > 0 ? (
                              <div className="space-y-3">
                                 {topByListeners.map((stat, index) => (
                                    <Link
                                       key={stat.show.id}
                                       href={`/dashboard/shows/${stat.show.Slug}`}
                                       className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                    >
                                       <div className="flex items-center gap-4">
                                          <div className="text-2xl font-bold text-gray-400 w-8">
                                             #{index + 1}
                                          </div>
                                          <div>
                                             <div className="text-lg font-semibold text-white">
                                                {stat.show.Title}
                                             </div>
                                             <div className="text-sm text-gray-400">
                                                {stat.episodeCount} episode{stat.episodeCount !== 1 ? 's' : ''}
                                             </div>
                                          </div>
                                       </div>
                                       <div className="text-right">
                                          <div className="text-2xl font-bold text-purple-400">
                                             {stat.listenerCount}
                                          </div>
                                          <div className="text-sm text-gray-400">unique listeners</div>
                                       </div>
                                    </Link>
                                 ))}
                              </div>
                           ) : (
                              <div className="text-center text-gray-400 py-8">
                                 No data available for this time period
                              </div>
                           )}
                        </div>
                     </div>
                  </>
               ) : null}
            </div>
         </div>
      </AuthGuard>
   );
}
