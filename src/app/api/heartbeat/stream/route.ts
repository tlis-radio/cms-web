import { NextRequest, NextResponse } from "next/server";
import { trackStreamSegment } from "@/lib/statistics";
import { resolveSessionId } from "@/lib/session";
import CmsApiService, { getDirectusInstance } from "@/services/cms-api-service";
import { createItem, readItem, updateItem } from "@directus/sdk";

export const dynamic = "force-dynamic";

/**
 * Heartbeat endpoint for segment tracking.
 *
 * POST /api/heartbeat/stream
 * Body: {} - the listener is identified server-side, see resolveSessionId.
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

    const { sessionId, isAnonymous } = resolveSessionId(request);
    const episodeId = currentStream.current_episode.id;

    const { isFirstHeartbeat } = await trackStreamSegment(
      sessionId,
      episodeId,
      segmentIndex,
      isAnonymous
    );

    // Only the first heartbeat counts, and that now comes from the session row
    // rather than a per-process Set that reset on every deploy.
    if (isFirstHeartbeat) {
      try {
        const episode = await getDirectusInstance().request(readItem("Episodes", episodeId));
        await Promise.all([
          // Public decoration only - see models/episode.ts.
          getDirectusInstance().request(updateItem("Episodes", episodeId, { Views: (episode.Views || 0) + 1 })),
          getDirectusInstance().request(createItem("track_views", { episode: episodeId })),
        ]);
      } catch (err) {
        console.error("Stream view tracking failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
