"use client"; 

import { useState, useEffect } from "react"; 
import ThesisAbstract from './thesis_abstract';
import SpotlightCard from "@/components/ui/SpotlightCard"; 
import { useRouter } from "next/navigation"; 
import PaginationNav from "@/components/ui/pagination";

// Define types for ClientPagination props
interface ClientPaginationProps {
  allTheses: any[]; 
  currentPage: number; 
}

// Not my logic
// Get items per page based on screen width
const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 6; // Default: 6 items per page
  
  const width = window.innerWidth; // Get window width
  if (width < 640) return 2;  // Mobile: 2 items per page
  if (width < 1024) return 4; // Tablet: 4 items per page
  return 6;                    // Desktop: 6 items per page
};

// Main export
export default function ClientPagination({ allTheses, currentPage }: ClientPaginationProps) {
  const router = useRouter(); 
  const [itemsPerPage, setItemsPerPage] = useState(6); 
  const [mounted, setMounted] = useState(false);

  // Local state
  const [currentPageLocal, setCurrentPageLocal] = useState(currentPage);

  // Handle responsive items per page
  useEffect(() => {
    setMounted(true); // Component mounted on client
    
    // Window resize
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage()); // Update items based on width
    };
    
    handleResize();
    
    // Resize event listener
    window.addEventListener('resize', handleResize);

    // Remove event listener when unmounted
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Onlu run once on mount

    // Sync local page with prop when URL changes
  useEffect(() => {
    setCurrentPageLocal(currentPage);
  }, [currentPage]);

  // Pagination values
  const totalItems = allTheses.length; 
  const totalPages = Math.ceil(totalItems / itemsPerPage); 
  const validCurrentPage = Math.min(Math.max(1, currentPageLocal), totalPages || 1); // Page within bounds
  
  // Slice indices for page
  const startIndex = (validCurrentPage - 1) * itemsPerPage; 
  const endIndex = startIndex + itemsPerPage; 
  const paginatedTheses = allTheses.slice(startIndex, endIndex); 

  // Page change
  const handlePageChange = (page: number) => {
     if (page < 1 || page > totalPages) return;
    setCurrentPageLocal(page);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    
    const scrollPosition = window.scrollY;
    router.replace(`?${params.toString()}`, { scroll: false });
    
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  // Get author display name from member or author table
  const getAuthorDisplayName = (author: any) => {
    const middleInitial = author.author_minit ? ` ${author.author_minit}.` : "";
    return {
      name: `${author.author_fname}${middleInitial} ${author.author_lname}`,
      email: author.author_email
    };
  };

  const getProcessedAuthors = (thesis: any) => {
    if (!thesis.thesis_author || thesis.thesis_author.length === 0) {
      return [];
    }

    const authorsWithData = thesis.thesis_author.map((sa: any) => {
      const author = sa.author;
      if (!author) return null;
      
      return {
        ...author,
        displayName: getAuthorDisplayName(author)
      };
    }).filter((a: any) => a !== null);

    // Sort alphabetically by last name
    authorsWithData.sort((a: any, b: any) => {
      return a.author_lname.localeCompare(b.author_lname);
    });

    return authorsWithData;
  };

  return (
    <>
      {(!paginatedTheses || paginatedTheses.length === 0) ? (
        <div className="text-center w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
          No theses found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {paginatedTheses.map((thesis: any) => {
              const processedAuthors = getProcessedAuthors(thesis);

              return (
              <SpotlightCard
                key={thesis.id} 
                className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm"
                spotlightColor="rgba(239, 240, 242, 0.16)" 
              >
                {/* Card Header */}
                <div className="bg-[#011638] px-6 py-4 min-h-[110px] flex items-center">
                <h2 className="text-xl font-oswald font-bold text-[#fbfaf8] line-clamp-3 break-words overflow-hidden"> {/* 3 lines */}
                  {thesis.thesis_title} 
                </h2>
              </div>

                {/* Content */}
                <div className="px-6 py-4 flex flex-col flex-1">
                  
                  {/* Authors */}
                  <div className="mb-4 min-h-[60px]">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Author(s) 
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {processedAuthors.length > 0 ? (
                        processedAuthors.map((author: any, index: number) => {
                          const displayInfo = author.displayName;
                          
                        return (
                          <a
                            key={`${thesis.id}-${author.id || 'no-id'}-${index}`}
                            href={`mailto:${displayInfo.email}`}
                            className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-ubuntu-mono hover:bg-[#d9b237] hover:shadow-md transition-all duration-200 cursor-pointer group"
                            title={`Email: ${displayInfo.email}`}
                            >
                              {/* Person icon SVG */}
                              <svg
                                className="w-4 h-4 group-hover:scale-110 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              {displayInfo.name}
                            </a>
                          );
                        })
                      ) : (
                        // No authors
                        <span className="text-[#475569] opacity-50 text-sm">
                          No authors listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Abstract */}
                  <div className="mb-4 flex-1">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Abstract 
                    </h3>
                    <div>
                      <ThesisAbstract abstract={thesis.thesis_abstract} /> {/* For collapse and expand logic */}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4 min-h-[70px]">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {thesis.thesis_keyword
                        ?.split(",") 
                        .map((keyword: string, index: number) => (
                          <span
                            key={index} 
                            // Blue pill
                            className="bg-[#1e4db7] text-[#fbfaf8] px-2 py-1 rounded text-xs font-ubuntu-mono break-words max-w-full whitespace-normal"
                          >
                            {keyword.trim()} 
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mb-4">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Details 
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      
                      {/* Thesis Date */}
                      <div>
                        <span className="text-[#475569] block font-ubuntu-mono">Publication Date:</span>
                        <span className="font-ubuntu-mono text-[#011638]">
                          {new Date(thesis.thesis_date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )} 
                        </span>
                      </div>

                      {/* Research Thematic Area */}
                      <div>
                        <span className="text-[#475569] block font-ubuntu-mono">Research Thematic Area:</span>
                        <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal">
                          {thesis.r_category?.r_category_name || "Uncategorized"} 
                        </span>
                      </div>

                      {/* School */}
                      <div>
                        <span className="text-[#475569] block font-ubuntu-mono">School:</span>
                        <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal">
                          {thesis.school?.school_name || "No School"} 
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Available Copies section */}
                  <div className="mt-auto"> 
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Available Copies 
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      
                      {/* Physical Copy */}
                      <div>
                        <span className="text-[#475569] block font-ubuntu-mono">Physical Copy:</span>
                        {thesis.thesis_phys ? (
                          <div className="text-[#475569] font-ubuntu-mono">
                            <span className="text-[#011638] break-words max-w-full whitespace-normal">
                              {thesis.thesis_phys}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#475569] opacity-50 font-ubuntu-mono">
                            Not Available
                          </span>
                        )}
                      </div>

                      {/* Digital Copy */}
                      <div>
                        <span className="text-[#475569] block font-ubuntu-mono">Digital Copy:</span>
                        {thesis.thesis_digi ? (
                          // Link to dig copy
                          <a
                            href={thesis.thesis_digi}
                            target="_blank" // New tab
                            rel="noopener noreferrer"
                            className="text-[#0d21a1] hover:text-[#011638] underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-words max-w-full whitespace-normal"
                          >
                            View Digital Copy
                            {/* External link icon SVG */}
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-[#475569] opacity-50 font-ubuntu-mono">
                            Not Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
              );
            })
          }
          </div>

          {/* Pagination */}
            <PaginationNav currentPage={currentPageLocal} totalPages={totalPages} itemsPerPage={itemsPerPage} totalItems={totalItems} onPageChange={handlePageChange} />
        </>
      )}
    </>
  );
}