import { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItems, updateItem } from "@directus/sdk";

// In-memory cache to reduce DB reads (sessionId:episodeId -> segments array)
const cache: Map<string, number[]> = new Map();

// Last-access timestamp per cache key, used to evict stale sessions.
const cacheTimestamps: Map<string, number> = new Map();

// Locks to prevent concurrent creates for the same session+episode
const createLocks: Map<string, Promise<void>> = new Map();

// Content (episode/stream segment) is at most ~2h. A session untouched for
// longer than this has ended; its data is already persisted in Directus and
// can be reloaded on demand, so it is safe to drop from memory.
const SESSION_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours
// Don't iterate the whole map on every heartbeat; sweep at most this often.
const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
// Safety cap on segment count (~2h at 15s/segment = 480) to guard against a
// stale stream.updated_at producing a huge zero-filled array.
const MAX_SEGMENT_INDEX = 500;

let lastSweep = 0;

/** Record that a cache key was just used. */
function touch(key: string): void {
  cacheTimestamps.set(key, Date.now());
}

/** Evict cache entries whose last access is older than SESSION_TTL_MS. */
function sweepStaleSessions(): void {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, ts] of cacheTimestamps) {
    if (now - ts > SESSION_TTL_MS) {
      cache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}

interface ListeningSession {
  id: string;
  session_id: string;
  asset_id: string;
  segments: number[];
  is_anonymous?: boolean;
  // Maintained by Directus on every write. There is no `updated_at` column on
  // these collections - the API rejects it.
  date_updated?: string;
}

/**
 * Track a segment play for a session+asset.
 * - Increments the segment count in the array
 * - Logs to console
 * - Persists to Directus
 */
export async function trackSegment(
  sessionId: string,
  episodeId: number,
  segmentIndex: number,
  isAnonymous: boolean
): Promise<number[]> {
  segmentIndex = Math.min(Math.max(segmentIndex, 0), MAX_SEGMENT_INDEX);
  const cacheKey = `${sessionId}:${episodeId}`;

  // Get current segments from cache or DB
  let segments = cache.get(cacheKey);
  let dbRecord: ListeningSession | null = null;

  if (!segments) {
    // Try to load from Directus
    try {
      const directus = getDirectusInstance();
      // No date window: persistToDirectus looks up without one, so a narrower
      // filter here would start a fresh array and then overwrite the older row,
      // wiping progress. Resuming weeks later must accumulate, not reset.
      const results = await directus.request<ListeningSession[]>(
        readItems("ListeningSessions", {
          filter: {
            session_id: { _eq: sessionId },
            episode_id: { _eq: episodeId },
          },
          limit: 1,
        })
      );
      if (results && results.length > 0) {
        dbRecord = results[0];
        segments = Array.isArray(dbRecord.segments) ? [...dbRecord.segments] : [];
      } else {
        segments = [];
      }
    } catch (err) {
      // Table might not exist yet, start fresh
      console.warn("Could not load from Directus, using fresh array:", err);
      segments = [];
    }
  }

  // Ensure array is large enough
  while (segments.length <= segmentIndex) {
    segments.push(0);
  }

  segments[segmentIndex] = (segments[segmentIndex] || 0) + 1;
  cache.set(cacheKey, segments);
  touch(cacheKey);
  sweepStaleSessions();

  // Persist to Directus (fire and forget, don't block response)
  persistToDirectus(sessionId, episodeId, segments, isAnonymous, dbRecord?.id).catch((err) => {
    console.error("Failed to persist to Directus:", err);
  });

  return segments;
}

/**
 * Records a stream segment, reporting whether this was the listener's first
 * heartbeat for the episode. Derived from cache + DB, so it survives restarts
 * and extra instances - unlike the in-memory Set the route used to dedupe with.
 */
export async function trackStreamSegment(
  sessionId: string,
  episodeId: string,
  segmentIndex: number,
  isAnonymous: boolean
): Promise<{ segments: number[]; isFirstHeartbeat: boolean }> {
  segmentIndex = Math.min(Math.max(segmentIndex, 0), MAX_SEGMENT_INDEX);
  const cacheKey = `stream:${sessionId}:${episodeId}`;

  // Get current segments from cache or DB
  let segments = cache.get(cacheKey);
  let dbRecord: ListeningSession | null = null;
  // A cache hit means we have already served this listener in this process.
  let isFirstHeartbeat = !segments;

  if (!segments) {
    try {
      const directus = getDirectusInstance();
      // Unfiltered by date, for the same reason as trackSegment above.
      const results = await directus.request<ListeningSession[]>(
        readItems("ListeningSessionsStream", {
          filter: {
            session_id: { _eq: sessionId },
            episode_id: { _eq: episodeId },
          },
          limit: 1,
        })
      );
      if (results && results.length > 0) {
        dbRecord = results[0];
        segments = Array.isArray(dbRecord.segments) ? [...dbRecord.segments] : [];
        // A row already exists, so another instance (or an earlier boot of this
        // one) already saw this listener on this episode.
        isFirstHeartbeat = false;
      } else {
        segments = [];
      }
    } catch (err) {
      console.warn("Could not load from Directus (stream), using fresh array:", err);
      segments = [];
      // Can't prove it's new, so don't let a Directus blip inflate view counts.
      isFirstHeartbeat = false;
    }
  }

  // Ensure array is large enough
  while (segments.length <= segmentIndex) {
    segments.push(0);
  }

  segments[segmentIndex] = (segments[segmentIndex] || 0) + 1;
  cache.set(cacheKey, segments);
  touch(cacheKey);
  sweepStaleSessions();

  // Persist to Directus (fire and forget)
  persistToDirectusStream(sessionId, episodeId, segments, isAnonymous, dbRecord?.id).catch((err) => {
    console.error("Failed to persist stream segments to Directus:", err);
  });

  return { segments, isFirstHeartbeat };
}

async function persistToDirectusStream(
  sessionId: string,
  episodeId: string,
  segments: number[],
  isAnonymous: boolean,
  existingId?: string
): Promise<void> {
  const directus = getDirectusInstance();
  const lockKey = `stream:${sessionId}:${episodeId}`;

  if (existingId) {
    await directus.request(
      updateItem("ListeningSessionsStream", existingId, {
        segments,
      })
    );
  } else {
    const existingLock = createLocks.get(lockKey);
    if (existingLock) {
      await existingLock;
    }

    let releaseLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    createLocks.set(lockKey, lockPromise);

    try {
      const results = await directus.request<ListeningSession[]>(
        readItems("ListeningSessionsStream", {
          filter: {
            session_id: { _eq: sessionId },
            episode_id: { _eq: episodeId },
          },
          limit: 1,
        })
      );

      if (results && results.length > 0) {
        await directus.request(
          updateItem("ListeningSessionsStream", results[0].id, {
            segments,
          })
        );
      } else {
        await directus.request(
          createItem("ListeningSessionsStream", {
            session_id: sessionId,
            episode_id: episodeId,
            segments,
            is_anonymous: isAnonymous,
          })
        );
      }
    } finally {
      releaseLock();
      createLocks.delete(lockKey);
    }
  }
}

/**
 * Persist segments to Directus.
 * Creates a new record or updates existing.
 * Uses locking to prevent duplicate entries from concurrent creates.
 */
async function persistToDirectus(
  sessionId: string,
  episodeId: number,
  segments: number[],
  isAnonymous: boolean,
  existingId?: string
): Promise<void> {
  const directus = getDirectusInstance();
  const lockKey = `${sessionId}:${episodeId}`;

  if (existingId) {
    // Update existing record - no lock needed
    await directus.request(
      updateItem("ListeningSessions", existingId, {
        segments,
      })
    );
  } else {
    // Wait for any existing lock for this session+episode
    const existingLock = createLocks.get(lockKey);
    if (existingLock) {
      await existingLock;
    }

    // Create a new lock for this operation
    let releaseLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    createLocks.set(lockKey, lockPromise);

    try {
      // Check if record was created by another request
      const results = await directus.request<ListeningSession[]>(
        readItems("ListeningSessions", {
          filter: {
            session_id: { _eq: sessionId },
            episode_id: { _eq: episodeId },
          },
          limit: 1,
        })
      );

      if (results && results.length > 0) {
        // Update the found record
        await directus.request(
          updateItem("ListeningSessions", results[0].id, {
            segments,
          })
        );
      } else {
        // Create new record
        await directus.request(
          createItem("ListeningSessions", {
            session_id: sessionId,
            episode_id: episodeId,
            segments,
            is_anonymous: isAnonymous,
          })
        );
      }
    } finally {
      // Release the lock
      releaseLock();
      createLocks.delete(lockKey);
    }
  }
}

/**
 * Get all segments for a session+asset (from cache or DB).
 */
export async function getSegments(
  sessionId: string,
  episodeId: number
): Promise<number[]> {
  const cacheKey = `${sessionId}:${episodeId}`;
  
  const cached = cache.get(cacheKey);
  if (cached) {
    touch(cacheKey);
    return cached;
  }

  try {
    const directus = getDirectusInstance();
    const results = await directus.request<ListeningSession[]>(
      readItems("ListeningSessions", {
        filter: {
          session_id: { _eq: sessionId },
          episode_id: { _eq: episodeId },
        },
        limit: 1,
      })
    );
    if (results && results.length > 0) {
      const segments = Array.isArray(results[0].segments) ? results[0].segments : [];
      cache.set(cacheKey, segments);
      touch(cacheKey);
      return segments;
    }
  } catch (err) {
    console.warn("Could not load segments from Directus:", err);
  }

  return [];
}
