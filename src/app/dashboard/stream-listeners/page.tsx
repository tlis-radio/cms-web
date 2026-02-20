'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
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
   const [isLoading, setIsLoading] = useState(true);
   const [timeRange, setTimeRange] = useState<TimeRange>('24h');

   useEffect(() => {
      if (directusClient) {
         const service = new DashboardService(directusClient);
         service.getAllStreamListeners().then((data) => {
            setListeners(data);
            setIsLoading(false);
         }).catch((error) => {
            console.error('Error loading stream listeners:', error);
            setIsLoading(false);
         });
      }
   }, [directusClient]);

   const getChartData = (): ChartDataPoint[] => {
      if (listeners.length === 0) return [];

      // Filter by time range
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
            cutoffTime.setFullYear(2000); // Far past
            break;
      }

      const filteredListeners = listeners.filter(l => 
         new Date(l.date_created) >= cutoffTime
      );

      if (filteredListeners.length === 0) return [];

      // Aggregate based on time range
      const dataMap = new Map<string, number>();

      filteredListeners.forEach((listener) => {
         const date = new Date(listener.date_created);
         let key: string;

         switch (timeRange) {
            case '1h':
               // Sample each minute
               date.setSeconds(0, 0);
               key = date.toISOString();
               break;
            case '24h':
               // Take max from every 30 minutes
               const minutes = date.getMinutes();
               const roundedMinutes = Math.floor(minutes / 30) * 30;
               date.setMinutes(roundedMinutes, 0, 0);
               key = date.toISOString();
               break;
            case '7d':
               // Take max from every hour
               date.setMinutes(0, 0, 0);
               key = date.toISOString();
               break;
            case '30d':
               // Take max from every 4 hours
               const hours = date.getHours();
               const roundedHours = Math.floor(hours / 4) * 4;
               date.setHours(roundedHours, 0, 0, 0);
               key = date.toISOString();
               break;
            case 'all':
               // Take max from every day
               date.setHours(0, 0, 0, 0);
               key = date.toISOString();
               break;
         }

         // Take MAX (count is always 1, but we use max in case it changes)
         const currentMax = dataMap.get(key) || 0;
         dataMap.set(key, Math.max(currentMax, listener.count));
      });

      // Convert to array and sort by timestamp
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

   const chartData = getChartData();
   const max = chartData.length > 0 ? Math.max(...chartData.map(d => d.listeners)) : null;

   const timeRangeOptions: { value: TimeRange; label: string }[] = [
      { value: '1h', label: '1 Hour' },
      { value: '24h', label: '24 Hours' },
      { value: '7d', label: '7 Days' },
      { value: '30d', label: '30 Days' },
      { value: 'all', label: 'All Time' },
   ];

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
                  <h1 className="text-4xl font-bold text-white">Stream Listeners</h1>
               </DashboardHeader>

               {isLoading ? (
                  <div className="text-white text-center">Loading stream listeners...</div>
               ) : listeners.length === 0 ? (
                  <div className="text-center text-gray-400 mt-12">
                     No stream listener data available. Data will appear here when streaming activity occurs.
                  </div>
               ) : (
                  <>
                     {/* Summary Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Total Listeners</div>
                           <div className="text-3xl font-bold text-blue-400">
                              {max !== null ? max : 'No data'}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">First Recorded</div>
                           <div className="text-lg font-semibold text-white">
                              {new Date(listeners[listeners.length - 1]?.date_created || '').toLocaleString('sk-SK')}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Latest</div>
                           <div className="text-lg font-semibold text-white">
                              {new Date(listeners[0]?.date_created || '').toLocaleString('sk-SK')}
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
                           Listeners Over Time
                        </h2>
                        <div className="text-gray-400 text-sm mb-4">
                           Showing maximum concurrent listeners per time bucket. Data is aggregated using MAX values.
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
                                    label={{ value: 'Listeners', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
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
                                    name="Concurrent Listeners"
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
                  </>
               )}
            </div>
         </div>
      </AuthGuard>
   );
}
