"use client"; 

import { useState, useEffect } from "react"; 
import ThesisAbstract from './thesis_abstract';
import SpotlightCard from "@/components/ui/SpotlightCard"; 
import { useRouter } from "next/navigation"; 
import PaginationNav from "@/components/ui/pagination";
import Image from "next/image";
import ModalBlur from "@/components/ui/modalBlur";

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
  const [selectedThesis, setSelectedThesis] = useState<any | null>(null);

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
                <div
                  key={thesis.id}
                  onClick={() => setSelectedThesis(thesis)}
                  className="cursor-pointer"
                >
                  <SpotlightCard
                    className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm"
                    spotlightColor="rgba(239, 240, 242, 0.16)" 
                  >
                    {/* Card Header */}
                    <div className="bg-[#011638] px-6 py-4 min-h-[110px] flex items-center">
                      <h2 className="text-xl font-oswald font-bold text-[#fbfaf8] line-clamp-3 break-words overflow-hidden">
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
                              const isAceCards = author.mem_id;
                              
                            return (
                            <a
                              key={`${thesis.id}-${author.id || "no-id"}-${index}`}
                              href={`mailto:${displayInfo.email}`}
                              title={`Email: ${displayInfo.email}`}
                              className="
                                relative
                                overflow-hidden
                                bg-[#eec643]
                                text-[#011638]
                                px-3
                                py-1
                                rounded-full
                                text-sm
                                inline-flex
                                items-center
                                gap-2
                                font-ubuntu-mono
                                hover:bg-[#d9b237]
                                hover:shadow-md
                                transition-all
                                duration-300
                                cursor-pointer
                                group
                              "
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Shine Effect */}
                              {isAceCards && (
                                <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                                  <span
                                    className="
                                      absolute
                                      top-0
                                      left-[-150%]
                                      h-full
                                      w-8
                                      rotate-12
                                      bg-white/60
                                      blur-sm
                                      transition-all
                                      duration-700
                                      group-hover:left-[150%]
                                    "
                                  />
                                </span>
                              )}

                              {isAceCards ? (
                              <Image
                                src="/assets/logos/ACE CARDS logo.png"
                                alt="ACE CARDS"
                                width={18}
                                height={18}
                                className="relative z-10 object-contain shrink-0 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                              />
                            ) : (
                              <svg
                                className="relative z-10 w-4 h-4 group-hover:scale-110 transition-transform"
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
                            )}

                              {/* Author Name */}
                              <span className="relative z-10">
                                {displayInfo.name}
                              </span>
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
                          <ThesisAbstract abstract={thesis.thesis_abstract} />
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
                            <span className="text-[#475569] block font-ubuntu-mono">Publication Year:</span>
                            <span className="font-ubuntu-mono text-[#011638]">
                              {thesis.thesis_date}
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

                      {/* Available Copies */}
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
                              <a
                                href={thesis.thesis_digi}
                                target="_blank" // New tab
                                rel="noopener noreferrer"
                                className="text-[#0d21a1] hover:text-[#011638] underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-words max-w-full whitespace-normal"
                                onClick={(e) => e.stopPropagation()}
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
                </div>
              );
            })
          }
          </div>

          {/* Pagination */}
          <PaginationNav currentPage={currentPageLocal} totalPages={totalPages} itemsPerPage={itemsPerPage} totalItems={totalItems} onPageChange={handlePageChange} />
        </>
      )}

      {/* Modal Popup */}
      {selectedThesis && (
        <>
          <ModalBlur onClose={() => setSelectedThesis(null)} />
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-20 sm:pt-24"
            onClick={() => setSelectedThesis(null)}
          >
            <div
              className="pointer-events-auto bg-[#fbfaf8] border border-[#011638] rounded-3xl w-full max-w-3xl max-h-[70vh] 
              shadow-2xl flex flex-col animate-in fade-in 
              zoom-in-95 duration-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-50 w-full shrink-0 bg-[#011638] rounded-t-3xl">
                <button
                  onClick={() => setSelectedThesis(null)}
                  className="cursor-pointer absolute top-3 right-3 z-[60] w-8 h-8 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-sm transition-colors font-bold text-lg"
                >
                  ✕
                </button>
                
                <div className="px-6 py-5 sm:px-8 sm:py-6">
                  <h2 className="text-xl sm:text-2xl font-oswald font-bold text-[#fbfaf8] leading-tight break-words">
                    {selectedThesis.thesis_title}
                  </h2>
                </div>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar-blue">
                <div className="p-5 sm:p-6 flex flex-col gap-4 w-full">
                  {/* Authors */}
                  <div className="flex flex-col w-full pb-4 border-b border-slate-200">
                    <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-2">
                      Author(s)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getProcessedAuthors(selectedThesis).map((author: any, index: number) => {
                        const displayInfo = author.displayName;
                        const isAceCards = author.mem_id;
                        
                        return (
                          <a
                            key={`modal-${selectedThesis.id}-${author.id || "no-id"}-${index}`}
                            href={`mailto:${displayInfo.email}`}
                            title={`Email: ${displayInfo.email}`}
                            className="
                              relative
                              overflow-hidden
                              bg-[#eec643]
                              text-[#011638]
                              px-3
                              py-1
                              rounded-full
                              text-sm
                              inline-flex
                              items-center
                              gap-2
                              font-ubuntu-mono
                              hover:bg-[#d9b237]
                              hover:shadow-md
                              transition-all
                              duration-300
                              cursor-pointer
                              group
                            "
                          >
                            {isAceCards && (
                              <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                                <span
                                  className="
                                    absolute
                                    top-0
                                    left-[-150%]
                                    h-full
                                    w-8
                                    rotate-12
                                    bg-white/60
                                    blur-sm
                                    transition-all
                                    duration-700
                                    group-hover:left-[150%]
                                  "
                                />
                              </span>
                            )}

                            {isAceCards ? (
                              <Image
                                src="/assets/logos/ACE CARDS logo.png"
                                alt="ACE CARDS"
                                width={16}
                                height={16}
                                className="relative z-10 object-contain shrink-0 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                              />
                            ) : (
                              <svg
                                className="relative z-10 w-3.5 h-3.5 group-hover:scale-110 transition-transform"
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
                            )}

                            <span className="relative z-10">
                              {displayInfo.name}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Abstract */}
                  <div className="flex flex-col w-full pb-4 border-b border-slate-200">
                    <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                      Abstract
                    </p>
                    <p className="text-slate-700 font-ubuntu-mono text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {selectedThesis.thesis_abstract || "No abstract available."}
                    </p>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-col w-full pb-4 border-b border-slate-200">
                    <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-1.5">
                      Keywords
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedThesis.thesis_keyword
                        ?.split(",")
                        .map((keyword: string, index: number) => (
                          <span
                            key={index}
                            className="bg-[#1e4db7] text-[#fbfaf8] px-2 py-0.5 rounded text-xs font-ubuntu-mono break-words"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 w-full pb-4 border-b border-slate-200">
                    <div>
                      <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-0.5">
                        Publication Year
                      </p>
                      <p className="font-ubuntu-mono text-[#011638] text-sm">
                        {selectedThesis.thesis_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-0.5">
                        Research Thematic Area
                      </p>
                      <p className="font-ubuntu-mono text-[#011638] text-sm break-words">
                        {selectedThesis.r_category?.r_category_name || "Uncategorized"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-0.5">
                        School
                      </p>
                      <p className="font-ubuntu-mono text-[#011638] text-sm break-words">
                        {selectedThesis.school?.school_name || "No School"}
                      </p>
                    </div>
                  </div>

                  {/* Available Copies */}
                  <div className="flex flex-col w-full gap-2">
                    <p className="text-xs font-oswald font-bold tracking-widest uppercase text-slate-400 mb-0.5">
                      Available Copies
                    </p>
                    
                    {/* Physical Copy */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#475569] font-ubuntu-mono text-sm whitespace-nowrap">Physical Copy:</span>
                      {selectedThesis.thesis_phys ? (
                        <span className="font-ubuntu-mono text-[#011638] text-sm break-words">
                          {selectedThesis.thesis_phys}
                        </span>
                      ) : (
                        <span className="text-[#475569] opacity-50 font-ubuntu-mono text-sm">
                          Not Available
                        </span>
                      )}
                    </div>

                    {/* Digital Copy */}
                    <div className="flex items-center gap-2">
                      <span className="text-[#475569] font-ubuntu-mono text-sm whitespace-nowrap">Digital Copy:</span>
                      {selectedThesis.thesis_digi ? (
                        <a
                          href={selectedThesis.thesis_digi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0d21a1] hover:text-[#011638] underline font-ubuntu-mono text-sm break-words"
                        >
                          {selectedThesis.thesis_digi}
                        </a>
                      ) : (
                        <span className="text-[#475569] opacity-50 font-ubuntu-mono text-sm">
                          Not Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}