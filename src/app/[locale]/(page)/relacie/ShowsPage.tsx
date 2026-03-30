"use client";
import ShowLink from "@/components/pagination/show-link";
import Select from "@/components/primitives/Select";
import { Show } from "@/models/show";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Pagination from "@/components/pagination/Pagination";
import { SHOWS_PAGE_SIZE } from "@/services/cms-api-service";
import { useTranslations } from "next-intl";

type FilterProps = "active" | "archived" | "digital";

// Pridaný 'locale' do interfaceu Props, aby sa vyriešila chyba TS2322
interface ShowsPageProps {
  shows: Show[];
  loadingError?: boolean;
  totalCount: number;
  currentPage: number;
  locale: string; 
}

export default function ShowsPage({ 
  shows, 
  loadingError, 
  totalCount, 
  currentPage, 
  locale 
}: ShowsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("ShowsPage"); // Použitie namespace z en.json

  function setFilter(filter: string) {
    // Navigácia zachováva aktuálny jazyk v URL
    router.push(`/${locale}/relacie?filter=${filter}`);
  }

  useEffect(() => {
    const filter = searchParams.get('filter');
    if (!(window as any).umami) { return; }
    (window as any).umami.track("Filter Shows", { filter: filter });
  }, [searchParams.get('filter')]);

  const totalPages = Math.ceil(totalCount / SHOWS_PAGE_SIZE);

  const createShowLinks = () => {
    return shows.map((show: any, index: number) => {
      return (
        <ShowLink
          key={index}
          show={show}
        />
      );
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between mb-8 px-8">
        <h1 className="text-4xl text-white font-semibold">
          <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> 
          {t('heading')} {/* Dynamický preklad nadpisu 'shows' */}
        </h1>

        <div className="font-argentumSansLight ml-auto relative min-w-[180px]">
          <Select
            options={[
              { value: "active", label: t('filter_active') }, // Preklad 'ACTIVE SHOWS'
              { value: "archived", label: t('filter_archived') }, // Preklad 'ARCHIVED SHOWS'
              { value: "digital", label: t('filter_digital') }, // Preklad 'OLD ARCHIVE'
            ]}
            value={searchParams.get("filter") || "active"}
            onChange={(val) => setFilter(val as FilterProps)}
            className="bg-transparent text-white min-w-[180px]"
          />
        </div>
      </div>

      {loadingError && (
        <div className="relative py-8 px-8">
          <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
            {t('fetch_error_title')} {/* 'Error loading archive' */}
          </h3>
          <p className="text-gray-200 mb-4">
            {t('fetch_error_subtitle')} {/* 'Please try again later.' */}
          </p>
        </div>
      )}

      <div className="px-8">
        {createShowLinks()}
      </div>
      
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}