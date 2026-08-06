'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { countQualifiedListensForEpisode } from '@/lib/dashboard/listen-metrics';
import { TIME_FILTER_OPTIONS, useDashboardPeriod } from '@/lib/dashboard/useDashboardPeriod';
import FilterBar from '@/components/dashboard/FilterBar';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Episode } from '@/models/episode';
import { useParams, useRouter } from 'next/navigation';
import { EpisodeAnalytics, ListenerSessionDisplay } from '@/types/statistics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import CoverThumb from '@/components/dashboard/CoverThumb';
import UserDetailModal from '@/components/dashboard/UserDetailModal';

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
   const [timeFilter, setTimeFilter] = useDashboardPeriod();
   const [openSessionId, setOpenSessionId] = useState<string | null>(null);
   const [listenerStats, setListenerStats] = useState<Map<string, { otherEpisodes: number; meanProgress: number }>>(new Map());

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

            // Merge rows that a tracking race split across duplicate DB
            // entries so each listener shows one, correct completion %.
            const allSessions = service.mergeDuplicateSessions([
               ...archiveSessions,
               ...streamSessions,
            ]);

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

   // For each listener shown below, look up how many other episodes they've
   // listened to and their overall average completion. Uses each episode's
   // real audio duration (cached per episode, and reusing the duration we
   // already loaded for the current episode) rather than a fixed fallback -
   // a fallback here would disagree with the listener's own row above, which
   // is computed from the real duration, and produce contradictory numbers
   // (e.g. mean 100% when their only listen shows 91%).
   useEffect(() => {
      if (!directusClient || listeners.length === 0) return;

      const service = new DashboardService(directusClient);
      const uniqueSessionIds = Array.from(new Set(listeners.map((l) => l.sessionId)));
      const durationCache = new Map<string, number>([[String(episodeId), audioDuration]]);

      let cancelled = false;

      const getDuration = async (epIdStr: string): Promise<number> => {
         const cached = durationCache.get(epIdStr);
         if (cached !== undefined) return cached;

         let duration = 3600;
         try {
            const ep = await service.getEpisodeById(parseInt(epIdStr));
            if (ep?.Audio?.id) {
               duration = await service.getAudioDuration(ep.Audio.id);
            }
         } catch (e) {
            console.error('Error loading duration for episode', epIdStr, e);
         }
         durationCache.set(epIdStr, duration);
         return duration;
      };

      Promise.all(
         uniqueSessionIds.map(async (sid) => {
            const sessions = await service.getUserListeningSessions(sid);
            const merged = service.mergeDuplicateSessions(sessions);

            const episodeIds = new Set<string>();
            let totalProgress = 0;
            for (const s of merged) {
               const epId = s.episode_id || s.asset_id;
               if (!epId) continue;
               episodeIds.add(String(epId));
               const duration = await getDuration(String(epId));
               const { progress } = service.calculateListeningDuration(s.segments || [], duration);
               totalProgress += progress;
            }
            episodeIds.delete(String(episodeId));

            return [sid, {
               otherEpisodes: episodeIds.size,
               meanProgress: merged.length > 0 ? totalProgress / merged.length : 0,
            }] as const;
         })
      ).then((results) => {
         if (!cancelled) setListenerStats(new Map(results));
      });

      return () => { cancelled = true; };
   }, [directusClient, listeners, episodeId, audioDuration]);

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

   const engagementData = getEngagementChartData();

   // Split by source so the three cards add up: total = archive + live.
   // Uses the dashboard-wide period, so this page and the home page always
   // report the same number for the same episode.
   const listens = useMemo(() => {
      if (!analytics) return { total: 0, archive: 0, live: 0 };
      const since = new DashboardService(directusClient!).getCutoffDate(timeFilter);
      const archive = countQualifiedListensForEpisode(analytics.listeningSessions, episode, since);
      const live = countQualifiedListensForEpisode(analytics.listeningSessionsStream, episode, since);
      return { total: archive + live, archive, live };
   }, [analytics, episode, timeFilter, directusClient]);

   return (
      <div className="max-w-7xl mx-auto">
         <FilterBar>
            {TIME_FILTER_OPTIONS.map((option) => (
               <button
                  key={option.value}
                  onClick={() => setTimeFilter(option.value)}
                  className={`px-2 py-1 rounded text-xs transition ${
                     timeFilter === option.value
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
               >
                  {option.label}
               </button>
            ))}
         </FilterBar>

         <Link
            href={`/dashboard/shows/${slug}`}
            className="text-red-400 hover:text-red-300 transition text-sm mb-4 inline-block"
         >
            ← Späť na epizódy
         </Link>

         {isLoading ? (
            <div className="text-white text-center text-sm">Načítavam analytiku...</div>
         ) : episode && analytics ? (
            <>
               <div data-tour="episode-header" className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex gap-3">
                     <CoverThumb assetId={episode.Cover} alt={episode.Title} size="lg" />
                     <div className="flex-1">
                        <h1 className="text-lg font-bold text-white mb-1">
                           {episode.Title}
                        </h1>
                        <div className="text-gray-400 text-xs mb-2">
                           {new Date(episode.Date).toLocaleDateString('sk-SK')}
                        </div>
                        {episode.Audio && (
                           <audio
                              controls
                              className="w-full h-8"
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
                              Váš prehliadač nepodporuje prehrávanie zvuku.
                           </audio>
                        )}
                     </div>
                  </div>
               </div>

               {/* Summary Stats. Vypočutia = z archívu + naživo, all on the
                   same qualified-listen rule as the home dashboard. */}
               <div data-tour="episode-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                  <StatCard
                     label="Vypočutia"
                     value={listens.total}
                     accent="blue"
                     href={`/dashboard/users?show=${slug}&episode=${episodeId}`}
                  />
                  <StatCard label="Z archívu" value={listens.archive} accent="yellow" />
                  <StatCard label="Naživo" value={listens.live} accent="orange" />
                  <StatCard label="Zdieľania" value={analytics.trackShares.length} accent="purple" />
               </div>
               <div className="text-gray-400 text-xs mb-4">
                  Vypočutie = aspoň 5 minút prehraných (alebo tretina kratšej epizódy).
                  Spustení celkovo: {analytics.listeningSessions.length + analytics.listeningSessionsStream.length}
                  {' '}({analytics.listeningSessions.length} archív + {analytics.listeningSessionsStream.length} naživo).
               </div>

               {/* First Chart: Views, Shares */}
               <div data-tour="episode-engagement-chart" className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h2 className="text-sm font-semibold text-white mb-3">
                     Zapojenie v čase
                  </h2>
                  <ResponsiveContainer width="100%" height={260}>
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
                              label={{ value: 'Vydanie', position: 'top', fill: '#EF4444' }}
                           />
                        )}
                        <Line
                           type="monotone"
                           dataKey="views"
                           stroke="#3B82F6"
                           name="Vypočutia"
                           strokeWidth={2}
                        />
                        <Line
                           type="monotone"
                           dataKey="shares"
                           stroke="#A855F7"
                           name="Zdieľania"
                           strokeWidth={2}
                        />
                     </LineChart>
                  </ResponsiveContainer>
               </div>

               {/* Second Chart: Retention Rate */}
               <div data-tour="episode-retention-chart" className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h2 className="text-sm font-semibold text-white mb-1">
                     Miera udržania poslucháčov
                  </h2>
                  <div className="text-gray-400 text-xs mb-3">
                     Percento poslucháčov, ktorí sa dostali do daného bodu nahrávky
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                     <LineChart data={retentionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                           dataKey="time"
                           stroke="#9CA3AF"
                           label={{ value: 'Čas (HH:mm:ss)', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                        />
                        <YAxis
                           stroke="#9CA3AF"
                           label={{ value: 'Udržanie %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                           domain={[0, 100]}
                        />
                        <Tooltip
                           contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                           labelStyle={{ color: '#fff' }}
                           formatter={((value: any) => value !== undefined ? [`${value}%`, 'Udržanie'] : ['0%', 'Udržanie']) as any}
                        />
                        <Legend />
                        <Line
                           type="monotone"
                           dataKey="retention"
                           stroke="#F59E0B"
                           name="Udržanie (archív)"
                           strokeWidth={2}
                           dot={false}
                        />
                     </LineChart>
                  </ResponsiveContainer>
               </div>

               {/* Stream Retention Chart */}
               {streamRetentionData.length > 0 && (
                  <div data-tour="episode-stream-retention-chart" className="bg-gray-800 rounded-lg p-4 mb-4">
                     <h2 className="text-sm font-semibold text-white mb-1">
                        Miera udržania vysielania
                     </h2>
                     <div className="text-gray-400 text-xs mb-3">
                        Percento poslucháčov vysielania, ktorí sa dostali do daného bodu
                     </div>
                     <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={streamRetentionData}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis
                              dataKey="time"
                              stroke="#9CA3AF"
                              label={{ value: 'Čas', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                           />
                           <YAxis
                              stroke="#9CA3AF"
                              label={{ value: 'Udržanie %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                              domain={[0, 100]}
                           />
                           <Tooltip
                              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                              labelStyle={{ color: '#fff' }}
                              formatter={((value: any) => value !== undefined ? [`${value}%`, 'Udržanie'] : ['0%', 'Udržanie']) as any}
                           />
                           <Legend />
                           <Line
                              type="monotone"
                              dataKey="retention"
                              stroke="#EF4444"
                              name="Udržanie (vysielanie)"
                              strokeWidth={2}
                              dot={false}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               )}

               {/* Listeners List */}
               <div data-tour="episode-listeners" className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-white mb-3">
                     Jednotliví poslucháči
                  </h2>
                  {listeners.length > 0 ? (
                     <div className="space-y-1">
                        {listeners.map((listener) => (
                           <button
                              key={listener.id}
                              onClick={() => setOpenSessionId(listener.sessionId)}
                              className="w-full text-left rounded-md p-1.5 hover:bg-gray-700/40 transition"
                           >
                              <div className="flex flex-col gap-1">
                                 <div className="flex justify-between items-center">
                                    <div>
                                       <div className="flex items-center gap-2 mb-0.5">
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                             listener.type === 'Stream'
                                                ? 'bg-red-900/30 text-red-200 border-red-800'
                                                : 'bg-yellow-900/30 text-yellow-200 border-yellow-800'
                                          }`}>
                                             {listener.type}
                                          </span>
                                          <span className="text-white text-xs font-medium">
                                             Posluchač z {formatTimestamp(listener.startedAt)}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="text-white text-xs font-semibold">
                                          {formatDuration(listener.duration)}
                                       </div>
                                       <div className="text-gray-400 text-[10px]">
                                          {listener.progress.toFixed(0)}% dopočuté
                                       </div>
                                    </div>
                                 </div>

                                 <div className="w-full h-1 rounded-full border border-gray-600 overflow-hidden">
                                    <div
                                       className={`h-full ${listener.type === 'Stream' ? 'bg-red-500' : 'bg-yellow-500'}`}
                                       style={{ width: `${listener.progress}%` }}
                                    />
                                 </div>

                                 {listenerStats.has(listener.sessionId) && (
                                    <div className="text-gray-500 text-[10px]">
                                       {listenerStats.get(listener.sessionId)!.otherEpisodes} ďalších epizód · priemerne{' '}
                                       {listenerStats.get(listener.sessionId)!.meanProgress.toFixed(0)}% dopočuté
                                    </div>
                                 )}
                              </div>
                           </button>
                        ))}
                     </div>
                  ) : (
                     <div className="text-center text-gray-400 py-6 text-xs">
                        Zatiaľ neboli zaznamenané žiadne relácie počúvania.
                     </div>
                  )}
               </div>
            </>
         ) : (
            <div className="text-center text-gray-400 mt-12 text-sm">
               Epizóda nebola nájdená.
            </div>
         )}

         {openSessionId && <UserDetailModal sessionId={openSessionId} onClose={() => setOpenSessionId(null)} />}
      </div>
   );
}
