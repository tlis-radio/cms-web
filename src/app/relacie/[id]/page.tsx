import React from "react";
import CmsApiService from "@/services/cms-api-service";
import { usePlayer } from "@/context/PlayerContext";
import Shows from "./Shows";

const Show: React.FC = async ({ params }: any) => {
   try{
      const show = await CmsApiService.Show.getShowDataById(params.id)
      const moderators = await CmsApiService.Show.getShowModeratorsByIds(show.Moderators);
      const episodes = await CmsApiService.Show.getShowEpisodesById(params.id);
      return <Shows show={show} moderators={moderators} episodes={episodes}/>
   }catch (error){
      return <div className="text-center text-white">404</div>
   }
}

export default Show;