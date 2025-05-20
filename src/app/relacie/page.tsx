import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowLink from "@/components/pagination/show-link";

const Shows: React.FC = async () => {
   const shows = await CmsApiService.Show.listShows();

   const createShowLinks = () => {
      return shows.map(async (show: any, index: number) => {
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
         <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> relácie</h1>
         {createShowLinks()}
      </div>
   );
};

export default Shows;
