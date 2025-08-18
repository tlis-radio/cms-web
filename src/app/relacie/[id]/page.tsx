import React from "react";
import CmsApiService from "@/services/cms-api-service";
import { usePlayer } from "@/context/PlayerContext";
import Shows from "./Shows";
import NotFound from "@/components/NotFound";

const Show: React.FC = async ({ params }: any) => {
   try {
      const show = await CmsApiService.Show.getShowDataById(params.id)
      const moderators = await CmsApiService.Show.getShowModeratorsByIds(show.Cast);
      const episodes = await CmsApiService.Show.getShowEpisodesById(params.id);
      return <Shows show={show} moderators={moderators} episodes={episodes} ShowName={show.Title} />
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">Reláciu sa nepodarilo načítať.</h2>}></NotFound>
   }
}

export default Show;
export const dynamic = "force-dynamic";