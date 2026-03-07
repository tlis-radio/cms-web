import "../globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// We generate metadata dynamically to match the language
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: 'Radio TLIS', // TO DO
    description: locale === 'sk' 
      ? 'Radio TLIS — alternatívna hudba, relácie a kultúra.' 
      : 'Radio TLIS — alternative music, shows, and culture.',
    alternates: { 
      canonical: `${SITE_URL}/${locale === 'sk' ? '' : locale}` 
    },
    openGraph: {
      title: 'Radio TLIS',
      description: 'Radio TLIS — alternatívna hudba, relácie a kultúra.',
      url: SITE_URL + "/",
      siteName: 'Radio TLIS',
      locale: locale === 'sk' ? 'sk_SK' : 'en_US',
    },
  };
}

declare global {
  interface Window {
    umami?: any;
  }
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming `locale` is supported
  const locales = ['sk', 'en', 'de', 'es', 'uk', 'tpi'];
  if (!locales.includes(locale)) {
    notFound();
  }

  // Receive messages provided in `i18n.ts`
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        {process.env.NEXT_PUBLIC_ANALYTICS_URL && (
          <Script 
            id="umami-script" 
            src={process.env.NEXT_PUBLIC_ANALYTICS_URL + '/script.js'} 
            data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_ID} 
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}