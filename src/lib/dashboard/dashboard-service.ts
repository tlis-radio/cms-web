'use client';

import { readItems, aggregate, RestClient } from '@directus/sdk';
import {
   TrackView,
   TrackShare,
   ListeningSession,
   ListeningSessionStream,
   BaseListeningSession,
   EpisodeAnalytics,
   ListenerSessionDisplay
} from '@/types/statistics';
import { Show } from '@/models/show';
import { Episode } from '@/models/episode';

export class DashboardService {
   private client: RestClient<any>;

   constructor(client: RestClient<any>) {
      this.client = client;
   }

   // Show endpoints
   async getAllShows(): Promise<Show[]> {
      try {
         const shows = await this.client.request<Show[]>(
            readItems('Shows', {
               sort: ['-Episode.Date'],
               fields: ['*', 'Cast.Cast_id.*'],
            })
         );
         return shows || [];
      } catch (error) {
         console.error('Error fetching shows:', error);
         return [];
      }
   }

   async getShowBySlug(slug: string): Promise<Show | null> {
      try {
         const shows = await this.client.request<Show[]>(
            readItems('Shows', {
               filter: { Slug: { _eq: slug } },
               fields: ['*', 'Cast.Cast_id.Name'],
            })
         );
         return shows && shows.length > 0 ? shows[0] : null;
      } catch (error) {
         console.error('Error fetching show:', error);
         return null;
      }
   }

   async getShowEpisodes(showId: number): Promise<Episode[]> {
      try {
         const shows = await this.client.request<Show[]>(
            readItems('Shows', {
               filter: { id: { _eq: showId } },
               fields: ['Episode'],
            })
         );
         
         if (!shows || shows.length === 0 || !shows[0].Episode || shows[0].Episode.length === 0) {
            return [];
         }

         const episodes = await this.client.request<Episode[]>(
            readItems('Episodes', {
               fields: ['*', 'Tags.Tags_id.*', 'Show_Id.Slug'],
               filter: { 
                  id: { _in: shows[0].Episode },
                  status: { _eq: 'published' }
               },
               sort: ['-Date'],
            })
         );
         return episodes || [];
      } catch (error) {
         console.error('Error fetching episodes:', error);
         return [];
      }
   }

   async getEpisodeById(episodeId: number): Promise<Episode | null> {
      try {
         const episodes = await this.client.request<Episode[]>(
            readItems('Episodes', {
               filter: { id: { _eq: episodeId } },
               fields: ['*', 'Tags.Tags_id.*', 'Show_Id.Slug', 'Show_Id.Cover', 'Audio.id'],
            })
         );
         
         if (!episodes || episodes.length === 0) {
            return null;
         }
         
         return episodes[0];
      } catch (error) {
         console.error('Error fetching episode:', error);
         return null;
      }
   }

   // Statistics endpoints
   async getEpisodeAnalytics(episodeId: number): Promise<EpisodeAnalytics | null> {
      try {
         const [trackViews, trackShares, listeningSessions, listeningSessionsStream] = await Promise.all([
            this.getTrackViews(episodeId),
            this.getTrackShares(episodeId),
            this.getListeningSessions(episodeId),
            this.getListeningSessionsStream(episodeId),
         ]);

         return {
            episodeId,
            trackViews,
            trackShares,
            listeningSessions,
            listeningSessionsStream,
         };
      } catch (error) {
         console.error('Error fetching episode analytics:', error);
         return null;
      }
   }

   private async getTrackViews(episodeId: number): Promise<TrackView[]> {
      try {
         const views = await this.client.request<TrackView[]>(
            readItems('track_views', {
               filter: { episode: { _eq: episodeId } },
               sort: ['date_created'],
               limit: -1,
            })
         );
         return views || [];
      } catch (error) {
         console.error('Error fetching track views:', error);
         return [];
      }
   }

   private async getTrackShares(episodeId: number): Promise<TrackShare[]> {
      try {
         const shares = await this.client.request<TrackShare[]>(
            readItems('track_shares', {
               filter: { episode: { _eq: episodeId } },
               sort: ['date_created'],
               limit: -1,
            })
         );
         return shares || [];
      } catch (error) {
         console.error('Error fetching track shares:', error);
         return [];
      }
   }

