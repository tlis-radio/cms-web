import Header from '@/components/header'
import Footer from '@/components/footer'
import { PlayerProvider } from "@/context/PlayerContext";
import GalleryOverlay from "@/components/carousel/gallery/GalleryOverlay";
import { GalleryProvider } from "@/components/carousel/gallery/GalleryProvider";
import SessionInit from "@/components/SessionInit";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function PageLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`flex flex-col transition-[padding] duration-300 ease-in-out ${inter.className} bg-acoustic-foam bg-fixed min-h-[100vh]`}>
      <SessionInit />
      <PlayerProvider>
        <Header />
        <div className='flex flex-row justify-center w-full pt-[125px] lg:pt-[150px] mb-16'>
          <GalleryProvider>
            <div className='pt-4 w-full text-center max-w-7xl' >
              {children}
            </div>
            <GalleryOverlay />
          </GalleryProvider>
        </div>
        <Footer />
      </PlayerProvider>
    </div>
  );
}
