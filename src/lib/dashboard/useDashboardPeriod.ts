'use client';

import { useEffect, useState } from 'react';

export type TimeFilter = 'all' | '12m' | '6m' | '3m' | '1m' | '7d';

export const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
   { value: 'all', label: 'Celé obdobie' },
   { value: '12m', label: 'Posledných 12 mesiacov' },
   { value: '6m', label: 'Posledných 6 mesiacov' },
   { value: '3m', label: 'Posledné 3 mesiace' },
   { value: '1m', label: 'Posledný mesiac' },
   { value: '7d', label: 'Posledných 7 dní' },
];

const STORAGE_KEY = 'tlis_dashboard_period';
const VALID = new Set(TIME_FILTER_OPTIONS.map((o) => o.value));

export function timeFilterLabel(value: TimeFilter): string {
   return TIME_FILTER_OPTIONS.find((o) => o.value === value)?.label ?? '';
}

/**
 * Selected period, shared by every dashboard page via localStorage.
 *
 * Without this the home page and an episode page could be on different windows
 * while both just saying "vypočutia", which is how the same episode showed 14
 * on one screen and 30 on another.
 */
export function useDashboardPeriod(): [TimeFilter, (v: TimeFilter) => void] {
   // Starts at 'all' so server and first client render match; the stored value
   // is applied right after mount.
   const [period, setPeriod] = useState<TimeFilter>('all');

   useEffect(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored && VALID.has(stored as TimeFilter)) setPeriod(stored as TimeFilter);
   }, []);

   const update = (value: TimeFilter) => {
      setPeriod(value);
      try {
         window.localStorage.setItem(STORAGE_KEY, value);
      } catch {
         // Private mode - the period just won't persist across pages.
      }
   };

   return [period, update];
}
