import VinylPlayer from "@/components/vinyl/VinylPlayer";
import type { Metadata } from "next";
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: "Vinyl | Rádio TLIS",
        description: "Vinyl prehrávač a archív — prehrávajte naše relácie a hudbu študentského rádia TLIS.",
        alternates: {
            canonical: `${SITE_URL}/${locale}/vinyl`,
            languages: Object.fromEntries(
                locales.map((l) => [l, `${SITE_URL}/${l}/vinyl`])
            ),
        },
        openGraph: {
            title: "Vinyl | Rádio TLIS",
            description: "Vinyl prehrávač a archív — prehrávajte relácie a hudbu TLIS.",
            url: `${SITE_URL}/${locale}/vinyl`,
            siteName: "Rádio TLIS",
            locale: toOgLocale(locale),
        },
    };
}

export default function vinylpage () {
        return <VinylPlayer />;
}