import { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItems, updateItem } from "@directus/sdk";

// In-memory cache to reduce DB reads (sessionId:episodeId -> segments array)
const cache: Map<string, number[]> = new Map();

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
