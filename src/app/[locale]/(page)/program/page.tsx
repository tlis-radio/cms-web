import Program from "@/components/carousel/Program";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';
import { toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamické metadáta pre SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'ProgramPage' });

    return {
        title: `${t('metaTitle')}`,
        description: t('metaDescription'),
        alternates: { 
            canonical: `${SITE_URL}/${locale}/program` 
        },
        openGraph: {
            title: `${t('metaTitle')}`,
            description: t('metaDescription'),
            url: `${SITE_URL}/${locale}/program`,
            siteName: "Radio TLIS",
            locale: toOgLocale(locale),
        },
    };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'ProgramPage' });
    const b = await getTranslations({ locale, namespace: 'navbar' });

    const breadcrumbs = [
        { label: t('breadcrumb_label') || "Program", href: `/${locale}/program` }
    ];

    return (
        <>
            <div className="px-8 mb-4">
                <Breadcrumbs items={breadcrumbs} />
            </div>
            
            <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8">
                <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
                {t('heading')}
            </h1>

            {/* Samotný komponent Program by mal vnútorne spracovávať locale, 
                ak sťahuje dáta z CMS pre konkrétny jazyk */}
            <Program />
        </>
    );
}

export const dynamic = "force-dynamic";