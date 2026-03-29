import React from 'react';
import tlisaci from '@/../public/images/tlisaci.jpg';
import GalleryThumbnail from '@/components/carousel/gallery/GalleryThumbnail';
import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamické metadáta pre SEO využívajúce preklady z PartnersPage
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'PartnersPage' });

    return {
        title: `${t('metaTitle')}`,
        description: t('metaDescription'),
        alternates: { 
            canonical: `${SITE_URL}/${locale}/o-radiu/partneri` 
        },
        openGraph: {
            title: `${t('metaTitle')}`,
            description: t('metaDescription'),
            url: `${SITE_URL}/${locale}/o-radiu/partneri`,
            siteName: "Radio TLIS",
            locale: toOgLocale(locale),
        },
    };
}

// 2. Hlavný asynchrónny komponent pre stránku Partneri
const AboutUs = async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'PartnersPage' });

    return (
        <>
            <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8">
                <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
                {t('heading')}
            </h1>
            
            <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">
                <div className="flex flex-col gap-8 items-center">
                    <div className="space-y-4 order-2 md:order-1">
                        <p className='font-argentumSansBold text-lg leading-relaxed'>
                            {t('p1')}
                        </p>
                        <p className='font-argentumSansRegular text-lg leading-relaxed'>
                            {t('p2')}
                        </p>
                        <p className='font-argentumSansRegular text-lg leading-relaxed'>
                            {t('p3_prefix')}{' '}
                            <strong className='text-[#d43c4a]'>{t('p3_highlight')}</strong>
                            {t('p3_suffix')}
                        </p>
                    </div>
                    <GalleryThumbnail
                        src={tlisaci.src}
                        alt={t('image_alt')}
                        className='rounded-xl w-full h-auto object-cover shadow-lg order-1 md:order-2'
                    />
                </div>
            </div>
        </>
    );
};

export default AboutUs;
export const dynamic = 'force-dynamic';