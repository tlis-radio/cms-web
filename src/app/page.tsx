import ArchiveGrid from "@/components/ArchiveGrid";
import Program from "@/components/carousel/Program";
import Members from "@/components/MembersGrid";

export default async function Home() {
  return (
    <>
      <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> radio</h1>
      <Program />
      <div className="flex justify-center w-full pt-8">
        <a href="https://www.websupport.sk/" target="_blank" rel="noopener noreferrer">
        <img src="/images/websupport-banner-large.png" className="px-4 hidden md:block" alt="Sponzor domény" />
        <img src="/images/websupport-banner-small.png" className="px-4 visible md:hidden" alt="Sponzor domény" />
        </a>
      </div>
      <ArchiveGrid />
    </>
  );
}

export const dynamic = "force-dynamic";