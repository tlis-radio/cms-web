import { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItems, updateItem } from "@directus/sdk";

// In-memory cache to reduce DB reads (sessionId:episodeId -> segments array)
const cache: Map<string, number[]> = new Map();

// Locks to prevent concurrent creates for the same session+episode
const createLocks: Map<string, Promise<void>> = new Map();

interface ListeningSession {
  id: string;
  session_id: string;
  asset_id: string;
  segments: number[];
  updated_at?: string;
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
            date_created: { _gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } // last 1 day
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

  // Persist to Directus (fire and forget, don't block response)
  persistToDirectus(sessionId, episodeId, segments, dbRecord?.id).catch((err) => {
    console.error("Failed to persist to Directus:", err);
  });

  return segments;
}

export async function trackStreamSegment(
  sessionId: string,
  episodeId: string,
  segmentIndex: number
): Promise<number[]> {
  const cacheKey = `stream:${sessionId}:${episodeId}`;

  // Get current segments from cache or DB
  let segments = cache.get(cacheKey);
  let dbRecord: ListeningSession | null = null;

  if (!segments) {
    try {
      const directus = getDirectusInstance();
      const results = await directus.request<ListeningSession[]>(
        readItems("ListeningSessionsStream", {
          filter: {
            session_id: { _eq: sessionId },
            episode_id: { _eq: episodeId },
            date_created: { _gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } // last 1 day
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
      console.warn("Could not load from Directus (stream), using fresh array:", err);
      segments = [];
    }
  }

  // Ensure array is large enough
  while (segments.length <= segmentIndex) {
    segments.push(0);
  }

  segments[segmentIndex] = (segments[segmentIndex] || 0) + 1;
  cache.set(cacheKey, segments);

  // Persist to Directus (fire and forget)
  persistToDirectusStream(sessionId, episodeId, segments, dbRecord?.id).catch((err) => {
    console.error("Failed to persist stream segments to Directus:", err);
  });

  return segments;
}

async function persistToDirectusStream(
  sessionId: string,
  episodeId: string,
  segments: number[],
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
