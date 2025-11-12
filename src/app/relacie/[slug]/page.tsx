import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Shows from "./Shows";
import NotFound from "@/components/NotFound";
import ShareShow from "./ShareShow";

const Show = async ({ params }: { params: { slug: string } }) => {
   const { slug } = params;
   try {
      const show = await CmsApiService.Show.getShowBySlug(slug);
      const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(String(show.id), 0);
      const showTags = await CmsApiService.Show.getShowTagsById(String(show.id));
      return <>
         <ShareShow/>
         <Shows showTags={showTags} show={episodeData.show} episodes={episodeData.episodes} totalCount={episodeData.totalCount} ShowName={episodeData.show.Title} />
      </>
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">Reláciu sa nepodarilo načítať.</h2>}></NotFound>
   }
}

export default Show;
export const dynamic = "force-dynamic";