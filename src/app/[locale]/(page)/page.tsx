import Program from "@/components/carousel/Program";
import UpNextGrid from "@/components/UpNextGrid";
import FotoreportsPanel from "@/components/FotoreportsPanel";
import LatestArticles from "@/components/LatestArticles";
import SyncedHeightRow from "@/components/SyncedHeightRow";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, alternatesFor, pageUrl } from "@/lib/seo";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from "next";
import { toOgLocale } from "@/navigation";


interface HomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomeProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: alternatesFor(``),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: pageUrl(``),
      siteName: "Radio TLIS",
      locale: toOgLocale(locale),
    },
  };
}

export default async function Home({ params }: HomeProps) {
  // 2. Await the params
  const { locale } = await params;

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
  
  // WebSite + SearchAction — vyhľadávače vedia, že /relacie?q= je vyhľadávanie na webe
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Radio TLIS",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${pageUrl("/relacie")}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <JsonLd data={broadcast} />
      <JsonLd data={website} />
      <div className="mx-[calc(50%-50vw)] overflow-x-hidden">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <SyncedHeightRow
            className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr] gap-6 mb-12"
            reference={
              <div className="flex flex-col gap-6">
                <div className="lg:aspect-square w-full min-w-0 lg:overflow-hidden rounded-lg">
                  <FotoreportsPanel limit={4} />
                </div>
                <a
                  href="https://www.websupport.sk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:flex items-center justify-center relative aspect-square w-full min-w-0 overflow-hidden rounded-lg shadow-lg bg-[#1c1c1c]"
                >
                  <img
                    src="/images/freeweb-sk-4.png"
                    alt="WebSupport"
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            }
          >
            <Program compact />
            <UpNextGrid limit={9} />
          </SyncedHeightRow>
        </div>
      </div>

      <LatestArticles limit={4} />
    </>
  );
}

export const dynamic = "force-dynamic";