import "./globals.css";
import type { Metadata } from "next";
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Inter } from "next/font/google";
import { PlayerProvider } from "@/context/PlayerContext";
import Script from "next/script";
import GalleryOverlay from "@/components/carousel/gallery/GalleryOverlay";
import { GalleryProvider } from "@/components/carousel/gallery/GalleryProvider";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
  title: 'Rádio TLIS',
  description: 'Študentské rádio TLIS — alternatívna hudba, relácie a kultúra. Poslúchajte online a zistite viac o našom programe.',
  alternates: { canonical: SITE_URL + "/" },
  openGraph: {
    title: 'Rádio TLIS',
    description: 'Študentské rádio TLIS — alternatívna hudba, relácie a kultúra.',
    url: SITE_URL + "/",
    siteName: 'Rádio TLIS',
    locale: 'sk_SK',
  },
};

declare global {
    interface Window {
        umami?: any;
    }
}

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      {process.env.NEXT_PUBLIC_ANALYTICS_URL && (
        <Script id="umami-script" src={process.env.NEXT_PUBLIC_ANALYTICS_URL + '/script.js'} data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_ID} />
      )}
      <body className={`${inter.className} bg-acoustic-foam bg-fixed min-h-[100vh] flex flex-col transition-[padding] duration-300 ease-in-out`}>
        <PlayerProvider>
          <Header />
          <div className='flex flex-row justify-center w-full pt-[125px] lg:pt-[150px] mb-16'>
            <GalleryProvider>
              <div className='pt-4 w-full text-center max-w-7xl'>
                {children}
              </div>
              <GalleryOverlay />
            </GalleryProvider>
          </div>
          <Footer />
        </PlayerProvider>
      </body>
    </html >
  );
}
