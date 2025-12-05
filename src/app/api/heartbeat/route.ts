import { NextRequest, NextResponse } from "next/server";
import { trackSegment } from "@/lib/statistics";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

const SEGMENT_DURATION = 15;

/**
 * Heartbeat endpoint for segment tracking.
 * 
 * Called by the player when segment changes to report actual playback position.
 * 
 * POST /api/heartbeat
 * Body: { episodeId: number, currentTime: number }
 */
export async function POST(request: NextRequest) {
  try {
    const sessionId = getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 400 });
    }

    const body = await request.json();
    const { episodeId, currentTime } = body;

    if (typeof episodeId !== "number" || typeof currentTime !== "number") {
      return NextResponse.json(
        { error: "Missing episodeId or currentTime" },
        { status: 400 }
      );
    }

    // Calculate segment from actual playback time
    const segmentIndex = Math.floor(currentTime / SEGMENT_DURATION);
    await trackSegment(sessionId, episodeId, segmentIndex);

    return NextResponse.json({ ok: true, segment: segmentIndex });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
