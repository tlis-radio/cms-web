const CONSENT_COOKIE_NAME = "tlis_cookie_consent";

/**
 * Client-side mirror of the server's isAnonymousRequest check (lib/session.ts),
 * used to decide whether the current tab should fall back to an in-memory
 * session id instead of the persisted tlis_session_id cookie.
 */
export function isAnonymousConsent(): boolean {
  const consent = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  const value = consent?.split("=")[1];
  return value === "rejected" || !value;
}
