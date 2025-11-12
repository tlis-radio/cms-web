import VinylPlayer from "@/components/vinyl/VinylPlayer";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
    title: "Vinyl | Rádio TLIS",
    description: "Vinyl prehrávač a archív — prehrávajte naše relácie a hudbu študentského rádia TLIS.",
    alternates: { canonical: SITE_URL + "/vinyl" },
    openGraph: {
        title: "Vinyl | Rádio TLIS",
        description: "Vinyl prehrávač a archív — prehrávajte relácie a hudbu TLIS.",
        url: SITE_URL + "/vinyl",
        siteName: "Rádio TLIS",
        locale: "sk_SK",
    },
};

export default function vinylpage () {
        return <VinylPlayer />;
}