import "./globals.css";
import type { Metadata } from "next";
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TLIS - Študentské internetové rádio',
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-acoustic-foam bg-fixed min-h-[100vh] flex flex-col`}>
          <Header />
          <div className='flex flex-row justify-center w-full'>
            {
              // bg-[#00ff00] - green
              // bg-[#ff0000] - red
            }
            <div className='pt-4 w-full text-center md:w-3/4 xl:w-2/3 2xl:w-1/2'>
              {children}
            </div>
          </div>
          <Footer />
      </body>
    </html>
  );
}
