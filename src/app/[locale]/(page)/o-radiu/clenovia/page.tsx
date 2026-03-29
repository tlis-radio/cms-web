import Members from "@/components/MembersGrid";
import { getTranslations } from 'next-intl/server';
import { toOgLocale } from "@/navigation";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamic Metadata (Handles both SK and EN automatically)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'MembersPage' });

    return {
        title: `${t('metaTitle')}`,
        description: t('metaDescription'),
        alternates: { 
            canonical: `${SITE_URL}/${locale}/o-radiu/clenovia` 
        },
        openGraph: {
            title: `${t('metaTitle')}`,
            description: t('metaDescription'),
            url: `${SITE_URL}/${locale}/o-radiu/clenovia`,
            siteName: "Radio TLIS",
            locale: toOgLocale(locale),
        },
    };
}

// 2. The Main Component (Async for Next.js 15)
export default async function Clenovia({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('MembersPage');

    return (
        <>
            <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8">
                <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
                {t('title')}
            </h1>
            <Members header={false} />
        </>
    );
}

export const dynamic = "force-dynamic";