import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from "next/font/google";

// UI komponenty
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlayerProvider } from "@/context/PlayerContext";
import GalleryOverlay from "@/components/carousel/gallery/GalleryOverlay";
import { GalleryProvider } from "@/components/carousel/gallery/GalleryProvider";
import SessionInit from "@/components/SessionInit";
import CookieConsent from "@/components/CookieConsent";

// Konfigurácia fontu Inter
// Definujeme presné váhy, aby sme zabránili prehnanej tučnosti (boldness)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter", 
});

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
      {/* 1. inter.variable - vytvorí prepojenie na Tailwind
          2. font-sans - nastaví Inter ako základný font pre tento div a všetko v ňom
          3. antialiased - dôležité pre Windows/Chrome, aby font nebol príliš hrubý
      */}
      <div className={`${inter.variable} font-sans antialiased flex flex-col transition-[padding] duration-300 ease-in-out`}>
        <SessionInit />
        <PlayerProvider>
          <Header />
          <div className='flex flex-row justify-center w-full pt-[100px] lg:pt-[105px] mb-16'>
            <GalleryProvider>
              <div className='pt-4 w-full text-center max-w-7xl'>
                {children}
              </div>
              <GalleryOverlay />
            </GalleryProvider>
          </div>
          <Footer />
        </PlayerProvider>
        <CookieConsent />
      </div>
    </NextIntlClientProvider>
  );
}