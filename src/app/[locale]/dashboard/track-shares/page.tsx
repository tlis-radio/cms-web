'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type TimeRange = '24h' | '7d' | '30d' | 'all';

type TrackShare = {
   id: number;
   episode: { id: number };
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
            setShares(sharesData);
            setIsLoading(false);
         }).catch((error) => {
            console.error('Error loading track shares:', error);
            setIsLoading(false);
         });
      }
   }, [directusClient]);

   const getChartData = (): ChartDataPoint[] => {
      if (shares.length === 0) return [];

      // Filter by time range
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
            cutoffTime.setFullYear(2000); // Far past
            break;
      }

      const filteredShares = shares.filter(s => 
         new Date(s.date_created) >= cutoffTime
      );

      if (filteredShares.length === 0) return [];

      // Aggregate based on time range
      const dataMap = new Map<string, number>();

      filteredShares.forEach((share) => {
         const date = new Date(share.date_created);
         let key: string;

         switch (timeRange) {
            case '24h':
               // Aggregate by hour
               date.setMinutes(0, 0, 0);
               key = date.toISOString();
               break;
            case '7d':
               // Aggregate by 3 hours
               const hours = date.getHours();
               const roundedHours = Math.floor(hours / 3) * 3;
               date.setHours(roundedHours, 0, 0, 0);
               key = date.toISOString();
               break;
            case '30d':
               // Aggregate by day
               date.setHours(0, 0, 0, 0);
               key = date.toISOString();
               break;
            case 'all':
               // Aggregate by week
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

      // Convert to array and sort by timestamp
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
      { value: '24h', label: '24 Hours' },
      { value: '7d', label: '7 Days' },
      { value: '30d', label: '30 Days' },
      { value: 'all', label: 'All Time' },
   ];

   // Group shares by episode for summary
   const getTopSharedEpisodes = () => {
      const episodeCounts: { [key: number]: { count: number; name: string } } = {};
      
      shares.forEach((share) => {
        if (!share.episode || !share.episode.id) return;
         if (!episodeCounts[share.episode.id]) {
            episodeCounts[share.episode.id] = { count: 0, name: share.name };
         }
         episodeCounts[share.episode.id].count++;
      });

      return Object.entries(episodeCounts)
         .map(([episodeId, data]) => ({ 
            episodeId: Number(episodeId), 
            count: data.count, 
            name: data.name 
         }))
         .sort((a, b) => b.count - a.count)
         .slice(0, 10);
   };

   const topEpisodes = getTopSharedEpisodes();

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
                  <h1 className="text-4xl font-bold text-white">Track Shares</h1>
               </DashboardHeader>

               {isLoading ? (
                  <div className="text-white text-center">Loading track shares...</div>
               ) : shares.length === 0 ? (
                  <div className="text-center text-gray-400 mt-12">
                     No track share data available yet.
                  </div>
               ) : (
                  <>
                     {/* Summary Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Total Shares</div>
                           <div className="text-3xl font-bold text-purple-400">
                              {shares.length}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Unique Episodes</div>
                           <div className="text-3xl font-bold text-blue-400">
                              {new Set(shares.map(s => s.episode.id)).size}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Latest Share</div>
                           <div className="text-lg font-semibold text-white">
                              {new Date(shares[0]?.date_created || '').toLocaleString('sk-SK')}
                           </div>
                        </div>
                     </div>

                     {/* Time Range Filter */}
                     <div className="mb-6">
                        <div className="flex gap-2 flex-wrap">
                           {timeRangeOptions.map((option) => (
                              <button
                                 key={option.value}
                                 onClick={() => setTimeRange(option.value)}
                                 className={`px-4 py-2 rounded-lg transition ${
                                    timeRange === option.value
                                       ? 'bg-red-500 text-white'
                                       : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                 }`}
                              >
                                 {option.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Chart */}
                     <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">
                           Shares Over Time
                        </h2>
                        <div className="text-gray-400 text-sm mb-4">
                           Number of times episodes were shared per time period.
                        </div>
                        {chartData.length > 0 ? (
                           <ResponsiveContainer width="100%" height={400}>
                              <LineChart data={chartData}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                 <XAxis 
                                    dataKey="timestamp" 
                                    stroke="#9CA3AF"
                                    tickFormatter={(value) => formatTimestamp(value)}
                                 />
                                 <YAxis 
                                    stroke="#9CA3AF"
                                    label={{ value: 'Shares', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
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
                                    name="Shares"
                                    strokeWidth={2}
                                 />
                              </LineChart>
                           </ResponsiveContainer>
                        ) : (
                           <div className="text-center text-gray-400 py-8">
                              No data available for the selected time range.
                           </div>
                        )}
                     </div>

                     {/* Top Shared Episodes */}
                     <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">
                           Top Shared Episodes
                        </h2>
                        {topEpisodes.length > 0 ? (
                           <div className="space-y-2">
                              {topEpisodes.map((item, index) => {
                                 const maxCount = topEpisodes[0].count;
                                 const percentage = (item.count / maxCount) * 100;
                                 
                                 return (
                                    <div key={item.episodeId} className="bg-gray-700 rounded-lg p-4">
                                       <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-4 flex-1">
                                             <div className="text-2xl font-bold text-gray-400 w-8">
                                                #{index + 1}
                                             </div>
                                             <div className="flex-1">
                                                <div className="text-lg font-semibold text-white">
                                                   {item.name}
                                                </div>
                                             </div>
                                          </div>
                                          <div className="text-2xl font-bold text-purple-400">
                                             {item.count}
                                          </div>
                                       </div>
                                       {/* Percentage Bar */}
                                       <div className="w-full bg-gray-600 h-3 rounded-full overflow-hidden">
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
                           <div className="text-center text-gray-400 py-8">
                              No data
                           </div>
                        )}
                     </div>

                     {/* Recent Shares Table */}
                     <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                           Recent Shares
                        </h2>
                        <div className="overflow-x-auto">
                           <table className="w-full">
                              <thead>
                                 <tr className="border-b border-gray-700">
                                    <th className="text-left text-gray-400 text-sm font-semibold py-3 px-4">Time</th>
                                    <th className="text-left text-gray-400 text-sm font-semibold py-3 px-4">Name</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {shares.slice(0, 50).map((share) => {
                                    return (
                                       <tr key={share.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                          <td className="text-white py-3 px-4">
                                             {new Date(share.date_created).toLocaleString('sk-SK')}
                                          </td>
                                          <td className="text-white py-3 px-4">
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
         </div>
      </AuthGuard>
   );
}
