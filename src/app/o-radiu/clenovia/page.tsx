import Members from "@/components/MembersGrid";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
    title: "Členovia | Rádio TLIS",
    description: "Zoznam členov rádia TLIS — moderátori, redaktori a tím, ktorý vytvára obsah rádia.",
    alternates: { canonical: SITE_URL + "/o-radiu/clenovia" },
    openGraph: {
        title: "Členovia | Rádio TLIS",
        description: "Zoznam členov rádia TLIS — moderátori, redaktori a tím.",
        url: SITE_URL + "/o-radiu/clenovia",
        siteName: "Rádio TLIS",
        locale: "sk_SK",
    },
};

export default function Clenovia() {
        return <>
                <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> členovia</h1>
                <Members header={false} />

        </>
}
export const dynamic = "force-dynamic";