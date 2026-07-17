// Statistics types for the dashboard
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

export type ListeningSession = {
   id: string;
   session_id: string;
   asset_id: string;
   segments: number[];
   updated_at?: string;
   date_created: string;
   episode_id: string;
   is_anonymous?: boolean;
};

// Base type for both session types
export type BaseListeningSession = {
   id: string;
   session_id: string;
   segments: number[];
   updated_at?: string;
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
   updated_at?: string;
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
   bounceClass: BounceClass;
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
   episodesPerUserHistogram: Array<{ bucket: EpisodesPerUserBucket; count: number }>;
   completionDistribution: Array<{ bucket: CompletionBucket; count: number }>;
};
