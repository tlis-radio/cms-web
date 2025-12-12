import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Shows from "./Shows";
import NotFound from "@/components/NotFound";
import ShareShow from "./ShareShow";
import type { Metadata } from "next";
import ShowJsonLd from "@/components/ShowJsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

// Dynamic metadata per show slug
export async function generateMetadata({ params, searchParams }: { params: { slug: string }, searchParams?: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
   const slug = params.slug;
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   const canonicalUrl = page === 1 
      ? `${SITE_URL}/relacie/${slug}`
      : `${SITE_URL}/relacie/${slug}?page=${page}`;
   
   try {
      const show = await CmsApiService.Show.getShowBySlug(slug);
      const title = show?.Title ? `${show.Title} | Radio TLIS` : `Relácia | Radio TLIS`;
      const description = show?.Description || `Relácia ${show?.Title || slug} na Radiu TLIS.`;
      const image = show?.Cover ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${show.Cover}` : undefined;
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
            images: image ? [{ url: image }] : undefined,
         },
      };
   } catch (e) {
      return {
         title: `Relácia | Radio TLIS`,
         description: `Informácie o relácii na Radiu TLIS.`,
         alternates: { canonical: canonicalUrl },
         openGraph: { title: `Relácia | Radio TLIS`, description: `Informácie o relácii.`, url: canonicalUrl, siteName: "Radio TLIS", locale: "sk_SK" },
      };
   }
}

const Show = async ({ params, searchParams }: { params: { slug: string }, searchParams?: { [key: string]: string | string[] | undefined } }) => {
   const { slug } = params;
   const pageParam = searchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   try {
      const show = await CmsApiService.Show.getShowBySlug(slug);
      const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(String(show.id), page);
      const showTags = await CmsApiService.Show.getShowTagsById(String(show.id));
      return <>
          <ShowJsonLd show={episodeData.show} episodes={episodeData.episodes} />
          <ShareShow/>
          <Shows showTags={showTags} show={episodeData.show} episodes={episodeData.episodes} totalCount={episodeData.totalCount} ShowName={episodeData.show.Title} currentPage={page} />
      </>
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">Reláciu sa nepodarilo načítať.</h2>}></NotFound>
   }
}

export default Show;
export const dynamic = "force-dynamic";