   private async getListeningSessions(episodeId: number): Promise<ListeningSession[]> {
      try {
         const sessions = await this.client.request<ListeningSession[]>(
            readItems('ListeningSessions', {
                filter: { episode_id: { _eq: String(episodeId) } },
               sort: ['date_created'],               limit: -1,            })
         );
         return sessions || [];
      } catch (error) {
         console.error('Error fetching listening sessions:', error);
         return [];
      }
   }

   private async getListeningSessionsStream(episodeId: number): Promise<ListeningSessionStream[]> {
      try {
         const sessions = await this.client.request<ListeningSessionStream[]>(
            readItems('ListeningSessionsStream', {
               filter: { episode_id: { _eq: String(episodeId) } },
               sort: ['date_created'],
               limit: -1,
            })
         );
         return sessions || [];
      } catch (error) {
         console.error('Error fetching listening sessions stream:', error);
         return [];
      }
   }

   // User statistics - get both types of sessions for a user
   async getUserListeningSessions(sessionId: string): Promise<BaseListeningSession[]> {
      try {
         const [sessions, streamSessions] = await Promise.all([
            this.client.request<ListeningSession[]>(
               readItems('ListeningSessions', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments'],
                  sort: ['-date_created'],
                  limit: -1,
               })
            ),
            this.client.request<ListeningSessionStream[]>(
               readItems('ListeningSessionsStream', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments'],
                  sort: ['-date_created'],
                  limit: -1,
               })
            ),
         ]);
         
         const liveSessions = (streamSessions || []).map(s => ({ ...s, type: 'live' as const }));
         const archiveSessions = (sessions || []).map(s => ({ ...s, type: 'archive' as const }));
         
         // Combine and sort by date
         const allSessions = [...liveSessions, ...archiveSessions];
         allSessions.sort((a, b) => 
            new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
         );
         
