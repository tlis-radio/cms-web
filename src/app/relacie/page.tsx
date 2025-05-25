import React, { useState } from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import { Show } from "@/models/show";

const Shows: React.FC = async () => {
   var shows = await CmsApiService.Show.listShows();

   shows = await Promise.all(
      shows.map(async (show: Show) => {
         const moderatorNames = await CmsApiService.Show.getShowModeratorsByIds(show.Moderators);
         return { ...show, ModeratorNames: moderatorNames };
      })
   );

   return (
      <div>
         <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> relácie</h1>
         <ShowsPage shows={shows} />
      </div>
   );
};

export default Shows;
