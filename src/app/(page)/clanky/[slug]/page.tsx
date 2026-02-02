import React from "react";
import CmsApiService from "@/services/cms-api-service";
import NotFound from "@/components/NotFound";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { extractEpisodeIds } from "@/lib/markdown-parser";
import ArticleDetail from "./ArticleDetail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
   const slug = params.slug;
   const canonicalUrl = `${SITE_URL}/clanky/${slug}`;
   
   try {
      const article = await CmsApiService.Article.getArticleBySlug(slug);
      const title = article?.title ? `${article.title} | Radio TLIS` : `Článok | Radio TLIS`;
      const description = article?.description || `Článok na Radiu TLIS.`;
      const image = article?.cover_image ? `${DIRECTUS_URL}/assets/${article.cover_image}` : undefined;
      
      return {
         title,
         description,
         alternates: { canonical: canonicalUrl },
         openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "Radio TLIS",
            locale: "sk_SK",
            type: "article",
            publishedTime: article?.published_at,
            authors: article?.author?.Name ? [article.author.Name] : undefined,
            images: image ? [{ url: image }] : undefined,
         },
         twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : undefined,
         },
      };
   } catch (e) {
      return {
         title: `Článok | Radio TLIS`,
         description: `Článok na Radiu TLIS.`,
         alternates: { canonical: canonicalUrl },
         openGraph: { 
            title: `Článok | Radio TLIS`, 
            description: `Článok na Radiu TLIS.`, 
            url: canonicalUrl, 
            siteName: "Radio TLIS", 
            locale: "sk_SK" 
         },
      };
   }
}

const ArticlePage = async ({ params }: { params: { slug: string } }) => {
   const { slug } = params;
   
   try {
      const article = await CmsApiService.Article.getArticleBySlug(slug);
      
      // Extract episode IDs from content and fetch them with show data
      const episodeIds = article.content ? extractEpisodeIds(article.content) : [];
      const episodesMap = new Map();
      const episodeShowsMap = new Map(); // Map episode ID to show data
      
      for (const episodeId of episodeIds) {
         try {
            const episode = await CmsApiService.Show.getEpisodeById(episodeId);
            if (episode) {
               episodesMap.set(episodeId, episode);
               // Fetch show data for this episode
               try {
                  const show = await CmsApiService.Show.getShowByEpisodeId(episodeId);
                  if (show) {
                     episodeShowsMap.set(episodeId, show);
                  }
               } catch (e) {
                  console.error(`Failed to fetch show for episode ${episodeId}`);
               }
            }
         } catch (e) {
            console.error(`Failed to fetch episode ${episodeId}`);
         }
      }
      
      // Get gallery images
      const galleryImages = article.gallery?.map(g => g.directus_files_id) || [];
      
      // Build JSON-LD
      const articleJsonLd = {
         "@context": "https://schema.org",
         "@type": article.type === "event" || article.type === "report" ? "Event" : "Article",
         "headline": article.title,
         "description": article.description,
         "url": `${SITE_URL}/clanky/${article.slug}`,
         "image": article.cover_image ? `${DIRECTUS_URL}/assets/${article.cover_image}` : undefined,
         "datePublished": article.published_at,
         "author": article.author ? {
            "@type": "Person",
            "name": article.author.Name
         } : undefined,
         "publisher": {
            "@type": "Organization",
            "name": "Radio TLIS",
            "url": SITE_URL
         },
         ...(article.type === "event" || article.type === "report" ? {
            "startDate": article.event_time,
            "location": article.event_place ? {
               "@type": "Place",
               "name": article.event_place
            } : undefined
         } : {})
      };

      return (
         <>
            <JsonLd data={articleJsonLd} />
            <ArticleDetail 
               article={article} 
               episodes={episodesMap}
               episodeShows={episodeShowsMap}
               galleryImages={galleryImages}
            />
         </>
      );
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">Článok sa nepodarilo načítať.</h2>} />;
   }
};

export default ArticlePage;
export const dynamic = "force-dynamic";