         return allSessions;
      } catch (error) {
         console.error('Error fetching user sessions:', error);
         return [];
      }
   }

   async getUserHistory(sessionId: string, page: number = 1, limit: number = 20): Promise<{ sessions: BaseListeningSession[], hasMore: boolean }> {
      const offset = (page - 1) * limit;
      try {
         const [sessions, streamSessions] = await Promise.all([
            this.client.request<ListeningSession[]>(
               readItems('ListeningSessions', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments'],
                  sort: ['-date_created'],
                  limit: limit + 1,
                  offset: offset
               })
            ),
            this.client.request<ListeningSessionStream[]>(
               readItems('ListeningSessionsStream', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments'],
                  sort: ['-date_created'],
                  limit: limit + 1,
                  offset: offset
               })
            ),
         ]);
         
         const liveSessions = (streamSessions || []).map(s => ({ ...s, type: 'live' as const }));
         const archiveSessions = (sessions || []).map(s => ({ ...s, type: 'archive' as const }));

         const all = [...liveSessions, ...archiveSessions];
         all.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
         
         const hasMore = all.length > limit;
         const sliced = all.slice(0, limit);
         
         return { sessions: sliced, hasMore };
      } catch (error) {
         console.error('Error fetching user history:', error);
         return { sessions: [], hasMore: false };
      }
   }

   // Get all unique session IDs with stats
   async getAllSessions(): Promise<{ session_id: string; count: number; lastSession: string }[]> {
      try {
         const [sessions, streamSessions] = await Promise.all([
            this.client.request<ListeningSession[]>(
               readItems('ListeningSessions', {
                  fields: ['session_id', 'date_created'],
                  sort: ['-date_created'],
                  limit: -1,
               })
            ),
            this.client.request<ListeningSessionStream[]>(
               readItems('ListeningSessionsStream', {
                  fields: ['session_id', 'date_created'],
                  sort: ['-date_created'],
                  limit: -1,
               })
            ),
         ]);
         
         // Count sessions per session_id and track last session date
         const sessionData = new Map<string, { count: number; lastSession: string }>();
         
         // Process both types of sessions
         [...sessions, ...streamSessions].forEach(session => {
            const existing = sessionData.get(session.session_id);
            if (!existing) {
               sessionData.set(session.session_id, {
                  count: 1,
                  lastSession: session.date_created,
               });
            } else {
               existing.count++;
               // Update last session if this one is more recent
               if (new Date(session.date_created) > new Date(existing.lastSession)) {
                  existing.lastSession = session.date_created;
               }
            }
         });

         // return sorted by lastSession
         return Array.from(sessionData.entries())
            .map(([session_id, data]) => ({
               session_id,
               count: data.count,
               lastSession: data.lastSession,
            }))
            .sort((a, b) => new Date(b.lastSession).getTime() - new Date(a.lastSession).getTime());
      } catch (error) {
         console.error('Error fetching all sessions:', error);
         return [];
      }
   }

   // Get sessions paginated using getAllSessions to ensure consistency (client side slice)
   async getSessionsPaginated(
      page: number, 
      limit: number,
      sortBy: 'date' | 'count' = 'date',
      order: 'asc' | 'desc' = 'desc'
   ): Promise<{ session_id: string; count: number; lastSession: string }[]> {
      try {
         // We fetch all to get accurate counts and sort order
         const allSessions = await this.getAllSessions();
         
         // Sort based on params
         allSessions.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'count') {
               comparison = a.count - b.count;
            } else {
               comparison = new Date(a.lastSession).getTime() - new Date(b.lastSession).getTime();
            }
            return order === 'asc' ? comparison : -comparison;
         });
         
         const offset = (page - 1) * limit;
         return allSessions.slice(offset, offset + limit);
      } catch (error) {
         console.error('Error fetching paginated sessions:', error);
         return [];
      }
   }

   // Dashboard summary
   async getDashboardSummary(): Promise<{ showsCount: number; usersCount: number }> {
      try {
         const showsResult = await this.client.request(
            aggregate('Shows', {
               aggregate: { count: '*' },
            })
         );
         
         const showsCount = parseInt((showsResult as any)?.data?.[0]?.count || showsResult?.[0]?.count || '0');

         const sessions = await this.getAllSessions();
         const usersCount = sessions.length;

         return {
            showsCount,
            usersCount,
         };
      } catch (error) {
         console.error('Error fetching dashboard summary:', error);
         return { showsCount: 0, usersCount: 0 };
      }
   }

   // Fetch all dashboard data with progress support
   async getAllDashboardDataWithProgress(
      onProgress: (progress: number, message: string) => void
   ): Promise<{
      shows: Show[];
      episodes: Episode[];
      listeningSessions: ListeningSession[];
      listeningSessionsStream: ListeningSessionStream[];
   }> {
      try {
         onProgress(5, 'Fetching shows and episodes...');
         
         const [shows, episodes] = await Promise.all([
            this.client.request<Show[]>(
               readItems('Shows', {
                  fields: ['id', 'Title', 'Slug', 'Episode'],
                  limit: -1,
               })
            ),
            this.client.request<Episode[]>(
               readItems('Episodes', {
                  fields: ['id', 'Show_Id.id', 'Show_Id.Slug', 'Show_Id.Title', 'Audio.id', 'Date'],
                  filter: { status: { _eq: 'published' } },
                  limit: -1,
               })
            ),
         ]);

         onProgress(15, 'Counting sessions...');

         let totalItems = 0;
         try {
            const [sessCountRes, streamCountRes] = await Promise.all([
               this.client.request(
                  aggregate('ListeningSessions', { aggregate: { count: '*' } })
               ),
               this.client.request(
                  aggregate('ListeningSessionsStream', { aggregate: { count: '*' } })
               )
            ]);
            
            const totalSessions = parseInt((sessCountRes as any)?.[0]?.count || '0');
            const totalStreams = parseInt((streamCountRes as any)?.[0]?.count || '0');
            totalItems = totalSessions + totalStreams;
         } catch (e) {
            console.warn('Could not fetch counts, using default progress');
            totalItems = 5000;
         }

         const listeningSessions: ListeningSession[] = [];
         const listeningSessionsStream: ListeningSessionStream[] = [];
         let loadedItems = 0;
         const CHUNK_SIZE = 2500;

         const fetchAll = async (collection: string, targetArray: any[]) => {
            let page = 1;
            let hasMore = true;
            
            while(hasMore) {
               const chunk = await this.client.request<any[]>(
                   readItems(collection as any, {
                       fields: collection === 'ListeningSessions' 
                           ? ['id', 'session_id', 'segments', 'date_created', 'episode_id']
                           : ['id', 'session_id', 'episode_id', 'segments', 'date_created'],
                       limit: CHUNK_SIZE,
                       page: page
                   })
               );
               
               if (chunk && chunk.length > 0) {
                   targetArray.push(...chunk);
                   loadedItems += chunk.length;
                   
                   const progressPercent = totalItems > 0 
                     ? 15 + Math.floor((loadedItems / totalItems) * 80)
                     : 15 + (page * 5); // Fallback
                     
                   onProgress(Math.min(progressPercent, 95), `Loading data... (${loadedItems} records)`);
                   
                   page++;
                   if (chunk.length < CHUNK_SIZE) hasMore = false;
                   
                   // Yield to event loop
                   await new Promise(r => setTimeout(r, 0));
               } else {
                   hasMore = false;
               }
            }
         };

         // Parse in parallel
         await Promise.all([
             fetchAll('ListeningSessions', listeningSessions),
             fetchAll('ListeningSessionsStream', listeningSessionsStream)
         ]);

         onProgress(100, 'Processing complete');

         return {
            shows: shows || [],
            episodes: episodes || [],
            listeningSessions,
            listeningSessionsStream,
         };
      } catch (error) {
         console.error('Error fetching dashboard data:', error);
         onProgress(100, 'Error loading data');
         return {
            shows: [],
            episodes: [],
            listeningSessions: [],
            listeningSessionsStream: [],
         };
      }
   }

   // Client-side filtering and aggregation
   getTopShowsByRetention(
      data: { shows: Show[]; episodes: Episode[]; listeningSessions: ListeningSession[] },
      timeFilter: string = 'all'
   ): Array<{ show: Show; avgRetention: number; episodeCount: number; sessionCount?: number }> {
      const cutoffDate = this.getCutoffDate(timeFilter);
      
      const showStats = data.shows.map(show => {
         // Get episodes for this show
         const showEpisodeIds = Array.isArray(show.Episode) ? show.Episode.map(String) : [];
         
         const showEpisodes = data.episodes.filter(ep => {
            const epId = String(ep.id);
            const isInShowList = showEpisodeIds.includes(epId);
            const epShowId = (ep.Show_Id as any)?.id || ep.Show_Id;
            const pointsToShow = epShowId && String(epShowId) === String(show.id);

            // CHANGED: Do NOT filter episodes by date. We want all episodes, 
            // but we will only count sessions that happened after cutoffDate.
            return (isInShowList || pointsToShow); 
         });
         
         if (showEpisodes.length === 0) {
            return { show, avgRetention: 0, episodeCount: 0, sessionCount: 0 };
         }

         let totalProgress = 0;
         let totalSessions = 0;

         showEpisodes.forEach(episode => {
            const episodeSessions = data.listeningSessions.filter(s => {
               // Filter by session date if needed
               if (cutoffDate && new Date(s.date_created) < cutoffDate) return false;
               return String(s.episode_id) === String(episode.id);
            });
            
            if (episodeSessions.length === 0) return;

            // Calculate progress for each session individually
            // We use default 1h duration for relative progress if unknown
            const trackDuration = 3600; 
            
            episodeSessions.forEach(session => {
               const { progress } = this.calculateListeningDuration(session.segments || [], trackDuration);
               totalProgress += progress;
               totalSessions++;
            });
         });

         const avgRetention = totalSessions > 0 ? totalProgress / totalSessions : 0;
         
         // Calculate Weighted Rating for Sorting purposes
         // Bayesian average / Dampening: Score = Avg * (n / (n + k))
         // Helps prioritize shows with more data points
         const k = 5; // Warm-up constant
         const score = avgRetention * (totalSessions / (totalSessions + k));

         return { show, avgRetention, episodeCount: showEpisodes.length, sessionCount: totalSessions, score };
      });

      return showStats
         .filter(stat => (stat.sessionCount || 0) > 0)
         .sort((a, b) => (b as any).score - (a as any).score)
         .slice(0, 10);
   }

   getTopShowsByStreamRetention(
      data: { shows: Show[]; episodes: Episode[]; listeningSessionsStream: ListeningSessionStream[] },
      timeFilter: string = 'all'
   ): Array<{ show: Show; avgRetention: number; episodeCount: number; sessionCount?: number }> {
      const cutoffDate = this.getCutoffDate(timeFilter);
      
      const showStats = data.shows.map(show => {
         const showEpisodeIds = Array.isArray(show.Episode) ? show.Episode.map(String) : [];

         const showEpisodes = data.episodes.filter(ep => {
            const epId = String(ep.id);
            const isInShowList = showEpisodeIds.includes(epId);
            const epShowId = (ep.Show_Id as any)?.id || ep.Show_Id;
            const pointsToShow = epShowId && String(epShowId) === String(show.id);

            // CHANGED: Do NOT filter episodes by date. We want all episodes, 
            // but we will only count sessions that happened after cutoffDate.
            return (isInShowList || pointsToShow);
         });
         
         if (showEpisodes.length === 0) {
            return { show, avgRetention: 0, episodeCount: 0, sessionCount: 0 };
         }

         let totalProgress = 0;
         let totalSessions = 0;

         showEpisodes.forEach(episode => {
            const epDate = new Date(episode.Date);
            const epEnd = new Date(epDate.getTime() + 2 * 60 * 60 * 1000);

            const episodeSessions = data.listeningSessionsStream.filter(s => {
               // Global time filter first
               const sDate = new Date(s.date_created);
               if (cutoffDate && sDate < cutoffDate) return false;

               if (s.episode_id) {
                  return String(s.episode_id) === String(episode.id);
               }
               return sDate >= epDate && sDate <= epEnd;
            });
            
            if (episodeSessions.length === 0) return;

            // For Live sets, we assume 1h or 2h duration if unknown
            const trackDuration = (episode.Audio as any)?.duration || 3600;
            
            episodeSessions.forEach(session => {
               const { progress } = this.calculateListeningDuration(session.segments || [], trackDuration);
               totalProgress += progress;
               totalSessions++;
            });
         });

         const avgRetention = totalSessions > 0 ? totalProgress / totalSessions : 0;
         
         // Weighted Score
         const k = 5;
         const score = avgRetention * (totalSessions / (totalSessions + k));

         return { show, avgRetention, episodeCount: showEpisodes.length, sessionCount: totalSessions, score };
      });

      return showStats
         .filter(stat => (stat.sessionCount || 0) > 0)
         .sort((a, b) => (b as any).score - (a as any).score)
         .slice(0, 10);
   }

   getTopShowsByListeners(
      data: { shows: Show[]; episodes: Episode[]; listeningSessions: ListeningSession[]; listeningSessionsStream: ListeningSessionStream[] },
      timeFilter: string = 'all'
   ): Array<{ show: Show; listenerCount: number; episodeCount: number }> {
      const cutoffDate = this.getCutoffDate(timeFilter);
      
      const showStats = data.shows.map(show => {
         const showEpisodeIds = Array.isArray(show.Episode) ? show.Episode.map(String) : [];

         const showEpisodes = data.episodes.filter(ep => {
            const epId = String(ep.id);
            const isInShowList = showEpisodeIds.includes(epId);
            const epShowId = (ep.Show_Id as any)?.id || ep.Show_Id;
            const pointsToShow = epShowId && String(epShowId) === String(show.id);

            return (isInShowList || pointsToShow);
         });
         
         if (showEpisodes.length === 0) {
            return { show, listenerCount: 0, episodeCount: 0 };
         }

         const uniqueListeners = new Set<string>();

         showEpisodes.forEach(episode => {
            // Count Archive listeners (File-based) -> Use Session ID
            data.listeningSessions
               .filter(s => 
                   String(s.episode_id) === String(episode.id) &&
                   (!cutoffDate || new Date(s.date_created) >= cutoffDate)
               )
               .forEach(s => uniqueListeners.add(s.session_id)); 
            
            // Count Live listeners (Stream-based) -> Use Session ID
            const epDate = new Date(episode.Date);
            const epEnd = new Date(epDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours

            data.listeningSessionsStream
               .filter(s => {
                  const sDate = new Date(s.date_created);
                  if (cutoffDate && sDate < cutoffDate) return false;

                  if (s.episode_id) {
                     return String(s.episode_id) === String(episode.id);
                  }
                  // Fallback to timestamp if no episode_id linked
                  return sDate >= epDate && sDate <= epEnd;
               })
               .forEach(s => uniqueListeners.add(s.session_id));
         });

         return { 
            show, 
            listenerCount: uniqueListeners.size, 
            episodeCount: showEpisodes.length 
         };
      });

      return showStats
         .filter(stat => stat.listenerCount > 0)
         .sort((a, b) => b.listenerCount - a.listenerCount)
         .slice(0, 10);
   }

   private getCutoffDate(timeFilter: string): Date | null {
      const now = new Date();
      switch (timeFilter) {
         case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
         case '1m':
            return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
         case '3m':
            return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
         case '6m':
            return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
         case '12m':
            return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
         case 'all':
         default:
            return null;
      }
   }

   // Calculate retention data from segments for graphing
   calculateRetentionData(sessions: ListeningSession[], trackDurationSeconds: number): Array<{ time: string; retention: number }> {
      const SEGMENT_DURATION = 15; // seconds
      const totalSegments = Math.ceil(trackDurationSeconds / SEGMENT_DURATION);
      
      // Initialize retention counts for each segment
      const segmentListeners = new Array(totalSegments).fill(0);
      const totalSessions = sessions.length;
      
      if (totalSessions === 0) return [];
      
      // Count how many sessions listened to each segment
      sessions.forEach(session => {
         if (!session.segments || session.segments.length === 0) return;
         
         session.segments.forEach((count, index) => {
            if (index < totalSegments && count > 0) {
               segmentListeners[index]++;
            }
         });
      });
      
      // Convert to retention percentages and format time
      return segmentListeners.map((listeners, index) => {
         const seconds = index * SEGMENT_DURATION;
         const minutes = Math.floor(seconds / 60);
         const secs = seconds % 60;
         const time = `${minutes}:${secs.toString().padStart(2, '0')}`;
         const retention = (listeners / totalSessions) * 100;
         
         return { time, retention: Math.round(retention * 10) / 10 };
      });
   }

   // Calculate retention data from stream sessions
   calculateStreamRetentionData(sessions: ListeningSessionStream[], trackDurationSeconds: number): Array<{ time: string; retention: number }> {
      const SEGMENT_DURATION = 15; // seconds
      const totalSegments = Math.ceil(trackDurationSeconds / SEGMENT_DURATION);
      
      const segmentListeners = new Array(totalSegments).fill(0);
      const totalSessions = sessions.length;
      
      if (totalSessions === 0) return [];
      
      sessions.forEach(session => {
         if (!session.segments || session.segments.length === 0) return;
         
         session.segments.forEach((count, index) => {
            if (index < totalSegments && count > 0) {
               segmentListeners[index]++;
            }
         });
      });
      
      return segmentListeners.map((listeners, index) => {
         const seconds = index * SEGMENT_DURATION;
         const minutes = Math.floor(seconds / 60);
         const secs = seconds % 60;
         const time = `${minutes}:${secs.toString().padStart(2, '0')}`;
         const retention = (listeners / totalSessions) * 100;
         
         return { time, retention: Math.round(retention * 10) / 10 };
      });
   }

   // Calculate listening duration from segments array
   calculateListeningDuration(segments: number[], trackDurationSeconds: number): { duration: number; progress: number } {
      try {
         if (!segments || segments.length === 0) {
            return { duration: 0, progress: 0 };
         }

         // Count segments that were played (> 0)
         let listenedSegments = 0;
         for (let i = 0; i < segments.length; i++) {
            if (segments[i] > 0) {
               listenedSegments++;
            }
         }

         // Each segment represents 15 seconds
         const SEGMENT_DURATION = 15;
         const totalSegments = Math.ceil(trackDurationSeconds / SEGMENT_DURATION);
         const duration = listenedSegments * SEGMENT_DURATION;
         const progress = totalSegments > 0 ? (listenedSegments / totalSegments) * 100 : 0;

         return {
            duration: Math.min(duration, trackDurationSeconds),
            progress: Math.min(progress, 100),
         };
      } catch (error) {
         console.error('Error calculating listening duration:', error);
         return { duration: 0, progress: 0 };
      }
   }

   // Get audio duration by loading the audio file in browser
   async getAudioDuration(audioId: string): Promise<number> {
      return new Promise((resolve) => {
         try {
            const audio = new Audio();
            const audioUrl = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${audioId}`;
            
            const timeoutId = setTimeout(() => {
               console.warn('Audio loading timeout for:', audioId);
               resolve(3600);
            }, 10000); // 10 second timeout
            
            audio.addEventListener('loadedmetadata', () => {
               clearTimeout(timeoutId);
               const duration = audio.duration;
               if (isNaN(duration) || !isFinite(duration)) {
                  console.error('Invalid audio duration:', duration);
                  resolve(3600);
               } else {
                  resolve(Math.floor(duration));
               }
            });
            
            audio.addEventListener('error', (error) => {
               clearTimeout(timeoutId);
               console.error('Error loading audio file:', audioId, error);
               resolve(3600); // Default to 1 hour on error
            });
            
            audio.src = audioUrl;
         } catch (error) {
            console.error('Error creating audio element:', error);
            resolve(3600);
         }
      });
   }
}
