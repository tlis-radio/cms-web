import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowLink from "@/components/pagination/show-link";

const Shows: React.FC = async () => {
   const shows = await CmsApiService.Show.listShows(10, 1);

   const createShowLinks = () => {
      return shows.map((show, index) => {
         return (
            <ShowLink key={index} id={show.id} name={show.name} description={show.description} imageUrl={show.profileImageUrl} moderatorNames={show.moderatorNames} />
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
