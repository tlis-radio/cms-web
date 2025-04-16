import React from "react";
import CmsApiService from "@/services/cms-api-service";

const Show: React.FC = async ({ params }: any) => {
   const show = await CmsApiService.Show.getShowDataById(params.id)
   const episodes = await CmsApiService.Show.getShowEpisodesById(params.id);

   return (
      <div className="mb-[80px] flex w-full justify-center md:mb-0">
         <div className="w-full -z-10 px-2">
            <div className="flex flex-col gap-4 border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
               <div className="border-b pb-4">
                  <div className="flex flex-col gap-6 md:flex-row ">
                     <img className="md:h-52" src={"https://directus.tlis.sk/assets/" + show.Cover} />
                     <div className="m-auto flex h-max w-max flex-col gap-4">
                        <p className="text-2xl font-semibold">{show.Title}</p>
                        <p>{show.Moderators.join(", ")}</p>
                        <p>Archív: {episodes.length}</p>
                     </div>
                  </div>
               </div>
               <div className="flex h-full gap-4 md:flex-col">
                  <p>{show.Description}</p>
               </div>
            </div>

            <div className="mb-8">
               {episodes.map((episode: any, index: number) => {
                  return (
                     <div key={index} className="flex flex-col gap-4 border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
                        <div className="flex flex-col gap-6 md:flex-row ">
                           <img className="md:h-52" src={"https://directus.tlis.sk/assets/" + episode.Cover} />
                           <div className="m-auto flex h-max w-max flex-col gap-4">
                              <p className="text-2xl font-semibold">{episode.Title}</p>
                           </div>
                        </div>
                        <div className="flex h-full gap-4 md:flex-col">
                           <p>{episode.Description}</p>
                        </div>
                     </div>
                  )
               })}
            </div>
         </div>
      </div>
   )
}

export default Show;