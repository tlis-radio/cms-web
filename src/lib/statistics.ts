import { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItems, updateItem } from "@directus/sdk";

// In-memory cache to reduce DB reads (sessionId:episodeId -> segments array)
const cache: Map<string, number[]> = new Map();

// Lock map to prevent race conditions when creating/updating records
const locks: Map<string, Promise<void>> = new Map();

interface ListeningSession {
  id: string;
  session_id: string;
  episode_id: number;
  segments: number[];
  updated_at?: string;
}

/**
 * Acquire a lock for a specific cache key to prevent race conditions.
 */
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  // Wait for any existing operation to complete
  const existingLock = locks.get(key);
  if (existingLock) {
    await existingLock;
  }

  // Create a new lock
  let releaseLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  locks.set(key, lockPromise);

  try {
    return await fn();
  } finally {
    releaseLock!();
    locks.delete(key);
  }
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
  segmentIndex: number
): Promise<number[]> {
  const cacheKey = `${sessionId}:${episodeId}`;
  
  return withLock(cacheKey, async () => {
    // Get current segments from cache or DB
    let segments = cache.get(cacheKey);
    let dbRecord: ListeningSession | null = null;

    if (!segments) {
      // Try to load from Directus
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

    // Persist to Directus - await to prevent race conditions
    await persistToDirectus(sessionId, episodeId, segments, dbRecord?.id);

    return segments;
  });
}

/**
 * Persist segments to Directus.
 * Creates a new record or updates existing.
 */
async function persistToDirectus(
  sessionId: string,
  episodeId: number,
  segments: number[],
  existingId?: string
): Promise<void> {
  const directus = getDirectusInstance();

  if (existingId) {
    // Update existing record
    await directus.request(
      updateItem("ListeningSessions", existingId, {
        segments,
      })
    );
  } else {
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
        })
      );
    }
  }
}

/**
 * Get all segments for a session+episode (from cache or DB).
 */
export async function getSegments(
  sessionId: string,
  episodeId: number
): Promise<number[]> {
  const cacheKey = `${sessionId}:${episodeId}`;
  
  const cached = cache.get(cacheKey);
  if (cached) return cached;

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
      return segments;
    }
  } catch (err) {
    console.warn("Could not load segments from Directus:", err);
  }

  return [];
}
