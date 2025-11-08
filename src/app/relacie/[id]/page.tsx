import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Shows from "./Shows";
import NotFound from "@/components/NotFound";
import ShareShow from "./ShareShow";

const Show: React.FC = async ({ params }: any) => {
   try {
      const episodeData = await CmsApiService.Show.getShowEpisodesByIdPaginated(params.id, 0);
      const showTags = await CmsApiService.Show.getShowTagsById(params.id);
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