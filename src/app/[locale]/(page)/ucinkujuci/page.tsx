import React from "react";
import CmsApiService from "@/services/cms-api-service";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import CastGrid from "./CastGrid";
import { getTranslations } from "next-intl/server";
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// Dynamické metadáta s podporou prekladov
export async function generateMetadata({ 
    params 
}: { 
    params: Promise<{ locale: string }> 
}): Promise<Metadata> {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: 'CastPage' });
   const canonicalUrl = `${SITE_URL}/${locale}/ucinkujuci`;

   return {
      title: `${t('metaTitle')}`,
      description: t('metaDescription'),
      alternates: {
         canonical: canonicalUrl,
         languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/ucinkujuci`])
         ),
      },
      openGraph: {
         title: `${t('metaTitle')}`,
         description: t('metaDescription'),
         url: canonicalUrl,
         siteName: "Radio TLIS",
         locale: toOgLocale(locale),
      },
   };
}

const CastPage = async ({ 
    params 
}: { 
    params: Promise<{ locale: string }> 
}) => {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: 'CastPage' });
   const n = await getTranslations({ locale, namespace: 'navbar' });

   let loadingError = false;
   let cast: any[] = [];

   try {
      cast = await CmsApiService.Cast.listAllCast();
   } catch (error) {
      console.error("Error fetching cast:", error);
      loadingError = true;
   }

   const collectionJson = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${t('metaTitle')} - Radio TLIS`,
      "description": t('metaDescription'),
      "url": `${SITE_URL}/${locale}/ucinkujuci`,
      "publisher": {
         "@type": "Organization",
         "name": "Radio TLIS",
         "url": SITE_URL
      }
   };

   const breadcrumbs = [
      { label: t('breadcrumb'), href: `/${locale}/ucinkujuci` }
   ];

   return (
      <>
         <JsonLd data={collectionJson} />
         <div className="px-8 mb-6">
            <Breadcrumbs items={breadcrumbs} />
         </div>
         <CastGrid cast={cast} loadingError={loadingError} />
      </>
   );
};

export default CastPage;
export const dynamic = "force-dynamic";