import React, { useState } from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import { Show } from "@/models/show";

const Shows: React.FC = async () => {
   var loadingError = false;
   var shows = await CmsApiService.Show.listShows().catch((error) => {
      console.error("Error fetching shows:", error);
      loadingError = true;
      return [];
   });
   shows = await Promise.all(
      shows.map(async (show: Show) => {
         const moderatorNames = await CmsApiService.Show.getShowModeratorsByIds(show.Cast);
         return { ...show, ModeratorNames: moderatorNames };
      })
   );

   return (<ShowsPage shows={shows} loadingError={loadingError} />);
};

export default Shows;
export const dynamic = "force-dynamic";