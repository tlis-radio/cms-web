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


  return createShowLinks()
}