import React, { useState } from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   const filterValue = searchParams?.filter;
   const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";
   
   const canonicalUrl = page === 1 
      ? `${SITE_URL}/relacie${filter !== "active" ? `?filter=${filter}` : ""}`
      : `${SITE_URL}/relacie?${filter !== "active" ? `filter=${filter}&` : ""}page=${page}`;
   
   return {
      title: "Relácie | Radio TLIS",
      description: "Prehľad relácií Radia TLIS — vyhľadajte relácie, moderátorov a posledné epizódy.",
      alternates: { canonical: canonicalUrl },
      openGraph: {
         title: "Relácie | Radio TLIS",
         description: "Prehľad relácií Radia TLIS — vyhľadajte relácie, moderátorov a epizódy.",
         url: canonicalUrl,
         siteName: "Radio TLIS",
         locale: "sk_SK",
      },
   };
}

const Shows: React.FC = async ({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) => {
   let filterValue = searchParams?.filter;
   const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";
   
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");

   var loadingError = false;
   var showsResult = await CmsApiService.Show.listShowsPaginated(page, filter).catch((error) => {
      console.error("Error fetching shows:", error);
      loadingError = true;
      return null;
   });

   const shows = showsResult?.shows || [];
   const DIRECTUS = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
   const site = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
   const seriesJson = shows.map((s: any) => ({
      "@context": "https://schema.org",
      "@type": ["RadioSeries", "PodcastSeries"],
      "name": s.Title,
      "description": s.Description || undefined,
      "url": `${site}/relacie/${s.Slug}`,
      "image": s.Cover ? `${DIRECTUS}/assets/${s.Cover}` : undefined,
      "publisher": { "@type": "Organization", "name": "Radio TLIS", "url": site }
   }));

   const breadcrumbs = [
      { label: "Relácie", href: "/relacie" }
   ];

   return (<>
      {seriesJson.map((s: any, i: number) => (<JsonLd key={i} data={s} />))}
      <div className="px-8 mb-4">
         <Breadcrumbs items={breadcrumbs} />
      </div>
      <ShowsPage shows={shows} totalCount={showsResult?.totalCount || 0} loadingError={loadingError} currentPage={page} />
   </>);
};

export default Shows;
export const dynamic = "force-dynamic";