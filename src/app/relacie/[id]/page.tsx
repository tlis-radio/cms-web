import React from "react";
import CmsApiService from "@/services/cms-api-service";
import { usePlayer } from "@/context/PlayerContext";
import Shows from "./Shows";

const Show: React.FC = async ({ params }: any) => {
   const show = await CmsApiService.Show.getShowDataById(params.id)
   const episodes = await CmsApiService.Show.getShowEpisodesById(params.id);

   return <Shows show={show} episodes={episodes}/>
}

export default Show;