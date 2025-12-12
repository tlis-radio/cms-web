"use client";
import ShowLink from "@/components/pagination/show-link";
import Select from "@/components/primitives/Select";
import { Show } from "@/models/show";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import { SHOWS_PAGE_SIZE } from "@/services/cms-api-service";

type FilterProps = "active" | "archived" | "digital";

export default function ShowsPage({ shows, loadingError, totalCount, currentPage }: { shows: Show[], loadingError?: boolean, totalCount: number, currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(filter: string) {
    router.push(`/relacie?filter=${filter}`);
  }

  useEffect(()=>{
    const filter = searchParams.get('filter');
    if (!window.umami) { return; }
    window.umami.track("Filter Shows", { filter: filter })
  }, [searchParams.get('filter')])

  const totalPages = Math.ceil(totalCount / SHOWS_PAGE_SIZE);

  const createShowLinks = () => {
    return shows.map((show: any, index: number) => {
      return (
        <ShowLink
          key={index}
          show={show}
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

        <div className="font-argentumSansLight ml-auto relative min-w-[180px]">
          <Select
            options={[
              { value: "active", label: "AKTÍVNE RELÁCIE" },
              { value: "archived", label: "ARCHÍVNE RELÁCIE" },
              { value: "digital", label: "STARÝ ARCHÍV" },
            ]}
            value={searchParams.get("filter") || "active"}
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
      
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  )
}