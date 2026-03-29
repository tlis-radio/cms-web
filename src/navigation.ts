import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['sk', 'en', 'de', 'es', 'uk', 'tpi'] as const;

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'sk',
  localePrefix: 'always' 
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);