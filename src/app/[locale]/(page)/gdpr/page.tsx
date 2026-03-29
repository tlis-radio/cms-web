import Breadcrumbs from "@/components/Breadcrumbs";
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamické metadáta pre SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'GdprPage' });

    return {
        title: `${t('metaTitle')}`,
        description: t('metaDescription'),
        alternates: {
            canonical: `${SITE_URL}/${locale}/gdpr`,
            languages: Object.fromEntries(
                locales.map((l) => [l, `${SITE_URL}/${l}/gdpr`])
            ),
        },
        openGraph: {
            title: `${t('metaTitle')}`,
            description: t('metaDescription'),
            url: `${SITE_URL}/${locale}/gdpr`,
            siteName: "Radio TLIS",
            locale: toOgLocale(locale),
        },
    };
}

export default async function GdprPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'GdprPage' });

    const breadcrumbs = [
        { label: "GDPR", href: `/${locale}/gdpr` }
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

            <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">
                <div className="flex flex-col gap-8 items-center">
                    <div className="space-y-4 order-2 md:order-1">
                        <p className="font-argentumSansRegular text-lg leading-relaxed">
                            <strong>1. {t('section1_title')}</strong>
                            <br />
                            {t('section1_text')}
                        </p>
                        <p className="font-argentumSansRegular text-lg leading-relaxed">
                            <strong>2. {t('section2_title')}</strong>
                            <br />
                            {t('section2_text')}
                        </p>
                        <p className="font-argentumSansRegular text-lg leading-relaxed">
                            <strong>3. {t('section3_title')}</strong>
                            <br />
                            {t('section3_text')}
                        </p>
                        <p className="font-argentumSansRegular text-lg leading-relaxed">
                            <strong>4. {t('section4_title')}</strong>
                            <br />
                            {t('section4_text')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export const dynamic = 'force-dynamic';