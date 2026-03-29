import ArchiveGrid from "@/components/ArchiveGrid";
import Program from "@/components/carousel/Program";
import ArticleLink from "@/components/ArticleLink";
import JsonLd from "@/components/JsonLd";
import CmsApiService from "@/services/cms-api-service";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from "next";
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${SITE_URL}/${locale}`,
      siteName: "Radio TLIS",
      locale: toOgLocale(locale),
    },
  };
}

export default async function Home({ params }: HomeProps) {
  // 2. Await the params
  const { locale } = await params;

  // 3. Use getTranslations (not useTranslations) in async Server Components
  const t = await getTranslations('HomePage');

  const broadcast = {
    "@context": "https://schema.org",
    "@type": "BroadcastService",
    "name": "Radio TLIS",
    "description": "Internetové rádio — Radio TLIS",
    "url": SITE_URL,
    "publisher": {
      "@type": "Organization",
      "name": "Radio TLIS",
      "url": SITE_URL
    }
  };
  
  const events = await CmsApiService.Article.getRecentEvents(5).catch(() => []);
  
  return (
    <>
      <JsonLd data={broadcast} />
      <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8">
        <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> radio
      </h1>
      
      <Program />
      
      {/* ... rest of your JSX remains the same ... */}
      <div className="flex justify-center w-full pt-8">
         <a href="https://www.websupport.sk/" target="_blank" rel="noopener noreferrer">
           <img src="/images/websupport-banner-large.png" className="px-4 hidden md:block" alt="Sponsor" />
         </a>
      </div>

      <ArchiveGrid />
      
      {events.length > 0 && (
        <div className="mb-12 pb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 px-4 md:px-8 pb-2">
            <h2 className="text-4xl text-white font-semibold pb-0">
              <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> {t('eventsTitle')}
            </h2>
            <Link href="/clanky" className="..."> {t('viewAll')} </Link>
          </div>
          <div className="px-4 md:px-8">
            {events.map((event, index) => (
              <ArticleLink 
                key={event.id || event.slug || `event-${index}`} 
                article={event} 
              />
            ))} 
          </div>
        </div>
      )}
    </>
  );
}

export const dynamic = "force-dynamic";