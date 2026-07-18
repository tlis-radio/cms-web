import { Episode } from "@/models/episode";

export type StreamStatus = "scheduled" | "idle" | "live" | "ended" | "disabled";

export type StreamEpisode = Episode | string | number | null;

export interface DirectusStreamDto {
  id: string | number;
  stream_key?: string;
  status: StreamStatus;
  episode: StreamEpisode;
  archive_url?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  last_error?: string | null;
}

export interface PublicStreamEntry {
  id: string | number;
  status: StreamStatus;
  episode: StreamEpisode;
  archive_url?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}
