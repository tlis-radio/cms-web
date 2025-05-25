"use client";
import ShowLink from "@/components/pagination/show-link";
import { Show } from "@/models/show";
import { useState } from "react";

type FilterProps = "active" | "archived" | "digital";

export default function ShowsPage({ shows }: { shows: Show[] }) {
  const [filter, setFilter] = useState<FilterProps>("active");

  const createShowLinks = () => {
    const filteredShows = shows.filter((show: Show) => show.Filter === filter);
    return filteredShows.map((show: any, index: number) => {
      return (
        <ShowLink
          key={index}
          id={show.id}
          name={show.Title}
          description={show.Description}
          imageUrl={"https://directus.tlis.sk/assets/" + show.Cover}
          moderatorNames={show.ModeratorNames}
        />
      )
    })
  }

  const filterLabels = {
    active: "Aktívne relácie",
    archived: "Archívne relácie",
    digital: "Digitálne relácie"
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-8 px-8">
        <h1 className="text-4xl text-white font-semibold">
          <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> relácie
        </h1>
        <div className="ml-auto relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterProps)}
            className="appearance-none bg-transparent text-white pr-6 pl-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="active" className="text-black">Aktívne relácie</option>
            <option value="archived" className="text-black">Archívne relácie</option>
            <option value="digital" className="text-black">Digitálne relácie</option>
          </select>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      <div className="px-8">
        {createShowLinks()}
      </div>
    </>
  )
}