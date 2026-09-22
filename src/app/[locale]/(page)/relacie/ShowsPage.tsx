"use client";
import ShowLink from "@/components/pagination/show-link";
import Select from "@/components/primitives/Select";
import { Show } from "@/models/show";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/pagination/Pagination";
import { SHOWS_PAGE_SIZE } from "@/services/cms-api-service";
import { useTranslations } from "next-intl";
import { UmamiTrack } from "@/components/Analytics";

type FilterProps = "active" | "archived" | "digital";

// Pridaný 'locale' do interfaceu Props, aby sa vyriešila chyba TS2322
interface ShowsPageProps {
  shows: Show[];
  loadingError?: boolean;
  totalCount: number;
  currentPage: number;
  locale: string; 
  query: string;
}

const SEARCH_DEBOUNCE_MS = 350;

export default function ShowsPage({ 
  shows, 
  loadingError, 
  totalCount, 
  currentPage, 
  locale,
  query
}: ShowsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("ShowsPage"); // Použitie namespace z en.json

  function setFilter(filter: string) {
    // Navigácia zachováva aktuálny jazyk v URL
    router.push(`/${locale}/relacie?filter=${filter}`);
  }

  const [search, setSearch] = useState(query);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Synchronizácia pri navigácii späť/vpred — nie počas písania (medzera na konci by zmizla)
  useEffect(() => {
    setSearch((current) => (current.trim() === query ? current : query));
  }, [query]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function applySearch(value: string) {
    clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (trimmed === query) return;

    // Vyhľadávanie ide naprieč všetkými reláciami, filter ani stránku nezachovávame
    const url = trimmed
      ? `/${locale}/relacie?q=${encodeURIComponent(trimmed)}`
      : `/${locale}/relacie`;
    startTransition(() => router.replace(url, { scroll: false }));
    if (trimmed) UmamiTrack("Search Shows", { query: trimmed });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => applySearch(value), SEARCH_DEBOUNCE_MS);
  }

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault();
    applySearch(search);
  }

  function clearSearch() {
    setSearch("");
    applySearch("");
  }

  useEffect(() => {
    const filter = searchParams.get('filter');
    UmamiTrack("Filter Shows", { filter: filter });
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
          <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span>{' '}
          {t('heading')} {/* Dynamický preklad nadpisu 'shows' */}
        </h1>

        <div className="font-argentumSansLight ml-auto flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <form
            role="search"
            action={`/${locale}/relacie`}
            method="get"
            onSubmit={onSearchSubmit}
            className="relative flex-1 sm:flex-none sm:w-[280px] min-w-[180px]"
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              name="q"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape" && search) { e.preventDefault(); clearSearch(); } }}
              placeholder={t('search_placeholder')}
              aria-label={t('search_label')}
              maxLength={100}
              autoComplete="off"
              enterKeyHint="search"
              className="w-full pl-9 pr-9 py-2 rounded border border-white/30 bg-[#18181b] text-white placeholder-gray-400 outline-none transition-colors duration-150 hover:border-[#d43c4a] focus:ring-2 focus:ring-[#d43c4a] focus:border-transparent [&::-webkit-search-cancel-button]:appearance-none"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={t('search_clear')}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-[#d43c4a] transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="relative min-w-[180px]">
          <Select
            options={[
              { value: "active", label: t('filter_active') }, // Preklad 'ACTIVE SHOWS'
              { value: "archived", label: t('filter_archived') }, // Preklad 'ARCHIVED SHOWS'
              { value: "digital", label: t('filter_digital') }, // Preklad 'OLD ARCHIVE'
            ]}
            value={query ? null : searchParams.get("filter") || "active"}
            placeholder={t('filter_all')}
            onChange={(val) => setFilter(val as FilterProps)}
            className="bg-transparent text-white min-w-[180px]"
          />
          </div>
        </div>
      </div>

      {query && !loadingError && (
        <div className="px-8 mb-4 font-argentumSansLight text-gray-300" aria-live="polite">
          {totalCount > 0 ? (
            <p>{t('search_results', { query, count: totalCount })}</p>
          ) : (
            <div className="bg-[#1c1c1c] p-6 text-white">
              <h2 className="font-argentumSansMedium text-xl mb-2">{t('search_no_results', { query })}</h2>
              <p className="text-gray-300">{t('search_no_results_hint')}</p>
            </div>
          )}
        </div>
      )}

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

      <div className={`px-8 transition-opacity duration-150 ${isPending ? "opacity-50" : ""}`}>
        {createShowLinks()}
      </div>
      
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}