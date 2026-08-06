/**
 * The single definition of "vypočutie" for the whole dashboard.
 *
 * Every surface showing a listen count goes through this module. They used to
 * each compute their own, which is how one episode read 35, 41 and 57 on three
 * screens at once. Never derive listen counts from Episodes.Views.
 */

/** Seconds of episode covered by one entry in a `segments` array. */
export const SEGMENT_DURATION_SECONDS = 15;

/**
 * Directus never populates directus_files.duration, and reading real duration
 * means loading the audio in a browser - too slow for bulk queries. Every file
 * in the library is 128 kbps CBR MP3 (verified by parsing frame headers), so
 * filesize/bytes-per-second is accurate to well under a percent. If VBR files
 * ever get uploaded, populate directus_files.duration and prefer it here.
 */
const MP3_BYTES_PER_SECOND = 128_000 / 8;

/**
 * A listen = five minutes actually played, or a third of a shorter episode.
 * "Actually played" counts non-empty segments, so seeking to 05:00 doesn't
 * qualify - the old /api/view rule tested position and counted that as a view.
 */
const QUALIFYING_SECONDS = 300;
const QUALIFYING_FRACTION = 0.33;

/** What this module needs from a session row, archive or live. */
export type CountableSession = {
   session_id: string;
   episode_id?: string;
   asset_id?: string;
   segments: number[] | null;
   date_created: string;
   /** Last activity. date_created is first-ever listen and never moves. */
   date_updated?: string | null;
};

export type DurationBearingEpisode = {
   id: string | number;
   Audio?: { id?: string; filesize?: number | null } | null;
};

/** Estimated episode length, or null when no audio is attached. */
export function estimateEpisodeDurationSeconds(
   episode: DurationBearingEpisode | null | undefined
): number | null {
   const filesize = episode?.Audio?.filesize;
   if (!filesize || filesize <= 0) return null;
   return filesize / MP3_BYTES_PER_SECOND;
}

/** Seconds actually played, ignoring replays. */
export function playedSeconds(segments: number[] | null | undefined): number {
   if (!segments || segments.length === 0) return 0;
   let played = 0;
   for (const count of segments) {
      if (count > 0) played++;
   }
   return played * SEGMENT_DURATION_SECONDS;
}

/** Playback needed before a session counts. Unknown duration -> flat 5 min. */
export function qualifyingThresholdSeconds(durationSeconds: number | null): number {
   if (!durationSeconds || durationSeconds <= 0) return QUALIFYING_SECONDS;
   return Math.min(QUALIFYING_SECONDS, durationSeconds * QUALIFYING_FRACTION);
}

export function isQualifiedListen(
   session: CountableSession,
   durationSeconds: number | null
): boolean {
   return playedSeconds(session.segments) >= qualifyingThresholdSeconds(durationSeconds);
}

/**
 * Last activity on this episode. Used by every time-window filter so "last 7
 * days" means "listened recently", not "first discovered recently".
 */
export function lastActivityAt(session: CountableSession): Date {
   return new Date(session.date_updated || session.date_created);
}

export function sessionEpisodeKey(session: CountableSession): string {
   return String(session.episode_id ?? session.asset_id ?? '');
}

/**
 * Qualified listens per episode across both collections. Episodes with none
 * are absent from the map rather than present with 0.
 *
 * Archive and live rows count together: hearing an episode live and again from
 * the archive is genuinely two listens, and the collections never share a row.
 */
export function countQualifiedListensByEpisode(
   sessions: CountableSession[],
   episodes: DurationBearingEpisode[],
   since: Date | null
): Map<string, number> {
   const durationByEpisode = new Map<string, number | null>();
   for (const episode of episodes) {
      durationByEpisode.set(String(episode.id), estimateEpisodeDurationSeconds(episode));
   }

   const counts = new Map<string, number>();
   for (const session of sessions) {
      if (since && lastActivityAt(session) < since) continue;

      const key = sessionEpisodeKey(session);
      if (!key) continue;

      if (!isQualifiedListen(session, durationByEpisode.get(key) ?? null)) continue;

      counts.set(key, (counts.get(key) || 0) + 1);
   }
   return counts;
}

/** Same rule, one episode - so the detail page agrees with the bulk path. */
export function countQualifiedListensForEpisode(
   sessions: CountableSession[],
   episode: DurationBearingEpisode | null | undefined,
   since: Date | null = null
): number {
   const duration = estimateEpisodeDurationSeconds(episode);
   let count = 0;
   for (const session of sessions) {
      if (since && lastActivityAt(session) < since) continue;
      if (isQualifiedListen(session, duration)) count++;
   }
   return count;
}
