import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';
import { toOgLocale } from "@/navigation";
import { SITE_URL, alternatesFor, pageUrl, parsePage } from "@/lib/seo";

type SearchParams = { [key: string]: string | string[] | undefined };

// ?q= — vyhľadávací dopyt (aj z OpenSearch / SearchAction), orezaný na rozumnú dĺžku
function parseQuery(param: SearchParams[string]): string {
    const raw = Array.isArray(param) ? param[0] : param;
    return (raw || "").trim().slice(0, 100);
}

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
    const query = parseQuery(resolvedSearchParams?.q);

    // Výsledky vyhľadávania neindexujeme — kanonicky ukazujú na zoznam relácií
    if (query) {
       return {
          title: `${t('metaTitle')}: ${query}`,
          description: t('metaDescription'),
          alternates: alternatesFor("/relacie"),
          robots: { index: false, follow: true },
       };
    }
    
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
    const query = parseQuery(resolvedSearchParams?.q);

    let loadingError = false;
    const showsRequest = query
       ? CmsApiService.Show.searchShows(query, page)
       : CmsApiService.Show.listShowsPaginated(page, filter);
    const showsResult = await showsRequest.catch((error) => {
       console.error("Error fetching shows:", error);
       loadingError = true;
       return null;
    });

    const shows = showsResult?.shows || [];
    const DIRECTUS = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
    
    // Pri vyhľadávaní JSON-LD relácií nevkladáme (stránka je noindex)
    const seriesJson = query ? [] : shows.map((s: any) => ({
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
                query={query}
            />
        </>
    );
};

export default Shows;
export const dynamic = "force-dynamic";