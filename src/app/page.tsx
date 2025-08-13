import ArchiveGrid from "@/components/ArchiveGrid";
import Program from "@/components/carousel/Program";
import Members from "@/components/MembersGrid";

export default async function Home() {
  return (
    <>
      <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> študentské rádio</h1>
      <Program />
      <ArchiveGrid />
      <Members />
    </>
    // archív
    // novinky
    // členovia
  );
}

export const dynamic = "force-dynamic";