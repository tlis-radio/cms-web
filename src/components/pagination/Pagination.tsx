"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    const url = baseUrl || pathname;
    return queryString ? `${url}?${queryString}` : url;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-2 my-8 font-argentumSansMedium">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center justify-center w-10 h-10 rounded bg-[#1c1c1c] text-white hover:bg-[#d43c4a] transition-colors border border-gray-700"
          aria-label="Previous page"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
        </Link>
      ) : (
        <div className="flex items-center justify-center w-10 h-10 rounded bg-[#0a0a0a] text-gray-600 border border-gray-800 cursor-not-allowed">
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
        </div>
      )}

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-white">
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <Link
            key={pageNum}
            href={createPageUrl(pageNum)}
            className={`flex items-center justify-center w-10 h-10 rounded border transition-colors ${
              isActive
                ? "bg-[#d43c4a] text-white border-[#d43c4a] font-bold"
                : "bg-[#1c1c1c] text-white hover:bg-[#d43c4a] border-gray-700"
            }`}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? "page" : undefined}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center justify-center w-10 h-10 rounded bg-[#1c1c1c] text-white hover:bg-[#d43c4a] transition-colors border border-gray-700"
          aria-label="Next page"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
        </Link>
      ) : (
        <div className="flex items-center justify-center w-10 h-10 rounded bg-[#0a0a0a] text-gray-600 border border-gray-800 cursor-not-allowed">
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
