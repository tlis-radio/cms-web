import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

// UI komponenty
import Header from '@/components/header';
import Footer from '@/components/footer';
import { PlayerProvider } from "@/context/PlayerContext";
import GalleryOverlay from "@/components/carousel/gallery/GalleryOverlay";
import { GalleryProvider } from "@/components/carousel/gallery/GalleryProvider";
import SessionInit from "@/components/SessionInit";
import CookieConsent from "@/components/CookieConsent";

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
      <div className="flex flex-col transition-[padding] duration-300 ease-in-out">
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