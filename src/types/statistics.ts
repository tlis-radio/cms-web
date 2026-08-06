// Statistics types for the dashboard

/**
 * Append-only tally row, one per counted view. An event log, not a per-listener
 * record - no session id, so one person listening on three days makes three
 * rows. Only for plotting views over time; listen counts come from
 * lib/dashboard/listen-metrics.ts.
 */
export type TrackView = {
   id: number;
   episode: number; // Relation to Episodes
   date_created: string;
};

export type StreamListener = {
   id: number;
   count: number;
   date_created: string;
};

export type TrackShare = {
   id: number;
   episode: number; // Relation to Episodes
   name: string;
   date_created: string;
};

/**
 * One row per (session_id, episode_id), created on first heartbeat and updated
 * after - never appended. Filter time windows by `date_updated` (last
 * activity); `date_created` is the first-ever listen and never moves. These
 * types used to declare `updated_at`, which Directus doesn't have at all.
 */
export type ListeningSession = {
   id: string;
   session_id: string;
   asset_id: string;
   segments: number[];
   date_updated?: string | null;
   date_created: string;
   episode_id: string;
   is_anonymous?: boolean;
};

// Base type for both session types
export type BaseListeningSession = {
   id: string;
   session_id: string;
   segments: number[];
   date_updated?: string | null;
   date_created: string;
   episode_id?: string;
   asset_id?: string;
   type?: 'live' | 'archive';
   is_anonymous?: boolean;
};

export type ListeningSessionStream = {
   id: string;
   session_id: string;
   episode_id: string;
   segments: number[];
   date_updated?: string | null;
   date_created: string;
   is_anonymous?: boolean;
};

// Processed data for display
export type ListenerSessionDisplay = {
   id: string;
   sessionId: string;
   duration: number; // in seconds
   progress: number; // percentage 0-100
   startedAt: string;
   type: 'Archive' | 'Stream';
};

export type TimeSeriesDataPoint = {
   timestamp: string;
   value: number;
};

export type EpisodeAnalytics = {
   episodeId: number;
   trackViews: TrackView[];
   trackShares: TrackShare[];
   listeningSessions: ListeningSession[];
   listeningSessionsStream: ListeningSessionStream[];
};

// Users overview - bounce vs returning listener analytics
export type BounceClass = 'bounce' | 'returning';

export type UserAggregate = {
   sessionId: string;
   firstSeen: string;
   lastSeen: string;
   sessionCount: number;
   totalListenedSeconds: number;
   episodeCount: number;
   avgCompletionPct: number;
   favoriteEpisodeId: string | null;
   /** Came back or not. Independent of whether they actually listened. */
   bounceClass: BounceClass;
   /** Reached the listen threshold on the filtered episode(s). */
   hasQualifiedListen: boolean;
   // True if any session row for this listener came from a visitor who rejected
   // (or never answered) the cookie consent banner. Anonymous visitors get a
   // brand-new session_id on every page load, so a "bounce" here is not
   // necessarily a one-time listener - it may just be someone we can't link
   // across visits.
   isAnonymous: boolean;
};

export type EpisodesPerUserBucket = '1' | '2-3' | '4-10' | '11-25' | '25+';
export type CompletionBucket = '0-20%' | '20-40%' | '40-60%' | '60-80%' | '80-100%';

export type UserOverviewStats = {
   users: UserAggregate[];
   bounceVsReturning: { bounce: number; returning: number };
   // Breakdown of the "bounce" bucket only: how many of those single-session
   // listeners are anonymous (untrackable, possibly repeat visitors) vs known
   // (consented to cookies and still only ever seen once).
   bounceAnonymity: { anonymous: number; known: number };
   /** Reached the listen threshold vs only pressed play. */
   listenVsStart: { listened: number; startedOnly: number };
   episodesPerUserHistogram: Array<{ bucket: EpisodesPerUserBucket; count: number }>;
   completionDistribution: Array<{ bucket: CompletionBucket; count: number }>;
};
