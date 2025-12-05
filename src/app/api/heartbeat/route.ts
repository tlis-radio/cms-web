import { NextRequest, NextResponse } from "next/server";
import { trackSegment } from "@/lib/statistics";
import { getSessionId } from "@/lib/session";
import { validate as isValidUUID } from "uuid";

export const dynamic = "force-dynamic";

const SEGMENT_DURATION = 15;
const MAX_EPISODE_DURATION = 86400; // 24 hours max in seconds
const MAX_SEGMENT_INDEX = 10000;

/**
 * Heartbeat endpoint for segment tracking.
 * 
 * Called by the player when segment changes to report actual playback position.
 * 
 * POST /api/heartbeat
 * Body: { episodeId: number, currentTime: number, sessionId?: string }
 * 
 * For native site: sessionId is retrieved from cookies
 * For embed widgets: sessionId is sent in request body
 */
export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { episodeId, currentTime, sessionId: bodySessionId } = body;
    
    // Validate sessionId format if provided in body (for embeds)
    if (bodySessionId && !isValidUUID(bodySessionId)) {
      return NextResponse.json({ error: "Invalid session ID format" }, { status: 400 });
    }
    
    // Try to get session ID from body (embed) or cookie (native site)
    const sessionId = bodySessionId || getSessionId(request);
    if (!sessionId) {
      return NextResponse.json({ error: "No session" }, { status: 400 });
    }
    
    if (typeof episodeId !== "number" || typeof currentTime !== "number") {
      return NextResponse.json(
        { error: "Missing episodeId or currentTime" },
        { status: 400 }
      );
    }

    // Validate episodeId and currentTime ranges
    if (episodeId <= 0 || currentTime < 0 || currentTime > MAX_EPISODE_DURATION) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Calculate segment from actual playback time
    const segmentIndex = Math.floor(currentTime / SEGMENT_DURATION);
    
    // Validate segment index
    if (segmentIndex < 0 || !Number.isFinite(segmentIndex) || segmentIndex > MAX_SEGMENT_INDEX) {
      return NextResponse.json({ error: "Invalid segment index" }, { status: 400 });
    }
    
    await trackSegment(sessionId, episodeId, segmentIndex);

    return NextResponse.json({ ok: true, segment: segmentIndex });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
