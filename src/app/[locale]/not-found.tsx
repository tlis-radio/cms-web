import Header from "@/components/header";
import NotFound from "@/components/NotFound";

import Footer from "@/components/footer";
import { Inter } from "next/font/google";
import { PlayerProvider } from "@/context/PlayerContext";
const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  return (
    <div className={`flex flex-col transition-[padding] duration-300 ease-in-out ${inter.className} bg-acoustic-foam bg-fixed min-h-[100vh]`}>
      <PlayerProvider>
        <Header />
        <div className="flex flex-row justify-center w-full pt-[125px] lg:pt-[150px] mb-16">
          <div className="pt-4 w-full text-center max-w-7xl">
            <NotFound />
          </div>
        </div>
        <Footer />
      </PlayerProvider>
    </div>
  );
}
