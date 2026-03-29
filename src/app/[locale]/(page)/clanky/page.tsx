import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ArticlesPage from "./ArticlesPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
const locales = ['sk', 'en', 'de', 'es', 'uk', 'tpi'];

export async function generateMetadata({ 
   params, 
   searchParams 
}: { 
   params: Promise<{ locale: string }>, 
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
   const { locale } = await params;
   const requestedParams = await searchParams;
   const pageParam = requestedParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   const t = await getTranslations({ locale, namespace: 'ArticlesPage' });
   
   // Bod od kolegu: Canonical by mal smerovať na hlavnú verziu (často .sk)
   // Ak chcete canonical podľa jazyka, nechaj tam ${locale}, ale on písal "vždy sk"
   const canonicalUrl = page === 1 
      ? `${SITE_URL}/sk/clanky`
      : `${SITE_URL}/sk/clanky?page=${page}`;
   
   return {
      title: t('metaTitle') || 'Články',
      description: t('metaDescription') || "Prehľad článkov, reportáží a udalostí Radia TLIS.",
      alternates: { 
         canonical: canonicalUrl,
         languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/clanky${page > 1 ? `?page=${page}` : ''}`])
         ),
      },
      openGraph: {
         title: t('metaTitle') || 'Články',
         description: t('metaDescription') || "Prehľad článkov, reportáží a udalostí Radia TLIS.",
         url: `${SITE_URL}/${locale}/clanky`,
         siteName: "Radio TLIS",
         locale: locale === 'sk' ? 'sk_SK' : 'en_US',
      },
   };
}

const Articles = async ({ 
   params, 
   searchParams 
}: { 
   params: Promise<{ locale: string }>, 
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) => {
   const { locale } = await params;
   const requestedParams = await searchParams;
   
   const pageParam = requestedParams?.page;
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
      "url": `${site}/${locale}/clanky/${a.slug}`,
      "image": a.thumbnail_image ? `${DIRECTUS}/assets/${a.thumbnail_image}` : undefined,
      "datePublished": a.published_at,
      "author": a.author ? {
         "@type": "Person",
         "name": a.author.Name
      } : undefined,
      "publisher": { "@type": "Organization", "name": "Radio TLIS", "url": site }
   }));

   const breadcrumbs = [
      { label: locale === 'sk' ? "Články" : "Articles", href: `/${locale}/clanky` }
   ];

   return (
      <>
         {articlesJson.map((a: any, i: number) => (
            <JsonLd key={`jsonld-${a.url || i}`} data={a} />
         ))}
         
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