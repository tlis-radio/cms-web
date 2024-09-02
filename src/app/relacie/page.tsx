import React from "react";
import CmsApiService from "@/services/cms-api-service";
import PaginationImage from "@/components/pagination-image/image";

const Shows: React.FC = async () => {
   const shows = await CmsApiService.Show.listShows(10, 1); 

   return (
      <div>
         {shows.map((show) => (
            <div key={show.id} className="bg-[#1c1c1c] text-white mx-4 flex cursor-pointer flex-col gap-4 border-b-2 p-4 hover:bg-[#111] transition-colors duration-200 sm:flex-row items-center">
               
               <PaginationImage src={CmsApiService.Image.getShowImage(show.profileImageId)} alt={show.name}/>
               
               <div className="flex flex-col gap-2 text-left">
                  <h2 className="text-2xl font-semibold">{show.name}</h2>
                  <span className="flex items-center gap-2">
                     <p className="text-lg font-semibold">Moderátori:</p>
                     <p>{CmsApiService.Show.getModeratorName(show.moderatorIds)}</p>
                  </span>
                  <p className="text-justify pb-4 font-argentumSansLight">{show.description}</p>
               </div>
            </div>
         ))}
      </div>
   );
};

export default Shows;
