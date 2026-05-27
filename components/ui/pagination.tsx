"use client";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  totalItems: number; // New prop
  itemsPerPage: number; // New prop
  onPageChange: (page: number) => void;
}

export default function PaginationNav({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PaginationNavProps) {
  if (totalPages <= 0 && totalItems <= itemsPerPage) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const renderPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3 , 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2 , totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    return pages.map((page, idx) =>
      page === "..." ? (
        <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 font-ubuntu-mono">...</span>
      ) : (
        <button
          key={page}
          onClick={() => onPageChange(page as number)}
          className={`sm:min-w-[40px] min-w-[30px] px-1 sm:px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
            page === currentPage
              ? "bg-[#011638] text-[#fbfaf8] font-bold cursor-pointer"
              : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638] cursor-pointer"
          }`}
        >
          {page}
        </button>
      )
    );
  };

  return (
    <div className="mt-8 mb-4 w-full">
      {/* Results Info Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:gap-2 pt-4">
        <p className="text-[#475569] font-ubuntu-mono text-sm">
          Showing {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} items
        </p>
        <p className="text-[#475569] font-ubuntu-mono text-sm">
          Page {currentPage} of {totalPages || 1}
        </p>
      </div>

      {/* Navigation Buttons */}
      <nav className="flex justify-center items-center sm:space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
            currentPage === 1 ? "text-[#94a3b8] cursor-not-allowed" : "text-[#011638] hover:bg-[#eec643] cursor-pointer"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center sm:space-x-1">{renderPages()}</div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
            currentPage === totalPages ? "text-[#94a3b8] cursor-not-allowed" : "text-[#011638] hover:bg-[#eec643] cursor-pointer"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}