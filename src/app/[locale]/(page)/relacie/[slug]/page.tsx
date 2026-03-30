import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Shows from "./Shows";
import NotFound from "@/components/NotFound";
import ShareShow from "./ShareShow";
import type { Metadata } from "next";
import ShowJsonLd from "@/components/ShowJsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getTranslations } from 'next-intl/server';
import { locales, toOgLocale } from "@/navigation";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// 1. Dynamické metadáta s podporou prekladov
export async function generateMetadata({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ slug: string, locale: string }>, 
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
   const { slug, locale } = await params;
   const resolvedSearchParams = await searchParams;
   const t = await getTranslations({ locale, namespace: 'ShowPage' });
   
   const pageParam = resolvedSearchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   const canonicalUrl = page === 1 
      ? `${SITE_URL}/${locale}/relacie/${slug}`
      : `${SITE_URL}/${locale}/relacie/${slug}?page=${page}`;
   
   try {
      const show = await CmsApiService.Show.getShowBySlug(slug);
      const title = show?.Title ? `${show.Title} | Radio TLIS` : `${t('metaTitle_fallback')} | Radio TLIS`;
      const description = show?.Description || t('metaDescription_template', { name: show?.Title || slug });
      const image = show?.Cover ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${show.Cover}` : undefined;
      
      return {
         title,
         description,
         alternates: {
            canonical: canonicalUrl,
            languages: Object.fromEntries(
               locales.map((l) => [l, `${SITE_URL}/${l}/relacie/${slug}`])
            ),
         },
         openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "Radio TLIS",
            locale: toOgLocale(locale),
            images: image ? [{ url: image }] : undefined,
         },
      };
   } catch (e) {
      return {
         title: `${t('metaTitle_fallback')} | Radio TLIS`,
         description: t('metaDescription_fallback'),
         alternates: {
            canonical: canonicalUrl,
            languages: Object.fromEntries(
               locales.map((l) => [l, `${SITE_URL}/${l}/relacie/${slug}`])
            ),
         },
         openGraph: {
            title: `${t('metaTitle_fallback')} | Radio TLIS`,
            description: t('metaDescription_fallback'),
            url: canonicalUrl,
            siteName: "Radio TLIS",
            locale: toOgLocale(locale),
         },
      };
   }
}

// 2. Hlavný komponent stránky
const Show = async ({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ slug: string, locale: string }>, 
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) => {
   const { slug, locale } = await params;
   const resolvedSearchParams = await searchParams;
   const t = await getTranslations({ locale, namespace: 'ShowPage' });
   const n = await getTranslations({ locale, namespace: 'navbar' });
   
   const pageParam = resolvedSearchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   try {
      const show = await CmsApiService.Show.getShowBySlug(slug);
      const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(String(show.id), page);
      const showTags = await CmsApiService.Show.getShowTagsById(String(show.id));
      
      // Mapovanie súvisiacich článkov pre epizódy
      const episodeArticlesMap: Record<string, any[]> = {};
      for (const episode of episodeData.episodes) {
         try {
            const relatedArticles = await CmsApiService.Article.getArticlesByEpisodeId(Number(episode.id));
            if (relatedArticles.length > 0) {
               episodeArticlesMap[episode.id] = relatedArticles;
            }
         } catch (e) {
            // Ignorovanie chýb pri načítaní článkov
         }
      }

      const breadcrumbs = [
         { label: n('active_shows'), href: `/${locale}/relacie` },
         { label: episodeData.show.Title, href: `/${locale}/relacie/${slug}` }
      ];
      
      return <>
          <ShowJsonLd show={episodeData.show} episodes={episodeData.episodes} />
          <ShareShow />
          <div className="px-8 mb-4">
             <Breadcrumbs items={breadcrumbs} />
          </div>
          <Shows 
            showTags={showTags} 
            show={episodeData.show} 
            episodes={episodeData.episodes} 
            totalCount={episodeData.totalCount} 
            ShowName={episodeData.show.Title} 
            currentPage={page}
            episodeArticles={episodeArticlesMap}
            locale={locale}
          />
      </>
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">{t('load_error')}</h2>} />
   }
}

export default Show;
export const dynamic = "force-dynamic";