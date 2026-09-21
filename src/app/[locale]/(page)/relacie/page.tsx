import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';
import { toOgLocale } from "@/navigation";
import { SITE_URL, alternatesFor, pageUrl, parsePage } from "@/lib/seo";

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

    const page = parsePage(resolvedSearchParams?.page);
    const filterValue = resolvedSearchParams?.filter;
    const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";
    
    const alternates = alternatesFor("/relacie", {
       filter: filter !== "active" ? filter : undefined,
       page,
    });
    
    return {
       // Vymazané "| Radio TLIS" (DRY princíp z layoutu)
       title: t('metaTitle'),
       description: t('metaDescription'),
       alternates,
       openGraph: {
          title: t('metaTitle'),
          description: t('metaDescription'),
          url: alternates.canonical,
          siteName: "Radio TLIS",
          locale: toOgLocale(locale),
       },
    };
}

async function Shows({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ locale: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    const s = await getTranslations({ locale, namespace: 'ShowsPage' });

    const filterValue = resolvedSearchParams?.filter;
    const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";
    const page = parsePage(resolvedSearchParams?.page);

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
       "url": pageUrl(`/relacie/${s.Slug}`),
       "image": s.Cover ? `${DIRECTUS}/assets/${s.Cover}` : undefined,
       "publisher": { "@type": "Organization", "name": "Radio TLIS", "url": SITE_URL }
    }));

    const breadcrumbs = [
       { label: s('breadcrumb_label'), href: `/relacie` }
    ];

    return (
        <>
            {seriesJson.map((show: any, i: number) => (<JsonLd key={`jsonld-${i}`} data={show} />))}
            <div className="px-8 mb-4">
               <Breadcrumbs items={breadcrumbs} />
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