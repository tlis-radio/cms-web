import { NextRequest, NextResponse } from "next/server";
import { trackSegment, trackStreamSegment } from "@/lib/statistics";
import { getSessionId } from "@/lib/session";
import CmsApiService, { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItem, updateItem } from "@directus/sdk";

export const dynamic = "force-dynamic";

// Tracks session+episode pairs that have already been counted as a view this stream.
// Cleared when the episode changes so a new stream for a different episode counts fresh.
const countedViewKeys = new Set<string>();
let lastCountedEpisodeId: string | null = null;

/**
 * Heartbeat endpoint for segment tracking.
 *
 * POST /api/heartbeat/stream
 *
 * For native site: sessionId is retrieved from cookies
 */
export async function POST(request: NextRequest) {
  try {

    const enabled = process.env.TRACKER_ENABLED === 'true';
    if (!enabled) {
        return NextResponse.json(
            { error: 'Tracking is disabled' },
            { status: 403 }
        );
    }

    const currentStream = await CmsApiService.Stream.getCurrentStream();
    if(!currentStream) return NextResponse.json({ok:true});

    const started_at = new Date(currentStream.updated_at).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - started_at) / 1000);
    const segmentIndex = Math.floor(elapsedSeconds / 15);

    if(!currentStream.current_episode || !started_at) return NextResponse.json({ok:true});

    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 400 });
    }

    const episodeId = currentStream.current_episode.id;

    // Reset tracked sessions when the stream moves to a new episode
    if (episodeId !== lastCountedEpisodeId) {
      countedViewKeys.clear();
      lastCountedEpisodeId = episodeId;
    }

    const viewKey = `${sessionId}_${episodeId}`;
    if (!countedViewKeys.has(viewKey)) {
      countedViewKeys.add(viewKey);
      try {
        const episode = await getDirectusInstance().request(readItem("Episodes", episodeId));
        await Promise.all([
          getDirectusInstance().request(updateItem("Episodes", episodeId, { Views: (episode.Views || 0) + 1 })),
          getDirectusInstance().request(createItem("track_views", { episode: episodeId })),
        ]);
      } catch (err) {
        console.error("Stream view tracking failed:", err);
      }
    }

    await trackStreamSegment(sessionId, episodeId, segmentIndex);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
