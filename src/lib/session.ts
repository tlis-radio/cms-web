import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "tlis_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Gets or creates a session ID from cookies.
 * Returns the session ID and whether it was newly created.
 */
export function getOrCreateSessionId(request: NextRequest): {
  sessionId: string;
  isNew: boolean;
} {
  const existingSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (existingSessionId) {
    return { sessionId: existingSessionId, isNew: false };
  }

  return { sessionId: uuidv4(), isNew: true };
}

/**
 * Sets the session cookie on a response if needed.
 */
export function setSessionCookie(
  response: NextResponse,
  sessionId: string
): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}

/**
 * Gets session ID from request (returns null if not present).
 */
export function getSessionId(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}
