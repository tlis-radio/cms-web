import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from "next"; // Pridaný import pre typy

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
const locales = ['sk', 'en', 'de', 'es', 'uk', 'tpi'];

// 1. Pridaná funkcia pre SEO a Titulky
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: {
      // %s sa automaticky nahradí názvom z podstránky
      template: '%s | Radio TLIS', 
      default: '', 
    },
    description: locale === 'sk' 
      ? 'Radio TLIS — alternatívna hudba, relácie a kultúra.' 
      : 'Radio TLIS — alternative music, shows, and culture.',
    alternates: { 
      // Canonical vždy na hlavnú SK verziu
      canonical: `${SITE_URL}/`, 
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validácia jazyka
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}