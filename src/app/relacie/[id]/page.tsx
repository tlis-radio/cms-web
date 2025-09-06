import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Shows from "./Shows";
import NotFound from "@/components/NotFound";
import ShareShow from "./ShareShow";

const Show: React.FC = async ({ params }: any) => {
   try {
      const show = await CmsApiService.Show.getShowDataById(params.id);
      const moderators = await CmsApiService.Show.getShowModeratorsByIds(show.Cast.map((castMember) => (castMember as any).Cast_id));
      const episodes = await CmsApiService.Show.getShowEpisodesByIdPaginated(params.id, 0);
      return <>
         <ShareShow/>
         <Shows show={show} moderators={moderators} episodes={episodes.episodes} totalCount={episodes.totalCount} ShowName={show.Title} />
      </>
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">Reláciu sa nepodarilo načítať.</h2>}></NotFound>
   }
}

export default Show;
export const dynamic = "force-dynamic";