import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createHash, randomBytes } from "crypto";

const SESSION_COOKIE_NAME = "tlis_session_id";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const CONSENT_COOKIE_NAME = "tlis_cookie_consent";

/**
 * Set ANALYTICS_SALT_SECRET so every instance derives the same id for the same
 * visitor. Without it each process uses its own salt and splits a visitor.
 */
const ANALYTICS_SALT_SECRET = process.env.ANALYTICS_SALT_SECRET;
const processSalt = randomBytes(32).toString("hex");

function dailySalt(): string {
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ANALYTICS_SALT_SECRET || processSalt}:${day}`)
    .digest("hex");
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  // First entry of the comma-separated chain is the client.
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Daily identifier for a listener who hasn't consented to cookies, derived
 * server-side. Nothing touches their device, which keeps this outside ePrivacy
 * Art. 5(3) / § 109 ods. 8 zákona 452/2021 - unlike a cookie, localStorage or
 * sessionStorage id, all of which need consent whatever the technology (EDPB
 * Guidelines 2/2023). Same construction Plausible and Fathom use.
 *
 * Salt rotates daily, so ids can't be linked across days. Trade-off: an
 * anonymous listener is one person per day, and two people behind one NAT with
 * the same browser look like one.
 *
 * GDPR still covers the IP processed here - legitimate interest, never stored.
 */
export function getAnonymousSessionId(request: NextRequest): string {
  const fingerprint = `${dailySalt()}|${clientIp(request)}|${request.headers.get("user-agent") ?? ""}`;
  return `anon_${createHash("sha256").update(fingerprint).digest("hex").slice(0, 32)}`;
}

/**
 * Who to attribute this request's listening to. Consented listeners get their
 * stable cookie id; everyone else the daily derived id.
 *
 * Never read from the request body. It used to be, which let any caller
 * attribute listening to an id of their choosing, and meant non-consented
 * listeners minted a new identity on every page load.
 */
export function resolveSessionId(request: NextRequest): {
  sessionId: string;
  isAnonymous: boolean;
} {
  const cookieSessionId = getSessionId(request);
  if (cookieSessionId && !isAnonymousRequest(request)) {
    return { sessionId: cookieSessionId, isAnonymous: false };
  }
  return { sessionId: getAnonymousSessionId(request), isAnonymous: true };
}

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

/** Removes the session cookie, e.g. when consent is withdrawn. */
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
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

/**
 * Whether the request comes from a visitor who rejected (or never answered)
 * the cookie consent banner.
 */
export function isAnonymousRequest(request: NextRequest): boolean {
  const consent = request.cookies.get(CONSENT_COOKIE_NAME)?.value;
  return consent === "rejected" || !consent;
}
