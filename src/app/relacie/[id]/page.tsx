import React from "react";
import CmsApiService from "@/services/cms-api-service";

const Show: React.FC = async ({ params }: any) => {
   const show = await CmsApiService.Show.getShowDataById(params.id)

   return (
      <div className="mb-[80px] flex w-full justify-center md:mb-0">
         <div className="w-full -z-10 px-2">
            <div className="flex flex-col gap-4 border bg-[#1c1c1c] p-4 text-white drop-shadow-lg">
               <div className="border-b pb-4">
                  <div className="flex flex-col gap-6 md:flex-row ">
                     <img className="md:h-52" src={show.profileImage.url} />
                     <div className="m-auto flex h-max w-max flex-col gap-4">
                        <p className="text-2xl font-semibold">{show.name}</p>
                        <p>{show.moderators.map((moderator) => moderator.nickname).join(", ")}</p>
                        <p>Archív: 0</p>
                     </div>
                  </div>
               </div>
               <div className="flex h-full gap-4 md:flex-col">
                  <p>{show.description}</p>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Show;