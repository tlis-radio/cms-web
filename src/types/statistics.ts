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
};

export type ListeningSessionStream = {
   id: string;
   session_id: string;
   episode_id: string;
   segments: number[];
   updated_at?: string;
   date_created: string;
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
