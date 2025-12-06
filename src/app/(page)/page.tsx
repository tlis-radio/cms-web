import ArchiveGrid from "@/components/ArchiveGrid";
import Program from "@/components/carousel/Program";
import Members from "@/components/MembersGrid";
import JsonLd from "@/components/JsonLd";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
  title: "Radio TLIS",
  description: "Radio TLIS — alternatívna hudba, relácie a kultúra.",
  alternates: { canonical: SITE_URL + "/" },
  openGraph: {
    title: "Radio TLIS",
    description: "Radio TLIS — alternatívna hudba, relácie a kultúra.",
    url: SITE_URL + "/",
    siteName: "Radio TLIS",
    locale: "sk_SK",
  },
};

export default async function Home() {
  const broadcast = {
    "@context": "https://schema.org",
    "@type": "BroadcastService",
    "name": "Radio TLIS",
    "description": "Internetové rádio — Radio TLIS: alternatívna hudba, relácie a kultúra.",
    "url": SITE_URL,
    "broadcastServiceTier": "Internet Radio",
    "publisher": {
      "@type": "Organization",
      "name": "Radio TLIS",
      "url": SITE_URL
    }
  };
  return (
    <>
      <JsonLd data={broadcast} />
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