import { getCookie, setCookie } from './cookies';

export const TOUR_SEEN_COOKIE = 'dashboard_tour_seen';
const TOUR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 5; // 5 years

export function hasSeenTour(): boolean {
   return getCookie(TOUR_SEEN_COOKIE) === '1';
}

export function markTourSeen(): void {
   setCookie(TOUR_SEEN_COOKIE, '1', TOUR_COOKIE_MAX_AGE);
}
