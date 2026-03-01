import React from "react";
import CmsApiService from "@/services/cms-api-service";
import CastPage from "./CastPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ 
   params, 
   searchParams 
}: { 
   params: Promise<{ slug: string }>; 
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
   const {slug} = await params;
   const queryParams = await searchParams;
   const pageParam = queryParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   let cast;
   let showsCount = 0;
   let articlesCount = 0;
   
   try {
      cast = await CmsApiService.Cast.getCastBySlug(slug);
      const [showsResult, articlesResult] = await Promise.all([
         CmsApiService.Cast.getShowsByCastIdPaginated(cast.id, 1).catch(() => ({ totalCount: 0 })),
         CmsApiService.Article.getArticlesByAuthorIdPaginated(cast.id, 1).catch(() => ({ totalCount: 0 }))
      ]);
      showsCount = showsResult.totalCount;
      articlesCount = articlesResult.totalCount;
   } catch (error) {
      return {
         title: "Účinkujúci nenájdený | Radio TLIS",
      };
   }

   const canonicalUrl = page === 1 
      ? `${SITE_URL}/ucinkujuci/${slug}`
      : `${SITE_URL}/ucinkujuci/${slug}?page=${page}`;
   
   const description = `Profil ${cast.Name} na Rádiu TLIS. ${showsCount} ${showsCount === 1 ? 'relácia' : 'relácií'}, ${articlesCount} ${articlesCount === 1 ? 'článok' : 'článkov'}.`;
   
   return {
      title: `${cast.Name} | Radio TLIS`,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
         title: `${cast.Name} | Radio TLIS`,
         description,
         url: canonicalUrl,
         siteName: "Radio TLIS",
         locale: "sk_SK",
         type: "profile",
      },
      twitter: {
         card: "summary",
         title: `${cast.Name} | Radio TLIS`,
         description,
      },
   };
}

const CastMemberPage = async ({ 
   params, 
   searchParams 
}: { 
   params: Promise<{ slug: string }>; 
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) => {
   const { slug } = await params;
   const queryParams = await searchParams;
   const pageParam = queryParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");

   let loadingError = false;
   let cast = null;
   let showsResult = null;
   let articlesResult = null;

   try {
      cast = await CmsApiService.Cast.getCastBySlug(slug);
      showsResult = await CmsApiService.Cast.getShowsByCastIdPaginated(cast.id, page);
      articlesResult = await CmsApiService.Article.getArticlesByAuthorIdPaginated(cast.id, page);
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

   const breadcrumbs = [
      { label: "Účinkujúci", href: "/ucinkujuci" },
      { label: cast?.Name || "Načítava sa...", href: `/ucinkujuci/${slug}` }
   ];

   return (
      <>
         {personJson && <JsonLd data={personJson} />}
         {seriesJson.map((s: any, i: number) => (<JsonLd key={i} data={s} />))}
         <div className="px-8 mb-4">
            <Breadcrumbs items={breadcrumbs} />
         </div>
         <CastPage 
            cast={cast} 
            shows={shows} 
            articles={articlesResult?.articles || []}
            showsTotalCount={showsResult?.totalCount || 0}
            articlesTotalCount={articlesResult?.totalCount || 0}
            loadingError={loadingError} 
            currentPage={page} 
         />
      </>
   );
};

export default CastMemberPage;
export const dynamic = "force-dynamic";
