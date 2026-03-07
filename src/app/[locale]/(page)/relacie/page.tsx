import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamické metadáta pre SEO
export async function generateMetadata({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ locale: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations({ locale, namespace: 'ShowsListPage' });

    const pageParam = resolvedSearchParams?.page;
    const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
    const filterValue = resolvedSearchParams?.filter;
    const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";
    
    const canonicalUrl = page === 1 
       ? `${SITE_URL}/${locale}/relacie${filter !== "active" ? `?filter=${filter}` : ""}`
       : `${SITE_URL}/${locale}/relacie?${filter !== "active" ? `filter=${filter}&` : ""}page=${page}`;
    
    return {
       title: `${t('metaTitle')} | Radio TLIS`,
       description: t('metaDescription'),
       alternates: { canonical: canonicalUrl },
       openGraph: {
          title: `${t('metaTitle')} | Radio TLIS`,
          description: t('metaDescription'),
          url: canonicalUrl,
          siteName: "Radio TLIS",
          locale: locale === 'sk' ? 'sk_SK' : 'en_US',
       },
    };
}

// 2. Hlavný komponent
async function Shows({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ locale: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const t = await getTranslations({ locale, namespace: 'ShowsListPage' });
    const b = await getTranslations({ locale, namespace: 'navbar' });

    let filterValue = resolvedSearchParams?.filter;
    const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";
    
    const pageParam = resolvedSearchParams?.page;
    const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");

    let loadingError = false;
    const showsResult = await CmsApiService.Show.listShowsPaginated(page, filter).catch((error) => {
       console.error("Error fetching shows:", error);
       loadingError = true;
       return null;
    });

    const shows = showsResult?.shows || [];
    const DIRECTUS = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
    
    const seriesJson = shows.map((s: any) => ({
       "@context": "https://schema.org",
       "@type": ["RadioSeries", "PodcastSeries"],
       "name": s.Title,
       "description": s.Description || undefined,
       "url": `${SITE_URL}/${locale}/relacie/${s.Slug}`,
       "image": s.Cover ? `${DIRECTUS}/assets/${s.Cover}` : undefined,
       "publisher": { "@type": "Organization", "name": "Radio TLIS", "url": SITE_URL }
    }));

    const breadcrumbs = [
       { label: b('active_shows'), href: `/${locale}/relacie` }
    ];

    return (
        <>
           {seriesJson.map((s: any, i: number) => (<JsonLd key={i} data={s} />))}
           <div className="px-8 mb-4">
              <Breadcrumbs items={breadcrumbs} />
           </div>
           
           {/* Nadpis s prekladom */}
           <div className="px-8 mb-4">
                <h1 className="text-4xl text-white font-semibold">
                    <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
                    {t('heading')}
                </h1>
           </div>

           <ShowsPage 
                shows={shows} 
                totalCount={showsResult?.totalCount || 0} 
                loadingError={loadingError} 
                currentPage={page} 
                locale={locale} 
           />
        </>
    );
};

export default Shows;
export const dynamic = "force-dynamic";