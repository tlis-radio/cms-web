import React from 'react';
import tlisaci from '@/../public/images/tlisaci.jpg';
import GalleryThumbnail from '@/components/carousel/gallery/GalleryThumbnail';
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
    title: "Kontakt | Radio TLIS",
    description: "Kontaktujte Rádio TLIS — e-mailové adresy a informácie, ako sa s nami spojiť.",
    alternates: { canonical: SITE_URL + "/o-radiu/kontakt" },
    openGraph: {
        title: "Kontakt | Radio TLIS",
        description: "Kontaktujte Rádio TLIS — e-mailové adresy a informácie, ako sa s nami spojiť.",
        url: SITE_URL + "/o-radiu/kontakt",
        siteName: "Radio TLIS",
        locale: "sk_SK",
    },
};

const AboutUs: React.FC = () => {
    return (
        <>
            <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> kontakt</h1>
            <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">

                <div className="flex flex-col gap-8 items-center">
                    <div className="space-y-4 order-2 md:order-1">
                        <p className='font-argentumSansLight text-lg leading-relaxed'>
                            Ak máte nutkavú potrebu kontaktovať Radio TLIS, alebo nejakého člena rádia, samozrejme, že to môžete urobiť. Máme pre Vás hneď niekoľko mailových adries, ktoré Vám môžu pomôcť, čo najpresnejšie zacieliť svoje otázky, prosby či pochvaly.
                        </p>
                        <p className='font-argentumSansRegular text-lg leading-relaxed'>
                            Nevysielame pre zisk ani pod taktovkou veľkých hráčov — u nás rozhodujú nápady, chuť tvoriť a hlas mladých ľudí. Sme jediné študentské rádio v Bratislavskom kraji a zároveň jediné na Slovensku, ktoré sa dôsledne venuje alternatívnym žánrom.
                        </p>
                        <p className='font-argentumSansRegular text-lg leading-relaxed'>
                            Naše vysielanie <strong className='text-[#d43c4a]'>beží od pondelka do štvrtku</strong>, no rádio TLIS nekončí vypnutím mikrofónov. Stretávame sa na poradách, organizujeme workshopy, brigády a – áno – aj študentské flámy. Každý z nás tu funguje vlastným tempom, no spája nás spoločná vášeň: robiť rádio inak.
                        </p>
                    </div>
                    <GalleryThumbnail
                        src={tlisaci.src}
                        alt="Zostava členov rádia TLIS"
                        className='rounded-xl w-full h-auto object-cover shadow-lg order-1 md:order-2'
                    />
                </div>
            </div>
        </>
    );
};

export default AboutUs;