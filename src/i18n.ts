import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['sk', 'en', 'de', 'es', 'uk', 'tpi'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Await the locale because it's a promise in newer versions
  const locale = await requestLocale;

  // Validate that the incoming locale is supported
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale, // This was missing and caused your TS error
    messages: (await import(`../messages/${locale}.json`)).default
  };
});