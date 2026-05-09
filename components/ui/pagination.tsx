"use client";

import { useEffect } from "react"; // Added useEffect
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- ADDED: Auto-detect missing page tag ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Check if we are currently in a "Back" flow from a success page
    const isReturning = sessionStorage.getItem('successReturnPath');

    // Only auto-add page=1 if it's missing AND we aren't currently returning from an action
    if (!params.has("page") && !isReturning) {
      params.set("page", "1");
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    }
  }, []);
  // ------------------------------------------

// Inside your Pagination component
const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages) return;

  if (onPageChange) {
    onPageChange(page);
  } else {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    
    // CHANGE router.push TO router.replace
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }
};

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8 mb-4" aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
          currentPage === 1
            ? "text-[#94a3b8]"
            : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638] cursor-pointer"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && handlePageChange(page)}
            disabled={page === "..."}
            className={`min-w-[40px] px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
              page === currentPage
                ? "bg-[#011638] text-[#fbfaf8] font-bold  cursor-pointer"
                : page === "..."
                ? "text-[#475569]"
                : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]  cursor-pointer"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
          currentPage === totalPages
            ? "text-[#94a3b8]"
            : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638] cursor-pointer"
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}