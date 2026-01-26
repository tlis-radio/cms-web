'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useRef, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BaseListeningSession } from '@/types/statistics';
import { Episode } from '@/models/episode';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

type SessionWithEpisode = BaseListeningSession & {
   episode: Episode | null;
   duration: number;
   progress: number;
   trackDuration: number;
   loaded: boolean;
   loading?: boolean;
};

export default function UserDetailPage() {
   const params = useParams();
   const userId = params.id as string;
   
   const { directusClient } = useDashboardAuth();
   const [sessions, setSessions] = useState<SessionWithEpisode[]>([]);
   const [isLoadingList, setIsLoadingList] = useState(true);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   
   const cache = useRef(new Map<string, { episode: Episode | null, duration: number }>());
   const processingRef = useRef(false);
   const observerTarget = useRef<HTMLDivElement>(null);

   const loadSessions = useCallback(async (pageNum: number) => {
      if (!directusClient || !userId) return;
      if (pageNum === 1) setIsLoadingList(true);
      
      const service = new DashboardService(directusClient);
      const { sessions: newSessions, hasMore: more } = await service.getUserHistory(userId, pageNum, 20);
      
      const prepared: SessionWithEpisode[] = newSessions.map(s => ({
          ...s,
          episode: null,
          duration: 0,
          progress: 0,
          trackDuration: 0,
          loaded: false,
          loading: false
      }));
      
      setSessions(prev => pageNum === 1 ? prepared : [...prev, ...prepared]);
      setHasMore(more);
      setIsLoadingList(false);
   }, [directusClient, userId]);

   useEffect(() => {
      loadSessions(1);
   }, [loadSessions]);

   // Infinite Scroll Observer
   useEffect(() => {
      const observer = new IntersectionObserver(
         entries => {
            if (entries[0].isIntersecting && hasMore && !isLoadingList) {
               setPage(prev => {
                   const nextPage = prev + 1;
                   loadSessions(nextPage);
                   return nextPage;
               });
            }
         },
         { threshold: 1.0 }
      );

      if (observerTarget.current) {
         observer.observe(observerTarget.current);
      }

      return () => observer.disconnect();
   }, [hasMore, isLoadingList, loadSessions]);

   // Sequential Processing Queue
   useEffect(() => {
      if (!directusClient) return;

      const processNext = async () => {
         if (processingRef.current) return;
         
         const index = sessions.findIndex(s => !s.loaded && !s.loading);
         if (index === -1) return;
         
         processingRef.current = true;
         
         setSessions(prev => {
             const next = [...prev];
             if (next[index]) next[index] = { ...next[index], loading: true };
             return next;
         });
         
         try {
             const session = sessions[index];
             const service = new DashboardService(directusClient);
             const episodeIdStr = (session as any).asset_id || session.episode_id;
             const episodeId = parseInt(episodeIdStr);
             
             let episodeData = cache.current.get(String(episodeId));
             
             if (!episodeData) {
                 const episode = await service.getEpisodeById(episodeId);
                 let trackDuration = 3600;
                 if (episode?.Audio?.id) {
                     trackDuration = await service.getAudioDuration(episode.Audio.id);
                 }
                 episodeData = { episode, duration: trackDuration };
                 cache.current.set(String(episodeId), episodeData);
             }
             
             const { duration, progress } = service.calculateListeningDuration(
                 session.segments || [],
                 episodeData.duration
             );
             
             setSessions(prev => {
                 const next = [...prev];
                 if (next[index]) {
                     next[index] = {
                         ...next[index],
                         episode: episodeData!.episode,
                         trackDuration: episodeData!.duration,
                         duration,
                         progress,
                         loaded: true,
                         loading: false
                     };
                 }
                 return next;
             });
         } catch (e) {
             console.error("Error processing session", e);
             setSessions(prev => {
                 const next = [...prev];
                 if (next[index]) next[index] = { ...next[index], loaded: true, loading: false };
                 return next;
             });
         } finally {
             processingRef.current = false;
         }
      };
      
      processNext();
   }, [sessions, directusClient]);

   const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
      return `${minutes}m ${secs}s`;
   };

   return (
      <AuthGuard>
         <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
               <DashboardHeader>
                  <Link
                     href="/dashboard/users"
                     className="text-red-400 hover:text-red-300 transition"
                  >
                     ← Back to Users
                  </Link>
               </DashboardHeader>

               <div className="bg-gray-800 rounded-lg p-6 mb-8">
                  <h1 className="text-3xl font-bold text-white mb-4">
                     User Listening History
                  </h1>
                  <div className="text-gray-400 mb-4">
                     User ID: <span className="font-mono">{userId}</span>
                  </div>
               </div>

               {isLoadingList && sessions.length === 0 ? (
                  <div className="text-white text-center">Loading sessions...</div>
               ) : sessions.length > 0 ? (
                  <div className="space-y-4">
                     {sessions.map((session, i) => (
                        <div
                           key={`${session.id}-${i}`}
                           className="bg-gray-800 rounded-lg p-6 min-h-[120px]"
                        >
                            {!session.loaded ? (
                                <div className="flex items-center justify-center p-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                </div>
                            ) : (
                               <div className="flex gap-4">
                                  <div className="flex-1">
                                     <div className="flex justify-between items-start">
                                         <h3 className="text-xl font-semibold text-white mb-2">
                                            {session.episode?.Title || 'Unknown Episode'}
                                         </h3>
                                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                             session.type === 'live' 
                                                ? 'bg-red-900 text-red-200' 
                                                : 'bg-blue-900 text-blue-200'
                                         }`}>
                                             {session.type === 'live' ? 'Live Stream' : 'Archive'}
                                         </span>
                                     </div>
                                     
                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                        <div>
                                           <div className="text-gray-400">Track</div>
                                           <div className="text-white">{formatDuration(session.trackDuration)}</div>
                                        </div>
                                        <div>
                                           <div className="text-gray-400">Listened</div>
                                           <div className="text-white">{formatDuration(session.duration)}</div>
                                        </div>
                                        <div>
                                           <div className="text-gray-400">Date</div>
                                           <div className="text-white">{new Date(session.date_created).toLocaleDateString()}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">Progress</div>
                                            <div className="text-white font-bold">{session.progress.toFixed(0)}%</div>
                                        </div>
                                     </div>

                                     <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                         <div 
                                             className={`h-full ${session.type === 'live' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                             style={{ width: `${session.progress}%` }}
                                         />
                                     </div>
                                  </div>
                               </div>
                            )}
                        </div>
                     ))}
                     {hasMore && (
                        <div ref={observerTarget} className="text-center py-4 text-gray-500">
                           Loading more...
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-white text-center">No sessions found.</div>
               )}
            </div>
         </div>
      </AuthGuard>
   );
}
