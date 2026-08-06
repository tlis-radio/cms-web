import { NextRequest, NextResponse } from "next/server";
import { trackSegment } from "@/lib/statistics";
import { resolveSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

const SEGMENT_DURATION = 15;

/**
 * Heartbeat endpoint for segment tracking.
 *
 * Called by the player when segment changes to report actual playback position.
 *
 * POST /api/heartbeat
 * Body: { episodeId: number, currentTime: number }
 *
 * Listener identified server-side by resolveSessionId; callers no longer
 * supply a session id.
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

    const body = await request.json();
    const { episodeId, currentTime } = body;

    const { sessionId, isAnonymous } = resolveSessionId(request);

    if (typeof episodeId !== "number" || typeof currentTime !== "number") {
      return NextResponse.json(
        { error: "Missing episodeId or currentTime" },
        { status: 400 }
      );
    }

    // Calculate segment from actual playback time
    const segmentIndex = Math.floor(currentTime / SEGMENT_DURATION);
    await trackSegment(sessionId, episodeId, segmentIndex, isAnonymous);

    return NextResponse.json({ ok: true, segment: segmentIndex });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
