"use client"; 

import { useRouter, useSearchParams } from "next/navigation"; // For nav hooks

// Define types for pagination component props
interface PaginationProps {
  currentPage: number; // Current page
  totalPages: number; // Total # of pages
  onPageChange?: (page: number) => void; // callback for custom page change handling
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // On page change events
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return; // If not w/in page bounds, exit

    // Custom callback
    if (onPageChange) {
      onPageChange(page);
    } else {
      // OR update URL w/ new page parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`/thesis?${params.toString()}`);
    }
  };

  // Array to display page numbers 
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    
    // Show 1st page
    pages.push(1);
    
    // After 1st page, push Ellipsis if current page is far
    if (currentPage > 3) {
      pages.push('...');
    }
    
    // Show current page and surrounding pages
    const start = Math.max(2, currentPage - 1); // Start from 2 (avoid duplicating first page)
    const end = Math.min(totalPages - 1, currentPage + 1); // End at totalPages - 1 
    
    // Avoid duplicates
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    // Before last page, show ellipsis if current page is far
    if (currentPage < totalPages - 2) {
      pages.push('...');
    }
    
    // Show last page if more than 1 page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // If only 1 page, don't do pagination
  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center space-x-2 mt-8 mb-4" aria-label="Pagination">

      {/* LEFT button */}
      {/* Previous page button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)} // Go to previous page
        disabled={currentPage === 1} // Not used if on 1st page
        className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
          currentPage === 1
            ? "text-[#94a3b8]" // Can't click if on 1st page
            : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]" // Clickable if not on 1st page
        }`}
      >
        {/* Left chevron SVG icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7" // Left arrow SVG
          />
        </svg>
      </button>

      {/* Page numbers button like container */}
      <div className="flex items-center space-x-1">
        {/* Map through array */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index} // Index as key
            onClick={() => typeof page === "number" && handlePageChange(page)} // If page is number, handle click
            disabled={page === "..."} // If ellipsis, disable
            className={`min-w-[40px] px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
              page === currentPage
                ? "bg-[#011638] text-[#fbfaf8] font-bold" // Active page
                : page === "..."
                ? "text-[#475569]" // Ellipsis
                : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]" // Inactive page (not current page)
            }`}
          >
            {page} {/* Display number */}
          </button>
        ))}
      </div>

      {/* RIGHT button, same logic as LEFT */}
      {/* Next page button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)} // Go to next page
        disabled={currentPage === totalPages} // Not used if on last page
        className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
          currentPage === totalPages
            ? "text-[#94a3b8]" // // Can't click if on last page
            : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]" // Clickable if not on last page
        }`}
      >
        {/* Right chevron SVG icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7" // Right arrow SVG
          />
        </svg>
      </button>
    </nav>
  );
}