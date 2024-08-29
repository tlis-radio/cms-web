import React from "react";
import krivko from "@/../public/images/whodba.jpg";
import { Pagination } from "@/models/pagination";
import { Show } from "@/models/show";

async function fetchShows(): Promise<Show[]> {
   const limit = 6;
   const page = 1;
   try {
      const response = await fetch(
         `https://cms.api.staging.tlis.sk/showmanagement/Show/pagination?Limit=${limit}&Page=${page}`,
         {
            // You might need to add this option for fetch in a server component
            next: { revalidate: 5 }, // Revalidate after 60 seconds (optional, if you want caching)
         }
      );
      const data: Pagination<Show> = await response.json();
      return data.results || [];
   } catch (error) {
      console.error("Failed to fetch shows:", error);
      return [];
   }
}

const Shows: React.FC = async () => {
   const shows = await fetchShows(); // Fetch data on the server

   return (
      <div>
         {shows.map((show) => (
            <div key={show.id} className="bg-[#1c1c1c] text-white mx-4 flex cursor-pointer flex-col gap-4 border-b-2 p-4 hover:bg-[#111] transition-colors duration-200 sm:flex-row items-center">
               <div>
                  <img src={krivko.src} className="w-48" />
               </div>
               <div className="flex flex-col gap-2 text-left">
                  <h2 className="text-2xl font-semibold">{show.name}</h2>
                  <span className="flex items-center gap-2">
                     <p className="text-lg font-semibold">Moderátori:</p>
                     <p>Cusco Cota</p>
                  </span>
                  <p className="pb-4 font-argentumSansLight">{show.description}</p>
               </div>
            </div>
         ))}
      </div>
   );
};

export default Shows;
