import "./globals.css";
import type { Metadata } from "next";
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Inter } from "next/font/google";
import { PlayerProvider } from "@/context/PlayerContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TLIS - Študentské internetové rádio',
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-acoustic-foam bg-fixed min-h-[100vh] flex flex-col transition-[padding] duration-300 ease-in-out`}>
        <PlayerProvider>
          <Header />
          <div className='flex flex-row justify-center w-full pt-[100px] lg:pt-[125px] mb-16'>
            {
              // bg-[#00ff00] - green
              // bg-[#ff0000] - red
            }
            <div className='pt-4 w-full text-center max-w-7xl'>
              {children}
            </div>
          </div>
          <Footer />
        </PlayerProvider>
      </body>
    </html >
  );
}
