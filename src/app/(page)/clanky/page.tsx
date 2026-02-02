import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ArticlesPage from "./ArticlesPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   const canonicalUrl = page === 1 
      ? `${SITE_URL}/clanky`
      : `${SITE_URL}/clanky?page=${page}`;
   
   return {
      title: "Články | Radio TLIS",
      description: "Prehľad článkov, reportáží a udalostí Radia TLIS — novinky, recenzie a záznamy z akcií.",
      alternates: { canonical: canonicalUrl },
      openGraph: {
         title: "Články | Radio TLIS",
         description: "Prehľad článkov, reportáží a udalostí Radia TLIS.",
         url: canonicalUrl,
         siteName: "Radio TLIS",
         locale: "sk_SK",
      },
   };
}

const Articles: React.FC = async ({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) => {
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");

   let loadingError = false;
   const articlesResult = await CmsApiService.Article.listArticlesPaginated(page).catch((error) => {
      console.error("Error fetching articles:", error);
      loadingError = true;
      return null;
   });

   const articles = articlesResult?.articles || [];
   const DIRECTUS = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
   const site = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
   
   const articlesJson = articles.map((a: any) => ({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": a.title,
      "description": a.description || undefined,
      "url": `${site}/clanky/${a.slug}`,
      "image": a.thumbnail_image ? `${DIRECTUS}/assets/${a.thumbnail_image}` : undefined,
      "datePublished": a.published_at,
      "author": a.author ? {
         "@type": "Person",
         "name": a.author.Name
      } : undefined,
      "publisher": { "@type": "Organization", "name": "Radio TLIS", "url": site }
   }));

   const breadcrumbs = [
      { label: "Články", href: "/clanky" }
   ];

   return (
      <>
         {articlesJson.map((a: any, i: number) => (<JsonLd key={i} data={a} />))}
         <div className="px-8 mb-4">
            <Breadcrumbs items={breadcrumbs} />
         </div>
         <ArticlesPage 
            articles={articles} 
            totalCount={articlesResult?.totalCount || 0} 
            loadingError={loadingError} 
            currentPage={page} 
         />
      </>
   );
};

export default Articles;
export const dynamic = "force-dynamic";
