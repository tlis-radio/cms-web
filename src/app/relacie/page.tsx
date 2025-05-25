import React, { useState } from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import { Show } from "@/models/show";

const Shows: React.FC = async () => {
   var shows = await CmsApiService.Show.listShows();
   shows = await Promise.all(
      shows.map(async (show: Show) => {
         const moderatorNames = await CmsApiService.Show.getShowModeratorsByIds(show.Cast);
         return { ...show, ModeratorNames: moderatorNames };
      })
   );

   return (<ShowsPage shows={shows} />);
};

export default Shows;
