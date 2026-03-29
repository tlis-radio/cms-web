import React from "react";
import CmsApiService from "@/services/cms-api-service";
import CastPage from "./CastPage";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ 
   params, 
   searchParams 
}: { 
   params: Promise<{ slug: string, locale: string }>; 
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
   const { slug, locale } = await params;
   const queryParams = await searchParams;
   const t = await getTranslations({ locale, namespace: 'CastMemberPage' });
   
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
         title: `${t('notFoundTitle')} | Radio TLIS`,
      };
   }

   const canonicalUrl = page === 1 
      ? `${SITE_URL}/${locale}/ucinkujuci/${slug}`
      : `${SITE_URL}/${locale}/ucinkujuci/${slug}?page=${page}`;
   
   // Dynamický popis s lokalizovaným skloňovaním
   const description = t('metaDescription', { 
      name: cast.Name, 
      showsCount, 
      articlesCount 
   });
   
   return {
      title: `${cast.Name} | Radio TLIS`,
      description,
      alternates: {
         canonical: canonicalUrl,
         languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/ucinkujuci/${slug}`])
         ),
      },
      openGraph: {
         title: `${cast.Name} | Radio TLIS`,
         description,
         url: canonicalUrl,
         siteName: "Radio TLIS",
         locale: toOgLocale(locale),
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
   params: Promise<{ slug: string, locale: string }>; 
   searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) => {
   const { slug, locale } = await params;
   const queryParams = await searchParams;
   const t = await getTranslations({ locale, namespace: 'CastMemberPage' });
   
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
   
   const personJson = cast ? {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": cast.Name,
      "url": `${SITE_URL}/${locale}/ucinkujuci/${cast.Slug}`,
   } : null;

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
      { label: t('breadcrumbParent'), href: `/${locale}/ucinkujuci` },
      { label: cast?.Name || t('loading'), href: `/${locale}/ucinkujuci/${slug}` }
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
            locale={locale}
         />
      </>
   );
};

export default CastMemberPage;
export const dynamic = "force-dynamic";