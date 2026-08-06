import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId, setSessionCookie, clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Session initialization endpoint.
 * 
 * Called on page load to ensure user has a session cookie.
 * Returns the session ID and sets the cookie if new.
 * 
 * GET /api/session?anonymous=true - Don't store cookie (for rejected consent)
 * GET /api/session - Normal mode with cookie storage
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAnonymous = searchParams.get('anonymous') === 'true';

  const { sessionId, isNew } = getOrCreateSessionId(request);

  const response = NextResponse.json({
    sessionId,
    isNew,
    anonymous: isAnonymous
  });

  if (isAnonymous) {
    // Rejecting consent must also drop an id set by an earlier acceptance.
    // The cookie is httpOnly, so the banner can't clear it itself.
    clearSessionCookie(response);
  } else if (isNew) {
    setSessionCookie(response, sessionId);
  }

  return response;
}
