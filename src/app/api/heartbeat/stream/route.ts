import { NextRequest, NextResponse } from "next/server";
import { trackSegment, trackStreamSegment } from "@/lib/statistics";
import { getSessionId } from "@/lib/session";
import CmsApiService from "@/services/cms-api-service";

export const dynamic = "force-dynamic";

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
    
    await trackStreamSegment(sessionId, currentStream.current_episode.id , segmentIndex);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
