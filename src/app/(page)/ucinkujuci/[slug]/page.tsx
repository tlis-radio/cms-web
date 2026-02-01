import React from "react";
import CmsApiService from "@/services/cms-api-service";
import CastPage from "./CastPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ 
   params, 
   searchParams 
}: { 
   params: { slug: string }; 
   searchParams?: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   let cast;
   try {
      cast = await CmsApiService.Cast.getCastBySlug(params.slug);
   } catch (error) {
      return {
         title: "Účinkujúci nenájdený | Radio TLIS",
      };
   }

   const canonicalUrl = page === 1 
      ? `${SITE_URL}/ucinkujuci/${params.slug}`
      : `${SITE_URL}/ucinkujuci/${params.slug}?page=${page}`;
   
   return {
      title: `${cast.Name} | Radio TLIS`,
      description: cast.Description || `Prehľad všetkých relácií s účinkujúcim ${cast.Name} na Rádiu TLIS.`,
      alternates: { canonical: canonicalUrl },
      openGraph: {
         title: `${cast.Name} | Radio TLIS`,
         description: cast.Description || `Prehľad všetkých relácií s účinkujúcim ${cast.Name} na Rádiu TLIS.`,
         url: canonicalUrl,
         siteName: "Radio TLIS",
         locale: "sk_SK",
      },
   };
}

const CastMemberPage = async ({ 
   params, 
   searchParams 
}: { 
   params: { slug: string }; 
   searchParams?: { [key: string]: string | string[] | undefined } 
}) => {
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");

   let loadingError = false;
   let cast = null;
   let showsResult = null;

   try {
      cast = await CmsApiService.Cast.getCastBySlug(params.slug);
      showsResult = await CmsApiService.Cast.getShowsByCastIdPaginated(cast.id, page);
   } catch (error) {
      console.error("Error fetching cast or shows:", error);
      loadingError = true;
   }

   const shows = showsResult?.shows || [];
   const DIRECTUS = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
   const site = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
   
   // Create Person JSON-LD for the cast member
   const personJson = cast ? {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": cast.Name,
      "description": cast.Description || undefined,
      "url": `${site}/ucinkujuci/${cast.Slug}`,
   } : null;

   // Create RadioSeries JSON-LD for each show
   const seriesJson = shows.map((s: any) => ({
      "@context": "https://schema.org",
      "@type": ["RadioSeries", "PodcastSeries"],
      "name": s.Title,
      "description": s.Description || undefined,
      "url": `${site}/relacie/${s.Slug}`,
      "image": s.Cover ? `${DIRECTUS}/assets/${s.Cover}` : undefined,
      "publisher": { "@type": "Organization", "name": "Radio TLIS", "url": site }
   }));

   return (
      <>
         {personJson && <JsonLd data={personJson} />}
         {seriesJson.map((s: any, i: number) => (<JsonLd key={i} data={s} />))}
         <CastPage 
            cast={cast} 
            shows={shows} 
            totalCount={showsResult?.totalCount || 0} 
            loadingError={loadingError} 
            currentPage={page} 
         />
      </>
   );
};

export default CastMemberPage;
export const dynamic = "force-dynamic";
