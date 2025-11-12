import Program from "@/components/carousel/Program";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
  title: "Program | Rádio TLIS",
  description: "Program rádia TLIS — aktuálny rozpis relácií a moderátorov.",
  alternates: { canonical: SITE_URL + "/program" },
  openGraph: {
    title: "Program | Rádio TLIS",
    description: "Program rádia TLIS — aktuálny rozpis relácií a moderátorov.",
    url: SITE_URL + "/program",
    siteName: "Rádio TLIS",
    locale: "sk_SK",
  },
};

export default function Page() {
    return (
        <>
            <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> program</h1>
            <Program />
        </>
    )
}
export const dynamic = "force-dynamic";