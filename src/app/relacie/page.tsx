import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowLink from "@/components/pagination/show-link";

const Shows: React.FC = async () => {
   const shows = await CmsApiService.Show.listShows();

   const createShowLinks = () => {
      return shows.map( async (show: any, index: number) => {
         const moderatorNames = await CmsApiService.Show.getShowModeratorsByIds(show.Moderators);

         return (
            <ShowLink 
               key={index} 
               id={show.id} 
               name={show.Title} 
               description={show.Description} 
               imageUrl={"https://directus.tlis.sk/assets/" + show.Cover} 
               moderatorNames={moderatorNames}
            />
         )
      })
   }

   return (
      <div>
         {createShowLinks()}
      </div>
   );
};

export default Shows;
