import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Link from "next/link";
import Image from "next/image";
import TlisImage from "./TlisImage";

interface ShowGridProps {
  limit?: number;
}

const ShowGrid: React.FC<ShowGridProps> = async ({ limit = 5 }) => {
  var loadingError = false;
  const shows = await CmsApiService.Show.listShows().catch((error) => {
    console.error("Error fetching shows:", error);
    loadingError = true;
    return [];
  });
  const limitedShows = shows.slice(0, limit);

  return (
    <div className="mb-12 py-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 px-4 md:px-8 pb-2">
        <h2 className="text-4xl text-white font-semibold pb-0"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> archív</h2>
        <Link
          href="/relacie"
          className="text-white font-bold hover:underline mt-2 md:mt-0 hidden sm:block"
        >
          ZOBRAZIŤ VŠETKY
        </Link>
      </div>

      {loadingError && <div className="relative py-8">
        <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
          Chyba pri načítaní archívu
        </h3>
        <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
      </div>}

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-4 md:px-8">
        {limitedShows.map((show: any, index: number) => (
          <Link
            key={index}
            href={`/relacie/${show.Slug}`}
            className="group transition-transform hover:scale-105 flex flex-col"
          >
            <div className="aspect-square relative rounded-lg overflow-hidden shadow-lg order-1 sm:order-0 mb-8 sm:mb-2">
              <TlisImage
                src={show.Cover}
                width={500}
                height={500}
                alt={show.Title}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-argentumSansMedium text-white text-left text-2xl line-clamp-1 order-0 sm:order-1 sm:mt-2 sm:mb-0 mb-2">
              {show.Title}
            </h3>
          </Link>
        ))}
      </div>

      <Link
          href="/relacie"
          className="font-argentumSansMedium bg-[#d43c4a] rounded-full px-4 py-2 text-white block sm:hidden w-fit m-auto mt-10"
        >
          ZOBRAZIŤ VŠETKY
        </Link>

    </div>
  );
};

export default ShowGrid;