import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId, setSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Session initialization endpoint.
 * 
 * Called on page load to ensure user has a session cookie.
 * Returns the session ID and sets the cookie if new.
 * 
 * GET /api/session
 */
export async function GET(request: NextRequest) {
  const { sessionId, isNew } = getOrCreateSessionId(request);

  const response = NextResponse.json({ sessionId, isNew });

  if (isNew) {
    setSessionCookie(response, sessionId);
  }

  return response;
}
