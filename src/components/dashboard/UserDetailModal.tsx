'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { estimateEpisodeDurationSeconds } from '@/lib/dashboard/listen-metrics';
import { useRef, useCallback, useEffect, useState } from 'react';
import { BaseListeningSession } from '@/types/statistics';
import { Episode } from '@/models/episode';
import CoverThumb from '@/components/dashboard/CoverThumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';

type SessionWithEpisode = BaseListeningSession & {
   episode: Episode | null;
   duration: number;
   progress: number;
   trackDuration: number;
   loaded: boolean;
   loading?: boolean;
};

type UserDetailModalProps = {
   sessionId: string;
   onClose: () => void;
};

export default function UserDetailModal({ sessionId, onClose }: UserDetailModalProps) {
   const { directusClient } = useDashboardAuth();
   const [sessions, setSessions] = useState<SessionWithEpisode[]>([]);
   const [isLoadingList, setIsLoadingList] = useState(true);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [firstSeen, setFirstSeen] = useState<string | null>(null);
   const [copied, setCopied] = useState(false);

   const cache = useRef(new Map<string, { episode: Episode | null, duration: number }>());
   const processingRef = useRef(false);
   const observerTarget = useRef<HTMLDivElement>(null);

   const loadSessions = useCallback(async (pageNum: number) => {
      if (!directusClient || !sessionId) return;
      if (pageNum === 1) setIsLoadingList(true);

      const service = new DashboardService(directusClient);
      const { sessions: newSessions, hasMore: more } = await service.getUserHistory(sessionId, pageNum, 20);

      // Merge rows a tracking race split across duplicate DB entries so the
      // completion % shown here matches what's shown on the episode page.
      const mergedSessions = service.mergeDuplicateSessions(newSessions);

      const prepared: SessionWithEpisode[] = mergedSessions.map(s => ({
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
   }, [directusClient, sessionId]);

   useEffect(() => {
      setSessions([]);
      setPage(1);
      setHasMore(true);
      loadSessions(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [sessionId, directusClient]);

   useEffect(() => {
      if (!directusClient || !sessionId) return;
      const service = new DashboardService(directusClient);
      service.getUserFirstSeen(sessionId).then(setFirstSeen);
   }, [directusClient, sessionId]);

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
             const episodeIdStr = session.episode_id || (session as any).asset_id;
             const episodeId = parseInt(episodeIdStr);

             let episodeData = cache.current.get(String(episodeId));

             if (!episodeData) {
                 const episode = await service.getEpisodeById(episodeId);
                 // Same estimate as the rest of the dashboard, so percentages match.
                 const trackDuration = estimateEpisodeDurationSeconds(episode) || 3600;
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

   const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString('sk-SK', { year: 'numeric', month: 'long', day: 'numeric' });

   const copyUserId = () => {
      navigator.clipboard.writeText(sessionId).then(() => {
         setCopied(true);
         setTimeout(() => setCopied(false), 1500);
      });
   };

   useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div className="absolute inset-0 bg-black/60" onClick={onClose} />
         <div className="relative z-10 w-full max-w-3xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 flex-shrink-0">
               <div className="min-w-0">
                  <h1 className="text-sm font-bold text-white mb-1 truncate">
                     {firstSeen ? `Poslucháč od ${formatDate(firstSeen)}` : 'Poslucháč'}
                  </h1>
                  <button
                     onClick={copyUserId}
                     className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition text-[10px] font-mono"
                     title="Kopírovať session ID"
                  >
                     <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="w-3" />
                     {sessionId}
                  </button>
               </div>
               <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 flex-shrink-0">
                  <FontAwesomeIcon icon={faXmark} />
               </button>
            </div>

            <div className="overflow-y-auto px-4 py-4">
               {isLoadingList && sessions.length === 0 ? (
                  <div className="text-white text-center text-sm">Načítavam relácie...</div>
               ) : sessions.length > 0 ? (
                  <div className="space-y-2">
                     {sessions.map((session, i) => (
                        <div
                           key={`${session.id}-${i}`}
                           className="bg-gray-800 rounded-lg p-3 min-h-[90px]"
                        >
                            {!session.loaded ? (
                                <div className="flex items-center justify-center p-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                                </div>
                            ) : (
                               <div className="flex gap-3">
                                  <CoverThumb assetId={session.episode?.Cover} alt={session.episode?.Title || ''} size="sm" />
                                  <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-start gap-2">
                                         <h3 className="text-sm font-medium text-white truncate">
                                            {session.episode?.Title || 'Neznáma epizóda'}
                                         </h3>
                                         <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0 ${
                                             session.type === 'live'
                                                ? 'bg-red-900 text-red-200'
                                                : 'bg-blue-900 text-blue-200'
                                         }`}>
                                             {session.type === 'live' ? 'Živé' : 'Archív'}
                                         </span>
                                     </div>

                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-2">
                                        <div>
                                           <div className="text-gray-400">Skladba</div>
                                           <div className="text-white">{formatDuration(session.trackDuration)}</div>
                                        </div>
                                        <div>
                                           <div className="text-gray-400">Počúvané</div>
                                           <div className="text-white">{formatDuration(session.duration)}</div>
                                        </div>
                                        <div>
                                           <div className="text-gray-400">Dátum</div>
                                           <div className="text-white">{new Date(session.date_created).toLocaleDateString('sk-SK')}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">Priebeh</div>
                                            <div className="text-white font-bold">{session.progress.toFixed(0)}%</div>
                                        </div>
                                     </div>

                                     <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
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
                        <div ref={observerTarget} className="text-center py-4 text-gray-500 text-xs">
                           Načítavam ďalšie...
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-white text-center text-sm">Neboli nájdené žiadne relácie.</div>
               )}
            </div>
         </div>
      </div>
   );
}
