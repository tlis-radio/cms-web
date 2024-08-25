import React from "react";
import krivko from "@/../public/images/whodba.jpg";
import { Pagination } from "@/models/pagination";
import { Show } from "@/models/show";

async function fetchPagintonShows (){
   const limit = 10;
   const page = 1;
   const response = await fetch(`https://cms.api.staging.tlis.sk/showmanagement/Show/pagination?Limit=${limit}&Page=${page}`);
   const data: Pagination<Show>= await response.json();
   //console.log(data.results[0].id);
}

const Shows: React.FC = () => {

   fetchPagintonShows();

   return (
      <div>
         <div className="bg-[#1c1c1c] text-white mx-4 flex cursor-pointer flex-col gap-4 border-b-2 p-4 hover:bg-[#111] transition-colors duration-200 sm:flex-row justify-center items-center">
            <div>
               <img src={krivko.src} className="w-80"/>
            </div>
            <div className="flex flex-col gap-2 text-left">
               <h2 className="text-2xl font-semibold">Whodba</h2>
               <span className="flex items-center gap-2">
                  <p className="text-lg font-semibold">Moderátori:</p>
                  <p>Cusco Cota</p>
               </span>
               <p className="pb-4 font-argentumSansLight">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ex hic nam eum quas a sit quidem id sed soluta, eius debitis asperiores recusandae explicabo assumenda voluptas deleniti veritatis? Eos, consequatur.</p>
            </div>
         </div>
      </div>
   );
}

export default Shows;