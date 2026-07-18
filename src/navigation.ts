import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const locales = ['sk', 'en', 'de', 'es', 'uk', 'tpi'] as const;

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'sk',
  localePrefix: 'always',
  localeDetection: false
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

const OG_LOCALE_MAP: Record<string, string> = {
  sk: 'sk_SK',
  en: 'en_US',
  de: 'de_DE',
  es: 'es_ES',
  uk: 'uk_UA',
};

export function toOgLocale(locale: string): string {
  return OG_LOCALE_MAP[locale] ?? 'en_US';
}