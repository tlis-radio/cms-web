import { getCookie, setCookie } from './cookies';
import { LATEST_CHANGELOG_DATE } from './changelog-data';

export const CHANGELOG_SEEN_COOKIE = 'dashboard_changelog_seen';
const CHANGELOG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 5; // 5 years

export function hasUnseenChangelog(): boolean {
   const seen = getCookie(CHANGELOG_SEEN_COOKIE);
   return !seen || seen < LATEST_CHANGELOG_DATE;
}

export function markChangelogSeen(): void {
   setCookie(CHANGELOG_SEEN_COOKIE, LATEST_CHANGELOG_DATE, CHANGELOG_COOKIE_MAX_AGE);
}
