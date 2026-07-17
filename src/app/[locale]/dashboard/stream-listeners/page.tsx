'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Episode } from '@/models/episode';
import StatCard from '@/components/dashboard/StatCard';
import FilterBar from '@/components/dashboard/FilterBar';
import CoverThumb from '@/components/dashboard/CoverThumb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeRange = '1h' | '24h' | '7d' | '30d' | 'all';

type StreamListener = {
   id: number;
   count: number;
   date_created: string;
};

type ChartDataPoint = {
   timestamp: string;
   listeners: number;
};

export default function StreamListenersPage() {
   const { directusClient } = useDashboardAuth();
   const [listeners, setListeners] = useState<StreamListener[]>([]);
   const [episodes, setEpisodes] = useState<Episode[]>([]);
   const [sessions, setSessions] = useState<Array<{ episode_id: string; session_id: string; date_created: string }>>([]);
   const [episodeShowSlugs, setEpisodeShowSlugs] = useState<Map<string, string>>(new Map());
   const [isLoading, setIsLoading] = useState(true);
   const [timeRange, setTimeRange] = useState<TimeRange>('24h');

   const service = useMemo(() => (directusClient ? new DashboardService(directusClient) : null), [directusClient]);

   useEffect(() => {
      if (service) {
         Promise.all([
            service.getAllStreamListeners(),
            service.getEpisodeStreamStats(),
         ]).then(([listenersData, streamStats]) => {
            setListeners(listenersData);
            setEpisodes(streamStats.episodes);
            setSessions(streamStats.sessions);
            setEpisodeShowSlugs(streamStats.episodeShowSlugs);
            setIsLoading(false);
         }).catch((error) => {
            console.error('Error loading stream listeners:', error);
            setIsLoading(false);
         });
      }
   }, [service]);

   const insights = useMemo(() => {
      if (!service) return null;
      return service.getStreamListenerInsights(listeners, episodes, sessions, episodeShowSlugs);
   }, [service, listeners, episodes, sessions, episodeShowSlugs]);

   const getChartData = (): ChartDataPoint[] => {
      if (listeners.length === 0) return [];

      const now = new Date();
      const cutoffTime = new Date();

      switch (timeRange) {
         case '1h':
            cutoffTime.setHours(now.getHours() - 1);
            break;
         case '24h':
            cutoffTime.setHours(now.getHours() - 24);
            break;
         case '7d':
            cutoffTime.setDate(now.getDate() - 7);
            break;
         case '30d':
            cutoffTime.setDate(now.getDate() - 30);
            break;
         case 'all':
            cutoffTime.setFullYear(2000);
            break;
      }

      const filteredListeners = listeners.filter(l =>
         new Date(l.date_created) >= cutoffTime
      );

      if (filteredListeners.length === 0) return [];

      const dataMap = new Map<string, number>();

      filteredListeners.forEach((listener) => {
         const date = new Date(listener.date_created);
         let key: string;

         switch (timeRange) {
            case '1h':
               date.setSeconds(0, 0);
               key = date.toISOString();
               break;
            case '24h':
               const minutes = date.getMinutes();
               const roundedMinutes = Math.floor(minutes / 30) * 30;
               date.setMinutes(roundedMinutes, 0, 0);
               key = date.toISOString();
               break;
            case '7d':
               date.setMinutes(0, 0, 0);
               key = date.toISOString();
               break;
            case '30d':
               const hours = date.getHours();
               const roundedHours = Math.floor(hours / 4) * 4;
               date.setHours(roundedHours, 0, 0, 0);
               key = date.toISOString();
               break;
            case 'all':
               date.setHours(0, 0, 0, 0);
               key = date.toISOString();
               break;
         }

         const currentMax = dataMap.get(key) || 0;
         dataMap.set(key, Math.max(currentMax, listener.count));
      });

      const chartData = Array.from(dataMap.entries())
         .map(([timestamp, listeners]) => ({ timestamp, listeners }))
         .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return chartData;
   };

   const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);

      switch (timeRange) {
         case '1h':
            return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
         case '24h':
            return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
         case '7d':
            return date.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric', hour: '2-digit' });
         case '30d':
            return date.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' });
         case 'all':
            return date.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' });
         default:
            return date.toLocaleString('sk-SK');
      }
   };

   const formatDuration = (ms: number) => {
      const totalSeconds = Math.max(0, Math.round(ms / 1000));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
   };

   const chartData = getChartData();
   const max = chartData.length > 0 ? Math.max(...chartData.map(d => d.listeners)) : null;

   const timeRangeOptions: { value: TimeRange; label: string }[] = [
      { value: '1h', label: '1 hodina' },
      { value: '24h', label: '24 hodín' },
      { value: '7d', label: '7 dní' },
      { value: '30d', label: '30 dní' },
      { value: 'all', label: 'Celé obdobie' },
   ];

   const lastStream = insights?.lastStream ?? null;
   const lastStreamShowSlug = lastStream?.showSlug;

   return (
      <div className="max-w-7xl mx-auto">
         {isLoading ? (
            <div className="text-white text-center text-sm">Načítavam poslucháčov vysielania...</div>
         ) : listeners.length === 0 ? (
            <div className="text-center text-gray-400 mt-12 text-sm">
               Zatiaľ nie sú dostupné žiadne dáta o poslucháčoch vysielania.
            </div>
         ) : (
            <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <StatCard label="Súbežní poslucháči (zvolené obdobie)" value={max !== null ? max : 'Žiadne dáta'} accent="blue" />
                  <StatCard
                     label="Najvyššia návštevnosť naživo (historicky)"
                     value={insights?.allTimePeak ? insights.allTimePeak.count : 'Žiadne dáta'}
                     accent="orange"
                  />
                  <StatCard
                     label="Posledné vysielanie"
                     value={
                        lastStream ? (
                           <span className="text-sm font-semibold text-red-400 truncate block">
                              {lastStream.episode?.Title || new Date(lastStream.start).toLocaleDateString('sk-SK')}
                           </span>
                        ) : (
                           'Žiadne dáta'
                        )
                     }
                  />
               </div>

               <FilterBar title="Poslucháči vysielania">
                  {timeRangeOptions.map((option) => (
                     <button
                        key={option.value}
                        onClick={() => setTimeRange(option.value)}
                        className={`px-3 py-1.5 text-xs rounded-lg transition ${
                           timeRange === option.value
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                     >
                        {option.label}
                     </button>
                  ))}
               </FilterBar>

               <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h2 className="text-sm font-semibold text-white mb-1">
                     Poslucháči v čase
                  </h2>
                  <div className="text-gray-400 text-xs mb-3">
                     Maximálny počet súbežných poslucháčov v danom časovom úseku.
                  </div>
                  {chartData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={chartData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis
                              dataKey="timestamp"
                              stroke="#9CA3AF"
                              tickFormatter={(value) => formatTimestamp(value)}
                           />
                           <YAxis
                              stroke="#9CA3AF"
                              label={{ value: 'Poslucháči', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                           />
                           <Tooltip
                              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                              labelStyle={{ color: '#fff' }}
                              labelFormatter={(value) => new Date(value).toLocaleString('sk-SK')}
                           />
                           <Legend />
                           <Line
                              type="monotone"
                              dataKey="listeners"
                              stroke="#3B82F6"
                              name="Súbežní poslucháči"
                              strokeWidth={2}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  ) : (
                     <div className="text-center text-gray-400 py-6 text-xs">
                        Pre zvolené obdobie nie sú dostupné žiadne dáta.
                     </div>
                  )}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Last stream detail */}
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-3">Posledné vysielanie</h2>
                     {lastStream ? (
                        <div>
                           <div className="flex gap-3 mb-3">
                              <CoverThumb assetId={lastStream.episode?.Cover} alt={lastStream.episode?.Title || 'Vysielanie'} size="lg" />
                              <div className="flex-1 min-w-0">
                                 {lastStream.episode ? (
                                    <Link
                                       href={`/dashboard/shows/${lastStreamShowSlug}/${lastStream.episode.id}`}
                                       className="text-sm font-medium text-white hover:text-red-300 transition truncate block"
                                    >
                                       {lastStream.episode.Title}
                                    </Link>
                                 ) : (
                                    <div className="text-sm font-medium text-white">Nepriradená epizóda</div>
                                 )}
                                 <div className="text-gray-400 text-xs mt-1">
                                    {new Date(lastStream.start).toLocaleString('sk-SK')} – {new Date(lastStream.end).toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' })}
                                 </div>
                                 <div className="text-gray-500 text-[11px] mt-0.5">
                                    Trvanie {formatDuration(new Date(lastStream.end).getTime() - new Date(lastStream.start).getTime())}
                                 </div>
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-3">
                              <div className="bg-gray-700 rounded-lg p-2.5">
                                 <div className="text-[11px] text-gray-400 mb-0.5">Špička súbežne</div>
                                 <div className="text-base font-bold text-blue-400">{lastStream.peakListeners}</div>
                              </div>
                              <div className="bg-gray-700 rounded-lg p-2.5">
                                 <div className="text-[11px] text-gray-400 mb-0.5">Priemer súbežne</div>
                                 <div className="text-base font-bold text-white">{Math.round(lastStream.avgListeners)}</div>
                              </div>
                              <div className="bg-gray-700 rounded-lg p-2.5">
                                 <div className="text-[11px] text-gray-400 mb-0.5">Unikátni poslucháči</div>
                                 <div className="text-base font-bold text-white">{lastStream.uniqueListeners || '—'}</div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center text-gray-400 py-6 text-xs">Zatiaľ nie sú dostupné žiadne dáta o vysielaní.</div>
                     )}
                  </div>

                  {/* Top episodes by live listeners */}
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-1">Najlepšie epizódy naživo</h2>
                     <div className="text-gray-400 text-xs mb-3">Podľa počtu unikátnych poslucháčov počas vysielania.</div>
                     {insights && insights.topEpisodes.length > 0 ? (
                        <div className="space-y-1.5">
                           {insights.topEpisodes.map((stat, index) => (
                              <Link
                                 key={stat.episode.id}
                                 href={`/dashboard/shows/${stat.showSlug}/${stat.episode.id}`}
                                 className="flex items-center justify-between gap-3 p-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                              >
                                 <div className="flex items-center gap-3 min-w-0">
                                    <div className="text-sm font-bold text-gray-400 w-5 flex-shrink-0">#{index + 1}</div>
                                    <CoverThumb assetId={stat.episode.Cover} alt={stat.episode.Title} size="sm" />
                                    <div className="min-w-0">
                                       <div className="text-sm font-medium text-white truncate">{stat.episode.Title}</div>
                                       <div className="text-xs text-gray-400">
                                          {new Date(stat.episode.Date).toLocaleDateString('sk-SK')} · špička {stat.peakListeners}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-sm font-bold text-purple-400 flex-shrink-0">{stat.uniqueListeners}</div>
                              </Link>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center text-gray-400 py-6 text-xs">Žiadne dáta</div>
                     )}
                  </div>
               </div>
            </>
         )}
      </div>
   );
}
