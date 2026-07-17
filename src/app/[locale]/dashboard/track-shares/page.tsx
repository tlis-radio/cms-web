'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import FilterBar from '@/components/dashboard/FilterBar';
import CoverThumb from '@/components/dashboard/CoverThumb';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeRange = '24h' | '7d' | '30d' | 'all';

type TrackShare = {
   id: number;
   episode: { id: number; Cover?: string };
   name: string;
   date_created: string;
};

type ChartDataPoint = {
   timestamp: string;
   shares: number;
};

export default function TrackSharesPage() {
   const { directusClient } = useDashboardAuth();
   const [shares, setShares] = useState<TrackShare[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [timeRange, setTimeRange] = useState<TimeRange>('30d');

   useEffect(() => {
      if (directusClient) {
         const service = new DashboardService(directusClient);

         service.getAllTrackShares().then((sharesData) => {
            setShares(sharesData as TrackShare[]);
            setIsLoading(false);
         }).catch((error) => {
            console.error('Error loading track shares:', error);
            setIsLoading(false);
         });
      }
   }, [directusClient]);

   const getChartData = (): ChartDataPoint[] => {
      if (shares.length === 0) return [];

      const now = new Date();
      const cutoffTime = new Date();

      switch (timeRange) {
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

      const filteredShares = shares.filter(s =>
         new Date(s.date_created) >= cutoffTime
      );

      if (filteredShares.length === 0) return [];

      const dataMap = new Map<string, number>();

      filteredShares.forEach((share) => {
         const date = new Date(share.date_created);
         let key: string;

         switch (timeRange) {
            case '24h':
               date.setMinutes(0, 0, 0);
               key = date.toISOString();
               break;
            case '7d':
               const hours = date.getHours();
               const roundedHours = Math.floor(hours / 3) * 3;
               date.setHours(roundedHours, 0, 0, 0);
               key = date.toISOString();
               break;
            case '30d':
               date.setHours(0, 0, 0, 0);
               key = date.toISOString();
               break;
            case 'all':
               const dayOfWeek = date.getDay();
               const diff = date.getDate() - dayOfWeek;
               date.setDate(diff);
               date.setHours(0, 0, 0, 0);
               key = date.toISOString();
               break;
         }

         const currentCount = dataMap.get(key) || 0;
         dataMap.set(key, currentCount + 1);
      });

      const chartData = Array.from(dataMap.entries())
         .map(([timestamp, shares]) => ({ timestamp, shares }))
         .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return chartData;
   };

   const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);

      switch (timeRange) {
         case '24h':
            return date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
         case '7d':
            return date.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' });
         case '30d':
            return date.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' });
         case 'all':
            return date.toLocaleDateString('sk-SK', { month: 'short', day: 'numeric' });
         default:
            return date.toLocaleString('sk-SK');
      }
   };

   const chartData = getChartData();

   const timeRangeOptions: { value: TimeRange; label: string }[] = [
      { value: '24h', label: '24 hodín' },
      { value: '7d', label: '7 dní' },
      { value: '30d', label: '30 dní' },
      { value: 'all', label: 'Celé obdobie' },
   ];

   // Group shares by episode for summary
   const getTopSharedEpisodes = () => {
      const episodeCounts: { [key: number]: { count: number; name: string; cover?: string } } = {};

      shares.forEach((share) => {
        if (!share.episode || !share.episode.id) return;
         if (!episodeCounts[share.episode.id]) {
            episodeCounts[share.episode.id] = { count: 0, name: share.name, cover: share.episode.Cover };
         }
         episodeCounts[share.episode.id].count++;
      });

      return Object.entries(episodeCounts)
         .map(([episodeId, data]) => ({
            episodeId: Number(episodeId),
            count: data.count,
            name: data.name,
            cover: data.cover,
         }))
         .sort((a, b) => b.count - a.count)
         .slice(0, 10);
   };

   const topEpisodes = getTopSharedEpisodes();

   return (
      <div className="max-w-7xl mx-auto">
         {isLoading ? (
            <div className="text-white text-center text-sm">Načítavam zdieľania...</div>
         ) : shares.length === 0 ? (
            <div className="text-center text-gray-400 mt-12 text-sm">
               Zatiaľ nie sú dostupné žiadne dáta o zdieľaniach.
            </div>
         ) : (
            <>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <StatCard label="Celkovo zdieľaní" value={shares.length} accent="purple" />
                  <StatCard label="Unikátne epizódy" value={new Set(shares.map(s => s.episode.id)).size} accent="blue" />
                  <StatCard
                     label="Najzdieľanejšia epizóda"
                     value={
                        topEpisodes.length > 0 ? (
                           <div className="flex items-baseline gap-1.5 min-w-0">
                              <span className="text-sm font-semibold text-red-400 truncate min-w-0">{topEpisodes[0].name}</span>
                              <span className="text-xs text-gray-400 flex-shrink-0">({topEpisodes[0].count}×)</span>
                           </div>
                        ) : (
                           '—'
                        )
                     }
                  />
               </div>

               <FilterBar title="Zdieľania">
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
                     Zdieľania v čase
                  </h2>
                  <div className="text-gray-400 text-xs mb-3">
                     Počet zdieľaní epizód za dané obdobie.
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
                              label={{ value: 'Zdieľania', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                           />
                           <Tooltip
                              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                              labelStyle={{ color: '#fff' }}
                              labelFormatter={(value) => new Date(value).toLocaleString('sk-SK')}
                           />
                           <Legend />
                           <Line
                              type="monotone"
                              dataKey="shares"
                              stroke="#A855F7"
                              name="Zdieľania"
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

               {/* Top Shared Episodes */}
               <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h2 className="text-sm font-semibold text-white mb-3">
                     Najzdieľanejšie epizódy
                  </h2>
                  {topEpisodes.length > 0 ? (
                     <div className="space-y-1.5">
                        {topEpisodes.map((item, index) => {
                           const maxCount = topEpisodes[0].count;
                           const percentage = (item.count / maxCount) * 100;

                           return (
                              <div key={item.episodeId} className="bg-gray-700 rounded-lg p-2.5">
                                 <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                       <div className="text-sm font-bold text-gray-400 w-6">
                                          #{index + 1}
                                       </div>
                                       <CoverThumb assetId={item.cover} alt={item.name} size="xs" />
                                       <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-white truncate">
                                             {item.name}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-sm font-bold text-purple-400 flex-shrink-0">
                                       {item.count}
                                    </div>
                                 </div>
                                 <div className="w-full bg-gray-600 h-1.5 rounded-full overflow-hidden">
                                    <div
                                       className="bg-purple-500 h-full rounded-full"
                                       style={{ width: `${percentage}%` }}
                                    />
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="text-center text-gray-400 py-6 text-xs">
                        Žiadne dáta
                     </div>
                  )}
               </div>

               {/* Recent Shares Table */}
               <div className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-white mb-3">
                     Posledné zdieľania
                  </h2>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-gray-700">
                              <th className="text-left text-gray-400 text-xs font-semibold py-1.5 px-3"></th>
                              <th className="text-left text-gray-400 text-xs font-semibold py-1.5 px-3">Čas</th>
                              <th className="text-left text-gray-400 text-xs font-semibold py-1.5 px-3">Názov</th>
                           </tr>
                        </thead>
                        <tbody>
                           {shares.slice(0, 50).map((share) => {
                              return (
                                 <tr key={share.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                    <td className="py-1.5 px-3">
                                       <CoverThumb assetId={share.episode?.Cover} alt={share.name} size="xs" />
                                    </td>
                                    <td className="text-white py-1.5 px-3">
                                       {new Date(share.date_created).toLocaleString('sk-SK')}
                                    </td>
                                    <td className="text-white py-1.5 px-3">
                                       {share.name}
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </>
         )}
      </div>
   );
}
