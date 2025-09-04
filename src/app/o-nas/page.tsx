import React from 'react';
import tlisaci from '@/../public/images/tlisaci.jpg';
import GalleryThumbnail from '@/components/carousel/gallery/GalleryThumbnail';

const AboutUs: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-white bg-black/50 rounded-lg">
            <h1 className='font-argentumSansMedium text-3xl md:text-4xl tracking-[10px] uppercase mb-8 text-center'>
                O nás
            </h1>

            <div className="flex flex-col gap-8 items-center">
                <div className="space-y-4 order-2 md:order-1">
                    <p className='font-argentumSansRegular text-lg leading-relaxed'>
                        Rádio TLIS je hlasom študentskej slobody, kreativity a alternatívy. Už roky prinášame originálne rozhlasové vysielanie zamerané na nezávislú hudobnú scénu, kultúru, umenie a život mladých ľudí. Vďaka odvahe ísť mimo hlavného prúdu a slobode výberu tém i hudby sme sa stali unikátnym fenoménom bratislavského regiónu.
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
    );
};

export default AboutUs;