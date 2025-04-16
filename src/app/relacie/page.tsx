import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowLink from "@/components/pagination/show-link";

const Shows: React.FC = async () => {
   const shows = await CmsApiService.Show.listShows(10, 1);

   const createShowLinks = () => {
      return shows.map((show: any, index: number) => {
         return (
            <ShowLink key={index} id={show.id} name={show.Title} description={show.Description} imageUrl={"https://directus.tlis.sk/assets/" + show.Cover} moderatorNames={show.Moderators} />
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
