'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Episode } from '@/models/episode';
import { useParams, useRouter } from 'next/navigation';
import { EpisodeAnalytics, ListenerSessionDisplay } from '@/types/statistics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function EpisodeAnalyticsPage() {
   const params = useParams();
   const router = useRouter();
   const slug = params.slug as string;
   const episodeId = parseInt(params.episodeId as string);
   
   const { directusClient } = useDashboardAuth();
   const [episode, setEpisode] = useState<Episode | null>(null);
   const [analytics, setAnalytics] = useState<EpisodeAnalytics | null>(null);
   const [listeners, setListeners] = useState<ListenerSessionDisplay[]>([]);
   const [retentionData, setRetentionData] = useState<Array<{ time: string; retention: number }>>([]);
   const [streamRetentionData, setStreamRetentionData] = useState<Array<{ time: string; retention: number }>>([]);
   const [audioDuration, setAudioDuration] = useState<number>(3600); // Default 1 hour
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      if (!directusClient || !episodeId) return;

      const service = new DashboardService(directusClient);
      
      Promise.all([
         service.getEpisodeById(episodeId),
         service.getEpisodeAnalytics(episodeId),
      ]).then(async ([episodeData, analyticsData]) => {
         if (!episodeData) {
            router.push('/404');
            return;
         }
         setEpisode(episodeData);
         setAnalytics(analyticsData);

         // Get audio duration from Directus file metadata
         let trackDuration = 3600; // Default
         if (episodeData.Audio) {
            trackDuration = await service.getAudioDuration(episodeData.Audio.id);
         }
         setAudioDuration(trackDuration);

         // Process listening sessions for display (combine both types)
         if (analyticsData) {
            const archiveSessions = analyticsData.listeningSessions.map(s => ({ ...s, type: 'Archive' as const }));
            const streamSessions = analyticsData.listeningSessionsStream.map(s => ({ ...s, type: 'Stream' as const }));

            const allSessions = [
               ...archiveSessions,
               ...streamSessions,
            ];
            
            const processedListeners = allSessions.map((session) => {
               const { duration, progress } = service.calculateListeningDuration(
                  session.segments || [],
                  trackDuration
               );
               
               return {
                  id: session.id,
                  sessionId: session.session_id,
                  duration,
                  progress,
                  startedAt: session.date_created,
                  type: session.type,
               };
            });

            // Sort by most recent first
            processedListeners.sort((a, b) => 
               new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
            );
            
            setListeners(processedListeners);

            // Calculate retention data for graphs
            const retention = service.calculateRetentionData(
               analyticsData.listeningSessions,
               trackDuration
            );
            
            // Format retention time to HH:MM:SS
            const formattedRetention = retention.map((item, index) => {
               const seconds = index * 15; // 15s segments
               const h = Math.floor(seconds / 3600);
               const m = Math.floor((seconds % 3600) / 60);
               const s = seconds % 60;
               const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
               return { ...item, time };
            });
            setRetentionData(formattedRetention);

            const streamRetention = service.calculateStreamRetentionData(
               analyticsData.listeningSessionsStream,
               trackDuration
            );

            // Format stream retention time to absolute time based on episode Date
            const formattedStreamRetention = streamRetention.map((item, index) => {
               const secondsOffset = index * 15;
               // If episodeData.Date is available
               if (episodeData.Date) {
                  const date = new Date(episodeData.Date);
                  date.setSeconds(date.getSeconds() + secondsOffset);
                  const time = date.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  return { ...item, time };
               }
               // Fallback to relative HH:MM:SS
               const h = Math.floor(secondsOffset / 3600);
               const m = Math.floor((secondsOffset % 3600) / 60);
               const s = secondsOffset % 60;
               const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
               return { ...item, time };
            });
            setStreamRetentionData(formattedStreamRetention);
         }

         setIsLoading(false);
      });
   }, [directusClient, episodeId]);

   const formatTimestamp = (timestamp: string) => {
      return new Date(timestamp).toLocaleString('sk-SK', {
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });
   };

   const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      if (hours > 0) {
         return `${hours}h ${minutes}m ${secs}s`;
      } else if (minutes > 0) {
         return `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
   };

   // Prepare data for first chart (views, shares)
   const getEngagementChartData = () => {
      if (!analytics) return [];

      const dataMap = new Map<string, { timestamp: string; views: number; shares: number }>();

      // Aggregate by hour
      const aggregateByHour = (timestamp: string) => {
         const date = new Date(timestamp);
         date.setMinutes(0, 0, 0);
         return date.toISOString();
      };

      analytics.trackViews.forEach((view) => {
         const key = aggregateByHour(view.date_created);
         const entry = dataMap.get(key) || { timestamp: key, views: 0, shares: 0 };
         entry.views++;
         dataMap.set(key, entry);
      });

      analytics.trackShares.forEach((share) => {
         const key = aggregateByHour(share.date_created);
         const entry = dataMap.get(key) || { timestamp: key, views: 0, shares: 0 };
         entry.shares++;
         dataMap.set(key, entry);
      });

      return Array.from(dataMap.values()).sort((a, b) => 
         new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
   };

   // Prepare data for second chart (listening sessions)
   const getSessionsChartData = () => {
      if (!analytics) return [];

      const dataMap = new Map<string, { timestamp: string; sessions: number; streamSessions: number }>();

      const aggregateByHour = (timestamp: string) => {
         const date = new Date(timestamp);
         date.setMinutes(0, 0, 0);
         return date.toISOString();
      };

      analytics.listeningSessions.forEach((session) => {
         const key = aggregateByHour(session.date_created);
         const entry = dataMap.get(key) || { timestamp: key, sessions: 0, streamSessions: 0 };
         entry.sessions++;
         dataMap.set(key, entry);
      });

      analytics.listeningSessionsStream.forEach((session) => {
         const key = aggregateByHour(session.date_created);
         const entry = dataMap.get(key) || { timestamp: key, sessions: 0, streamSessions: 0 };
         entry.streamSessions++;
         dataMap.set(key, entry);
      });

      return Array.from(dataMap.values()).sort((a, b) => 
         new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
   };

   const engagementData = getEngagementChartData();
   const sessionsData = getSessionsChartData();

   return (
      <AuthGuard>
         <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
               <DashboardHeader>
                  <Link
                     href={`/dashboard/shows/${slug}`}
                     className="text-red-400 hover:text-red-300 transition"
                  >
                     ← Back to Episodes
                  </Link>
               </DashboardHeader>

               {isLoading ? (
                  <div className="text-white text-center">Loading analytics...</div>
               ) : episode && analytics ? (
                  <>
                     <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <div className="flex gap-4">
                           {episode.Cover && (
                              <div className="w-24 h-24 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                 <img
                                    src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Cover}`}
                                    alt={episode.Title}
                                    className="w-full h-full object-cover"
                                 />
                              </div>
                           )}
                           <div className="flex-1">
                              <h1 className="text-3xl font-bold text-white mb-2">
                                 {episode.Title}
                              </h1>
                              <div className="text-gray-400 mb-3">
                                 {new Date(episode.Date).toLocaleDateString('sk-SK')}
                              </div>
                              {episode.Audio && (
                                 <audio 
                                    controls 
                                    className="w-full"
                                    preload="metadata"
                                    onLoadedMetadata={(e) => {
                                       const audio = e.target as HTMLAudioElement;
                                       if (audio.duration && !isNaN(audio.duration)) {
                                          setAudioDuration(Math.floor(audio.duration));
                                       }
                                    }}
                                 >
                                    <source 
                                       src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${episode.Audio.id}`} 
                                       type="audio/mpeg" 
                                    />
                                    Your browser does not support the audio element.
                                 </audio>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Summary Stats */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Track Views</div>
                           <div className="text-3xl font-bold text-blue-400">
                              {analytics.trackViews.length}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Shares</div>
                           <div className="text-3xl font-bold text-purple-400">
                              {analytics.trackShares.length}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Sessions</div>
                           <div className="text-3xl font-bold text-yellow-400">
                              {analytics.listeningSessions.length}
                           </div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-4">
                           <div className="text-gray-400 text-sm">Stream Sessions</div>
                           <div className="text-3xl font-bold text-orange-400">
                              {analytics.listeningSessionsStream.length}
                           </div>
                        </div>
                     </div>

                     {/* First Chart: Views, Shares */}
                     <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">
                           Engagement Over Time
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                           <LineChart data={engagementData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                 dataKey="timestamp" 
                                 stroke="#9CA3AF"
                                 tickFormatter={(value) => formatTimestamp(value)}
                              />
                              <YAxis stroke="#9CA3AF" />
                              <Tooltip 
                                 contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                 labelStyle={{ color: '#fff' }}
                                 labelFormatter={(value) => formatTimestamp(value)}
                              />
                              <Legend />
                              {episode && (
                                 <ReferenceLine
                                    x={new Date(episode.Date).toISOString()}
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    label={{ value: 'Release', position: 'top', fill: '#EF4444' }}
                                 />
                              )}
                              <Line 
                                 type="monotone" 
                                 dataKey="views" 
                                 stroke="#3B82F6" 
                                 name="Track Views"
                                 strokeWidth={2}
                              />
                              <Line 
                                 type="monotone" 
                                 dataKey="shares" 
                                 stroke="#A855F7" 
                                 name="Shares"
                                 strokeWidth={2}
                              />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>

                     {/* Second Chart: Retention Rate */}
                     <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">
                           Listening Retention Rate
                        </h2>
                        <div className="text-gray-400 text-sm mb-4">
                           Shows the percentage of listeners who reached each point in the audio
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                           <LineChart data={retentionData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                 dataKey="time" 
                                 stroke="#9CA3AF"
                                 label={{ value: 'Time (HH:mm:ss)', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                              />
                              <YAxis 
                                 stroke="#9CA3AF"
                                 label={{ value: 'Retention %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                                 domain={[0, 100]}
                              />
                              <Tooltip 
                                 contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                 labelStyle={{ color: '#fff' }}
                                 formatter={((value: any) => value !== undefined ? [`${value}%`, 'Retention'] : ['0%', 'Retention']) as any}
                              />
                              <Legend />
                              <Line 
                                 type="monotone" 
                                 dataKey="retention" 
                                 stroke="#F59E0B" 
                                 name="Track Sessions Retention"
                                 strokeWidth={2}
                                 dot={false}
                              />
                           </LineChart>
                        </ResponsiveContainer>
                     </div>

                     {/* Stream Retention Chart */}
                     {streamRetentionData.length > 0 && (
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                           <h2 className="text-2xl font-bold text-white mb-4">
                              Stream Listening Retention Rate
                           </h2>
                           <div className="text-gray-400 text-sm mb-4">
                              Shows the percentage of stream listeners who reached each point
                           </div>
                           <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={streamRetentionData}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                 <XAxis 
                                    dataKey="time" 
                                    stroke="#9CA3AF"
                                    label={{ value: 'Time', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                                 />
                                 <YAxis 
                                    stroke="#9CA3AF"
                                    label={{ value: 'Retention %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                                    domain={[0, 100]}
                                 />
                                 <Tooltip 
                                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                    labelStyle={{ color: '#fff' }}
                                    formatter={((value: any) => value !== undefined ? [`${value}%`, 'Retention'] : ['0%', 'Retention']) as any}
                                 />
                                 <Legend />
                                 <Line 
                                    type="monotone" 
                                    dataKey="retention" 
                                    stroke="#EF4444" 
                                    name="Stream Sessions Retention"
                                    strokeWidth={2}
                                    dot={false}
                                 />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     )}

                     {/* Listeners List */}
                     <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">
                           Individual Listeners
                        </h2>
                        {listeners.length > 0 ? (
                           <div className="space-y-2">
                              {listeners.map((listener) => (
                                 <Link
                                    key={listener.id}
                                    href={`/dashboard/users/${listener.sessionId}`}
                                    className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition"
                                 >
                                    <div className="flex flex-col gap-3">
                                       <div className="flex justify-between items-center">
                                          <div>
                                             <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${
                                                   listener.type === 'Stream' 
                                                      ? 'bg-red-900/30 text-red-200 border-red-800' 
                                                      : 'bg-yellow-900/30 text-yellow-200 border-yellow-800'
                                                }`}>
                                                   {listener.type}
                                                </span>
                                                <span className="text-white font-medium font-mono">
                                                   {listener.sessionId}
                                                </span>
                                             </div>
                                             <div className="text-gray-400 text-sm">
                                                Started: {formatTimestamp(listener.startedAt)}
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <div className="text-white font-semibold">
                                                {formatDuration(listener.duration)}
                                             </div>
                                             <div className="text-gray-400 text-sm">
                                                {listener.progress.toFixed(0)}% completed
                                             </div>
                                          </div>
                                       </div>
                                       
                                       <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                          <div 
                                             className={`h-full ${listener.type === 'Stream' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                             style={{ width: `${listener.progress}%` }}
                                          />
                                       </div>
                                    </div>
                                 </Link>
                              ))}
                           </div>
                        ) : (
                           <div className="text-center text-gray-400 py-8">
                              No listening sessions recorded yet.
                           </div>
                        )}
                     </div>
                  </>
               ) : (
                  <div className="text-center text-gray-400 mt-12">
                     Episode not found.
                  </div>
               )}
            </div>
         </div>
      </AuthGuard>
   );
}
