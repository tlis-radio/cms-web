import React from 'react';
import tlisaci from '@/../public/images/darujte_nam_2_percenta.png';
import GalleryThumbnail from '@/components/carousel/gallery/GalleryThumbnail';
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamické metadáta pre SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'TwoPercentPage' });

    return {
        title: `${t('metaTitle')}`,
        description: t('metaDescription'),
        alternates: { 
            canonical: `${SITE_URL}/${locale}/dve-percenta` 
        },
        openGraph: {
            title: `${t('metaTitle')}`,
            description: t('metaDescription'),
            url: `${SITE_URL}/${locale}/dve-percenta`,
            siteName: "Radio TLIS",
            locale: locale === 'sk' ? 'sk_SK' : 'en_US',
        },
    };
}

export default async function DvePercenta({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'TwoPercentPage' });
    const b = await getTranslations({ locale, namespace: 'navbar' });

    const breadcrumbs = [
        { label: t('breadcrumb_label') || "Dve percentá", href: `/${locale}/dve-percenta` }
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

            <div className="font-argentumSansLight max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg flex flex-col items-center">
                <GalleryThumbnail
                    src={tlisaci.src}
                    alt={t('image_alt') || "Darujte nám 2 percentá"}
                    className='rounded-xl w-full h-auto object-cover shadow-lg'
                />   
                
                <p className="text-sm leading-relaxed mb-6 mt-6">
                    {t('intro_text')}
                </p>

                <p className="text-xl leading-relaxed mb-6 text-center">
                    <strong>{t('slogan_1')}<br />{t('slogan_2')}</strong>
                </p>

                <p className="text-2xl leading-relaxed mb-6 text-center">
                    <strong>{t('thank_you')}</strong>
                </p>

                <div className="border-t border-gray-100 mt-2 pt-6 w-full">
                    <h2 className="text-xl font-semibold mb-4 text-[#d43c4a] text-center md:text-left">
                        {t('employer_header')}
                    </h2>
                </div>

                <div className="w-full space-y-4">
                    <p>
                        <strong>1.</strong> {t('step_1')}
                    </p>
                    <li className="flex items-center mb-2 flex-wrap list-none">
                        <svg className="w-5 h-5 text-[#d43c4a] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 11.172 2H6zm5 1.414L16.586 9H13a2 2 0 0 1-2-2V3.414z"/>
                        </svg>
                        <a href="https://www.financnasprava.sk//_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Vzory_tlaciv/Zavisla_cinnost_5ZD/2018/2018.12.07_pr%C3%ADloha5.pdf" className="text-white underline" download>
                            {t('download_link_1')}
                        </a>
                    </li>

                    <p>
                        <strong>2.</strong> {t('step_2')}
                    </p>
                    <li className="flex items-center mb-2 flex-wrap list-none">
                        <svg className="w-5 h-5 text-[#d43c4a] mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.828a2 2 0 0 0-.586-1.414l-3.828-3.828A2 2 0 0 0 11.172 2H6zm5 1.414L16.586 9H13a2 2 0 0 1-2-2V3.414z"/>
                        </svg>
                        <a href="https://www.financnasprava.sk//_img/pfsedit/Dokumenty_PFS/Zverejnovanie_dok/Vzory_tlaciv/Zavisla_cinnost_5ZD/2020/2020.12.07_Vyhlasenie.pdf" className="text-white underline" download>
                            {t('download_link_2')}
                        </a>
                    </li>
                </div>

                <div className="border-t border-gray-100 mt-6 pt-6 w-full">
                    <h2 className="text-xl font-semibold mb-4 text-[#d43c4a] text-center md:text-left">
                        {t('self_header')}
                    </h2>
                </div>

                <p className="mb-4 w-full text-left">{t('self_description')}</p>
                <p className="mb-6 w-full text-left"><strong>1.</strong> {t('self_step_1')}</p>

                <h2 className="text-l font-semibold mb-4 text-[#d43c4a] w-full text-left">
                    {t('data_header')}
                </h2>

                <div className="w-full text-left">
                    <ul className="mb-6 list-none">
                        <li><strong>{t('label_ico')}:</strong> 42445833</li>
                        <li><strong>{t('label_legal')}:</strong> Občianske združenie</li>
                        <li><strong>{t('label_name')}:</strong> IRŠ TLIS</li>
                        <li><strong>{t('label_street')}:</strong> Staré Grunty</li>
                        <li><strong>{t('label_number')}:</strong> 5913/53</li>
                        <li><strong>{t('label_psc')}:</strong> 841 04</li>
                        <li><strong>{t('label_city')}:</strong> Bratislava - Karlova Ves</li>
                        <li><strong>{t('label_contact')}:</strong> radio@tlis.sk</li>
                    </ul>
                </div>

                <p className="text-sm text-gray-200 italic w-full text-center">
                    {t('help_footer')}
                </p>
            </div>
        </>
    );
}

export const dynamic = 'force-dynamic';