import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import "@/app/globals.css";
import { locales } from '@/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";


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
    alternates: { 
      canonical: `${SITE_URL}/${locale}`, // Opravené: kanonická URL by mala obsahovať locale
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
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased"> 
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="relative min-h-screen">
            <div className="fixed inset-0 bg-acoustic-foam bg-fixed -z-10" />
            <div className="relative z-0">
               {children}
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
