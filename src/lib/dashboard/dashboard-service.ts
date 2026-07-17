'use client';

import { readItems, aggregate, RestClient } from '@directus/sdk';
import {
   TrackView,
   TrackShare,
   ListeningSession,
   ListeningSessionStream,
   BaseListeningSession,
   EpisodeAnalytics,
   ListenerSessionDisplay,
   UserAggregate,
   UserOverviewStats,
   BounceClass,
   EpisodesPerUserBucket,
   CompletionBucket,
} from '@/types/statistics';
import { Show } from '@/models/show';
import { Episode } from '@/models/episode';

// A user counts as a "bounce" only if they were seen exactly once AND that
// single session totalled under 5 minutes of actual listening.
const BOUNCE_MAX_SESSIONS = 1;
const BOUNCE_MAX_SECONDS = 300;
// Fallback track duration (seconds) used when computing completion % in bulk
// aggregates where per-episode audio duration isn't loaded - matches the same
// approximation already used by getTopShowsByRetention/getTopShowsByStreamRetention.
const FALLBACK_TRACK_DURATION = 3600;

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
               sort: ['-Episodes.Episodes_id.Date'],
               fields: ['*', 'Cast.Cast_id.*', 'Episodes.Episodes_id'],
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
               fields: ['Episodes.Episodes_id'],
            })
         );
         
         if (!shows || shows.length === 0 || !shows[0].Episodes || shows[0].Episodes.length === 0) {
            return [];
         }

         const episodeIds = shows[0].Episodes.map(e => e.Episodes_id);

         const episodes = await this.client.request<Episode[]>(
            readItems('Episodes', {
               fields: ['*', 'Tags.Tags_id.*', 'Show_Id.Slug'],
               filter: { 
                  id: { _in: episodeIds },
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
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments', 'is_anonymous'],
                  sort: ['-date_created'],
                  limit: -1,
               })
            ),
            this.client.request<ListeningSessionStream[]>(
               readItems('ListeningSessionsStream', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments', 'is_anonymous'],
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
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments', 'is_anonymous'],
                  sort: ['-date_created'],
                  limit: limit + 1,
                  offset: offset
               })
            ),
            this.client.request<ListeningSessionStream[]>(
               readItems('ListeningSessionsStream', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['id', 'session_id', 'date_created', 'episode_id', 'segments', 'is_anonymous'],
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

   // Cheap lookup for the earliest session date_created for a listener, used to
   // label the user detail page without loading their full session history.
   async getUserFirstSeen(sessionId: string): Promise<string | null> {
      try {
         const [sessions, streamSessions] = await Promise.all([
            this.client.request<Array<{ date_created: string }>>(
               readItems('ListeningSessions', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['date_created'],
                  sort: ['date_created'],
                  limit: 1,
               })
            ),
            this.client.request<Array<{ date_created: string }>>(
               readItems('ListeningSessionsStream', {
                  filter: { session_id: { _eq: sessionId } },
                  fields: ['date_created'],
                  sort: ['date_created'],
                  limit: 1,
               })
            ),
         ]);

         const dates = [...(sessions || []), ...(streamSessions || [])]
            .map((s) => s.date_created)
            .filter(Boolean);

         if (dates.length === 0) return null;
         return dates.reduce((min, d) => (new Date(d) < new Date(min) ? d : min));
      } catch (error) {
         console.error('Error fetching user first seen:', error);
         return null;
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
                  fields: ['id', 'Title', 'Slug', 'Episodes.Episodes_id'],
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
                           ? ['id', 'session_id', 'segments', 'date_created', 'episode_id', 'is_anonymous']
                           : ['id', 'session_id', 'episode_id', 'segments', 'date_created', 'is_anonymous'],
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
         const showEpisodeIds = Array.isArray(show.Episodes) ? show.Episodes.map(e => String(typeof e.Episodes_id === 'object' ? (e.Episodes_id as any).id : e.Episodes_id)) : [];
         
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
         const showEpisodeIds = Array.isArray(show.Episodes) ? show.Episodes.map(e => String(typeof e.Episodes_id === 'object' ? (e.Episodes_id as any).id : e.Episodes_id)) : [];

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
         const showEpisodeIds = Array.isArray(show.Episodes) ? show.Episodes.map(e => String(typeof e.Episodes_id === 'object' ? (e.Episodes_id as any).id : e.Episodes_id)) : [];

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

   // Users overview: bounce-vs-returning split + episodes-per-user / completion
   // distributions, computed entirely from the bulk-loaded session arrays
   // (getAllDashboardDataWithProgress) - no additional network calls.
   getUserOverviewStats(
      data: { listeningSessions: ListeningSession[]; listeningSessionsStream: ListeningSessionStream[]; episodes: Episode[]; shows?: Show[] },
      filter?: { showId?: number; episodeId?: string }
   ): UserOverviewStats {
      let sessions: BaseListeningSession[] = [
         ...data.listeningSessions.map((s) => ({ ...s, type: 'archive' as const })),
         ...data.listeningSessionsStream.map((s) => ({ ...s, type: 'live' as const })),
      ];

      if (filter?.episodeId) {
         sessions = sessions.filter((s) => String(s.episode_id) === String(filter.episodeId));
      } else if (filter?.showId) {
         const show = (data.shows || []).find((sh) => String(sh.id) === String(filter.showId));
         const showEpisodeIds = new Set(
            Array.isArray(show?.Episodes)
               ? show!.Episodes.map((e) => String(typeof e.Episodes_id === 'object' ? (e.Episodes_id as any).id : e.Episodes_id))
               : []
         );
         data.episodes.forEach((ep) => {
            const epShowId = (ep.Show_Id as any)?.id || ep.Show_Id;
            if (epShowId && String(epShowId) === String(filter.showId)) {
               showEpisodeIds.add(String(ep.id));
            }
         });
         sessions = sessions.filter((s) => s.episode_id && showEpisodeIds.has(String(s.episode_id)));
      }

      const groups = new Map<string, BaseListeningSession[]>();
      sessions.forEach((s) => {
         const arr = groups.get(s.session_id) || [];
         arr.push(s);
         groups.set(s.session_id, arr);
      });

      const users: UserAggregate[] = [];
      groups.forEach((rows, sessionId) => {
         let firstSeen = rows[0].date_created;
         let lastSeen = rows[0].date_created;
         let totalListenedSeconds = 0;
         let totalProgress = 0;
         let isAnonymous = false;
         const episodeIds = new Set<string>();
         const episodeCounts = new Map<string, number>();

         rows.forEach((row) => {
            if (new Date(row.date_created) < new Date(firstSeen)) firstSeen = row.date_created;
            if (new Date(row.date_created) > new Date(lastSeen)) lastSeen = row.date_created;
            if (row.is_anonymous) isAnonymous = true;

            const { duration, progress } = this.calculateListeningDuration(row.segments || [], FALLBACK_TRACK_DURATION);
            totalListenedSeconds += duration;
            totalProgress += progress;

            const epId = row.episode_id || row.asset_id;
            if (epId) {
               episodeIds.add(String(epId));
               episodeCounts.set(String(epId), (episodeCounts.get(String(epId)) || 0) + 1);
            }
         });

         let favoriteEpisodeId: string | null = null;
         let favoriteCount = 0;
         episodeCounts.forEach((count, epId) => {
            if (count > favoriteCount) {
               favoriteCount = count;
               favoriteEpisodeId = epId;
            }
         });

         const sessionCount = rows.length;
         const avgCompletionPct = sessionCount > 0 ? totalProgress / sessionCount : 0;
         const bounceClass: BounceClass =
            sessionCount <= BOUNCE_MAX_SESSIONS && totalListenedSeconds < BOUNCE_MAX_SECONDS ? 'bounce' : 'returning';

         users.push({
            sessionId,
            firstSeen,
            lastSeen,
            sessionCount,
            totalListenedSeconds,
            episodeCount: episodeIds.size,
            avgCompletionPct,
            favoriteEpisodeId,
            bounceClass,
            isAnonymous,
         });
      });

      const bounceVsReturning = users.reduce(
         (acc, u) => {
            acc[u.bounceClass]++;
            return acc;
         },
         { bounce: 0, returning: 0 }
      );

      const bounceAnonymity = users.reduce(
         (acc, u) => {
            if (u.bounceClass !== 'bounce') return acc;
            acc[u.isAnonymous ? 'anonymous' : 'known']++;
            return acc;
         },
         { anonymous: 0, known: 0 }
      );

      const episodeBucketOrder: EpisodesPerUserBucket[] = ['1', '2-3', '4-10', '11-25', '25+'];
      const episodeBucketCounts = new Map<EpisodesPerUserBucket, number>(episodeBucketOrder.map((b) => [b, 0]));
      users.forEach((u) => {
         let bucket: EpisodesPerUserBucket;
         if (u.episodeCount <= 1) bucket = '1';
         else if (u.episodeCount <= 3) bucket = '2-3';
         else if (u.episodeCount <= 10) bucket = '4-10';
         else if (u.episodeCount <= 25) bucket = '11-25';
         else bucket = '25+';
         episodeBucketCounts.set(bucket, (episodeBucketCounts.get(bucket) || 0) + 1);
      });

      const completionBucketOrder: CompletionBucket[] = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
      const completionBucketCounts = new Map<CompletionBucket, number>(completionBucketOrder.map((b) => [b, 0]));
      users.forEach((u) => {
         let bucket: CompletionBucket;
         const pct = Math.min(u.avgCompletionPct, 100);
         if (pct < 20) bucket = '0-20%';
         else if (pct < 40) bucket = '20-40%';
         else if (pct < 60) bucket = '40-60%';
         else if (pct < 80) bucket = '60-80%';
         else bucket = '80-100%';
         completionBucketCounts.set(bucket, (completionBucketCounts.get(bucket) || 0) + 1);
      });

      return {
         users,
         bounceVsReturning,
         bounceAnonymity,
         episodesPerUserHistogram: episodeBucketOrder.map((bucket) => ({ bucket, count: episodeBucketCounts.get(bucket) || 0 })),
         completionDistribution: completionBucketOrder.map((bucket) => ({ bucket, count: completionBucketCounts.get(bucket) || 0 })),
      };
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

   // Get all track shares
   async getAllTrackShares(): Promise<Array<{ id: number; episode: { id: number; title: string; Cover?: string }; name: string; date_created: string }>> {
      try {
         const shares = await this.client.request<Array<{ id: number; episode: { id: number; title: string; Cover?: string }; name: string; date_created: string }>>(
            readItems('track_shares', {
               sort: ['-date_created'],
               fields: ['id', 'episode.Title', 'episode.id', 'episode.Cover', 'name', 'date_created'],
               limit: -1,
            })
         );
         return shares || [];
      } catch (error) {
         console.error('Error fetching track shares:', error);
         return [];
      }
   }

   // Get all stream listeners
   async getAllStreamListeners(): Promise<Array<{ id: number; count: number; date_created: string }>> {
      try {
         const listeners = await this.client.request<Array<{ id: number; count: number; date_created: string }>>(
            readItems('stream_listeners', {
               sort: ['-date_created'],
               limit: -1,
            })
         );
         return listeners || [];
      } catch (error) {
         console.error('Error fetching stream listeners:', error);
         return [];
      }
   }

   async getEpisodeStreamStats(): Promise<{
      episodes: Episode[];
      sessions: Array<{ episode_id: string; session_id: string; date_created: string }>;
      episodeShowSlugs: Map<string, string>;
   }> {
      try {
         const [episodes, sessions, shows] = await Promise.all([
            this.client.request<Episode[]>(
               readItems('Episodes', {
                  fields: ['id', 'Title', 'Cover', 'Date'],
                  filter: { status: { _eq: 'published' } },
                  sort: ['-Date'],
                  limit: -1,
               })
            ),
            this.client.request<Array<{ episode_id: string; session_id: string; date_created: string }>>(
               readItems('ListeningSessionsStream', {
                  fields: ['episode_id', 'session_id', 'date_created'],
                  limit: -1,
               })
            ),
            this.client.request<Array<{ id: number; Slug: string; Episodes: Array<{ Episodes_id: any }> }>>(
               readItems('Shows', {
                  fields: ['id', 'Slug', 'Episodes.Episodes_id'],
                  limit: -1,
               })
            ),
         ]);

         const episodeShowSlugs = new Map<string, string>();
         (shows || []).forEach((show) => {
            (show.Episodes || []).forEach((e) => {
               const epId = typeof e.Episodes_id === 'object' ? e.Episodes_id?.id : e.Episodes_id;
               if (epId != null) episodeShowSlugs.set(String(epId), show.Slug);
            });
         });

         const now = Date.now();
         const pastEpisodes = (episodes || []).filter((ep) => !ep.Date || new Date(ep.Date).getTime() <= now);

         return { episodes: pastEpisodes, sessions: sessions || [], episodeShowSlugs };
      } catch (error) {
         console.error('Error fetching episode stream stats:', error);
         return { episodes: [], sessions: [], episodeShowSlugs: new Map() };
      }
   }

   getStreamListenerInsights(
      listeners: Array<{ id: number; count: number; date_created: string }>,
      episodes: Episode[],
      sessions: Array<{ episode_id: string; session_id: string; date_created: string }>,
      episodeShowSlugs: Map<string, string> = new Map()
   ): {
      lastStream: {
         start: string;
         end: string;
         peakListeners: number;
         avgListeners: number;
         uniqueListeners: number;
         episode: Episode | null;
         showSlug: string | null;
      } | null;
      topEpisodes: Array<{ episode: Episode; uniqueListeners: number; peakListeners: number; showSlug: string | null }>;
      allTimePeak: { count: number; date: string } | null;
   } {
      const LIVE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
      const STREAM_GAP_MS = 45 * 60 * 1000; // 45 min gap = separate stream

      const showSlugFor = (episode: Episode | null): string | null =>
         episode ? episodeShowSlugs.get(String(episode.id)) ?? null : null;

      const uniqueListenersFor = (episodeId: string | number): number =>
         new Set(sessions.filter((s) => String(s.episode_id) === String(episodeId)).map((s) => s.session_id)).size;

      let allTimePeak: { count: number; date: string } | null = null;
      listeners.forEach((l) => {
         if (!allTimePeak || l.count > allTimePeak.count) {
            allTimePeak = { count: l.count, date: l.date_created };
         }
      });

      // Cluster samples chronologically into distinct streams
      const sorted = [...listeners].sort(
         (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
      );
      const clusters: Array<typeof sorted> = [];
      sorted.forEach((sample) => {
         const last = clusters[clusters.length - 1];
         const lastSample = last?.[last.length - 1];
         if (
            last &&
            lastSample &&
            new Date(sample.date_created).getTime() - new Date(lastSample.date_created).getTime() <= STREAM_GAP_MS
         ) {
            last.push(sample);
         } else {
            clusters.push([sample]);
         }
      });

      let lastStream = null as ReturnType<DashboardService['getStreamListenerInsights']>['lastStream'];
      const lastCluster = clusters[clusters.length - 1];
      if (lastCluster && lastCluster.length > 0) {
         const start = lastCluster[0].date_created;
         const end = lastCluster[lastCluster.length - 1].date_created;
         const peakListeners = Math.max(...lastCluster.map((s) => s.count));
         const avgListeners = lastCluster.reduce((sum, s) => sum + s.count, 0) / lastCluster.length;
         const startTime = new Date(start).getTime();

         // Best-matching episode: most recent one scheduled at/just before the
         // stream start (allowing a little slack for clock drift/late starts).
         const SLACK_MS = 30 * 60 * 1000;
         let episode: Episode | null = null;
         let bestDiff = Infinity;
         episodes.forEach((ep) => {
            if (!ep.Date) return;
            const epTime = new Date(ep.Date).getTime();
            if (epTime > startTime + SLACK_MS) return;
            if (epTime < startTime - LIVE_WINDOW_MS) return;
            const diff = startTime - epTime;
            if (diff < bestDiff) {
               bestDiff = diff;
               episode = ep;
            }
         });

         lastStream = {
            start,
            end,
            peakListeners,
            avgListeners,
            uniqueListeners: episode ? uniqueListenersFor((episode as Episode).id) : 0,
            episode,
            showSlug: showSlugFor(episode),
         };
      }

      const topEpisodes = episodes
         .filter((ep) => ep.Date)
         .map((ep) => {
            const epStart = new Date(ep.Date).getTime();
            const epEnd = epStart + LIVE_WINDOW_MS;
            const samplesInWindow = listeners.filter((l) => {
               const t = new Date(l.date_created).getTime();
               return t >= epStart && t <= epEnd;
            });
            const peakListeners = samplesInWindow.length > 0 ? Math.max(...samplesInWindow.map((s) => s.count)) : 0;
            const uniqueListeners = uniqueListenersFor(ep.id);
            return { episode: ep, uniqueListeners, peakListeners, showSlug: showSlugFor(ep) };
         })
         .filter((stat) => stat.uniqueListeners > 0 || stat.peakListeners > 0)
         .sort((a, b) => b.uniqueListeners - a.uniqueListeners || b.peakListeners - a.peakListeners)
         .slice(0, 5);

      return { lastStream, topEpisodes, allTimePeak };
   }
}
