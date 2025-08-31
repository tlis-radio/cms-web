"use client";
import ShowLink from "@/components/pagination/show-link";
import Select from "@/components/primitives/Select";
import { Show } from "@/models/show";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type FilterProps = "active" | "archived" | "digital";

export default function ShowsPage({ shows, loadingError }: { shows: Show[], loadingError?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterProps>(searchParams.get("filter") as FilterProps || "active");

  useEffect(()=>{
    const newFilter = searchParams.get("filter") as FilterProps;
    if (newFilter) {
      setFilter(newFilter);
    }
  }, [searchParams])

  useEffect(() => {
    if (filter) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", filter);
      router.replace(`?${params.toString()}`); // or router.push
    }
  }, [filter, searchParams, router]);

  const createShowLinks = () => {
    const filteredShows = shows.filter((show: Show) => show.Filter === filter);
    return filteredShows.map((show: any, index: number) => {
      return (
        <ShowLink
          key={index}
          id={show.id}
          name={show.Title}
          description={show.Description}
          imageUrl={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/` + show.Cover}
          moderatorNames={show.ModeratorNames}
        />
      )
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-8 px-8">
        <h1 className="text-4xl text-white font-semibold">
          <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> relácie
        </h1>

        <div className="ml-auto relative min-w-[180px]">
          <Select
            options={[
              { value: "active", label: "Aktívne relácie" },
              { value: "archived", label: "Archívne relácie" },
              { value: "digital", label: "Digitálne relácie" },
            ]}
            value={filter}
            onChange={(val) => setFilter(val as FilterProps)}
            className="bg-transparent text-white min-w-[180px]"
          />
        </div>
      </div>

      {loadingError && <div className="relative py-8">
        <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
          Chyba pri načítaní archívu
        </h3>
        <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
      </div>}

      <div className="px-8">
        {createShowLinks()}
      </div>
    </>
  )
}