import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import "@/app/globals.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: {
      template: '%s | Radio TLIS', 
      default: 'Radio TLIS', 
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.ico?v=2', type: 'image/x-icon' },
      ],
      apple: '/favicon.ico',
    },
    description: locale === 'sk' 
      ? 'Radio TLIS — alternatívna hudba, relácie a kultúra.' 
      : 'Radio TLIS — alternative music, shows, and culture.',
    // canonical/hreflang si nastavuje každá stránka sama — v layoute by sa dedil
    // na všetky podstránky a ukazoval by na /{locale}
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
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="relative min-h-screen antialiased">
        <div className="relative z-0">
            {children}
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
