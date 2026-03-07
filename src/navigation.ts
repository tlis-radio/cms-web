import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['sk', 'en', 'de', 'es', 'uk', 'tpi'],
  defaultLocale: 'sk'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);