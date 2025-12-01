"use client";
import ShowLink from "@/components/pagination/show-link";
import Select from "@/components/primitives/Select";
import { Show } from "@/models/show";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loadMoreShows } from "../actions";

type FilterProps = "active" | "archived" | "digital";

export default function ShowsPage({ shows, loadingError, totalCount }: { shows: Show[], loadingError?: boolean, totalCount: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showsList, setShowsList] = useState(shows);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreShows, setHasMoreShows] = useState(totalCount > shows.length);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

  function setFilter(filter: string) {
    router.push(`/relacie?filter=${filter}`);
  }

  useEffect(()=>{
    const filter = searchParams.get('filter');
    if (!window.umami) { return; }
    window.umami.track("Filter Shows", { filter: filter })
  }, [searchParams.get('filter')])

  async function loadShows() {
    if (isLoading) return;
    setIsLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    const { shows: newShows, totalCount: newTotalCount } = await loadMoreShows(nextPage, searchParams.get("filter") || "active");
    setShowsList((prevShows) => [...prevShows, ...newShows]);
    setHasMoreShows(newTotalCount > showsList.length + newShows.length);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!hasMoreShows) return;
    const loader = loaderRef.current;
    if (!loader) return;
    let ticking = false;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMoreShows && !ticking) {
          ticking = true;
          loadShows().finally(() => { ticking = false; });
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(loader);
    return () => {
      observer.disconnect();
    };
  }, [loaderRef, isLoading, hasMoreShows]);

  useEffect(()=>{
    setPage(1);
    setShowsList(shows);
    setHasMoreShows(totalCount > shows.length);
  }, [shows])

  const createShowLinks = () => {
    return showsList.map((show: any, index: number) => {
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
      {hasMoreShows && (
        <div className="text-center text-white mt-4" ref={loaderRef}>
          <svg className="mx-auto h-8 w-8 animate-spin text-[#D43C4A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      )}
    </>
  )
}