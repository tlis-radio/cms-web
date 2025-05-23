import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Link from "next/link";

interface ShowGridProps {
  limit?: number;
}

const ShowGrid: React.FC<ShowGridProps> = async ({ limit = 5 }) => {
  const shows = await CmsApiService.Show.listShows();
  const limitedShows = shows.slice(0, limit);

  return (
    <div className="mb-12 py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 px-4 md:px-8 pb-2">
        <h2 className="text-5xl italic text-white font-semibold pb-0">Archív</h2>
        <Link 
          href="/relacie" 
          className="text-white hover:underline mt-2 md:mt-0"
        >
          Zobraziť všetky
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-4 md:px-8">
        {limitedShows.map((show: any, index: number) => (
          <Link 
            key={index} 
            href={`/relacie/${show.id}`}
            className="group transition-transform hover:scale-105"
          >
            <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={"https://directus.tlis.sk/assets/" + show.Cover}
                alt={show.Title}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="mt-2 text-white text-left font-medium line-clamp-1">
              {show.Title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ShowGrid;