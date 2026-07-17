import { getCookie, setCookie } from './cookies';

const TOUR_COOKIE_PREFIX = 'dashboard_tour_seen_';
const TOUR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 5; // 5 years

export function hasSeenTour(tourId: string): boolean {
   return getCookie(`${TOUR_COOKIE_PREFIX}${tourId}`) === '1';
}

export function markTourSeen(tourId: string): void {
   setCookie(`${TOUR_COOKIE_PREFIX}${tourId}`, '1', TOUR_COOKIE_MAX_AGE);
}
