"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";
import AnimatedTitle from "@/components/ui/animatedTitle";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { createClient } from "@/utils/supabase/client";
import PaginationNav from "@/components/ui/pagination";
import { BsSuitSpadeFill } from "react-icons/bs";

interface DownloadItem {
  id: number;
  title: string;
  link: string;
  created_at: string;
  type?: string;
}

// Filter Popup Component
function FilterPopup({
  isOpen,
  onClose,
  buttonRef,
  onReset,
  selectedTypes,
  onTypeToggle,
  availableTypes,
}: {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement | null>;
  onReset: () => void;
  selectedTypes: string[];
  onTypeToggle: (type: string) => void;
  availableTypes: string[];
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        buttonRef.current.contains(event.target as Node)
      ) {
        return;
      }

      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  if (!isOpen) return null;

  const formatTypeDisplay = (type: string): string => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div
      ref={popupRef}
      className="absolute top-full mt-2 w-80 bg-[#fbfaf8] border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] shadow-xl p-4 z-40"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-oswald font-bold text-[#011638]">Filter Resources</h3>
        <button
          onClick={onClose}
          className="text-[#475569] hover:text-[#011638] transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="mt-8 rounded-lg overflow-hidden">
        {/* Resource Type Filter */}
        <div>
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Resource Type
          </label>
          <div className="border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] text-[#011638] bg-[#fbfaf8] w-full px-3 py-2 font-ubuntu-mono transition-colors">
            {availableTypes.length > 0 ? (
              <div className="space-y-2">
                {availableTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        id={`type-${type}`}
                        checked={selectedTypes.includes(type)}
                        onChange={() => onTypeToggle(type)}
                        className="peer appearance-none w-4 h-4 border-2 border-black rounded-sm checked:border-[#eec643] focus:ring-0 focus:outline-none bg-transparent"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[#eec643] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none text-sm">
                        ♠
                      </span>
                    </div>
                    <label
                      htmlFor={`type-${type}`}
                      className="text-sm font-ubuntu-mono text-[#475569] cursor-pointer hover:text-[#011638]"
                    >
                      {formatTypeDisplay(type)}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569] font-ubuntu-mono text-center py-2">
                No types available
              </p>
            )}
          </div>
          {selectedTypes.length > 0 && (
            <p className="text-xs text-[#475569] font-ubuntu-mono mt-1">
              {selectedTypes.length} type{selectedTypes.length > 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-[#fbfaf8] bg-[#011638] border border-[#011638] rounded-lg hover:bg-[#1e4db7] hover:border-[#1e4db7] transition-colors font-oswald"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [mounted, setMounted] = useState(false);
  const [currentPageLocal, setCurrentPageLocal] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Get items per page based on screen width
  const getItemsPerPage = () => {
    if (typeof window === 'undefined') return 10;
    const width = window.innerWidth;
    if (width < 640) return 5;
    if (width < 1024) return 7;
    return 10;
  };

  // Get unique resource types from downloads
  const getAvailableTypes = (): string[] => {
    const types = new Set<string>();
    downloads.forEach(item => {
      if (item.type) {
        types.add(item.type.toLowerCase());
      }
    });
    // Default: 'document'
    if (types.size === 0) {
      types.add('document');
    }
    return Array.from(types).sort();
  };

  // Responsiveness
  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current page from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const page = parseInt(params.get('page') || '1');
      setCurrentPageLocal(page);
    }
  }, []);

  // Total pages
  useEffect(() => {
    const total = downloads.length;
    setTotalItems(total);
    const pages = Math.ceil(total / itemsPerPage) || 1;
    setTotalPages(pages);
    
    if (currentPageLocal > pages) {
      setCurrentPageLocal(pages);
    }
  }, [downloads, itemsPerPage, currentPageLocal]);

  // Fetch data with pagination
  useEffect(() => {
    const fetchDownloads = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Total count
        const { count, error: countError } = await supabase
          .from("downloads")
          .select("*", { count: 'exact', head: true });

        if (countError) {
          console.error("Count fetch error:", countError);
          if (countError.code === '42P01') {
            setDownloads([]);
            setTotalItems(0);
            setTotalPages(0);
          } else {
            throw countError;
          }
        } else {
          setTotalItems(count || 0);
          const calculatedTotalPages = Math.ceil((count || 0) / itemsPerPage) || 1;
          setTotalPages(calculatedTotalPages);
          
          if (currentPageLocal > calculatedTotalPages && calculatedTotalPages > 0) {
            setCurrentPageLocal(calculatedTotalPages);
          }
        }

        // Calculate range for pagination
        const from = (currentPageLocal - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        // Fetch paginated data
        const { data, error: fetchError } = await supabase
          .from("downloads")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (fetchError) {
          console.error("Downloads fetch error:", fetchError);
          if (fetchError.code === '42P01') {
            setDownloads([]);
          } else {
            throw fetchError;
          }
        } else {
          setDownloads(data || []);
        }
      } catch (err) {
        console.error("Error fetching downloads:", err);
        setError("Failed to load downloads. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchDownloads();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPageLocal, itemsPerPage]);

  // Filter
  const getFilteredDownloads = () => {
    let filtered = downloads;

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => {
        const itemType = item.type?.toLowerCase() || 'document';
        return selectedTypes.includes(itemType);
      });
    }

    return filtered;
  };

  const filteredDownloads = getFilteredDownloads();

  // Toggle type selection
  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
    // Reset to first page when filters change
    setCurrentPageLocal(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setShowFilters(false);
    setCurrentPageLocal(1);
    searchInputRef.current?.focus();
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  // Page change handler
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

  // Total filters count
  const totalFilters = selectedTypes.length;

  // Pagination values
  const validCurrentPage = Math.min(Math.max(1, currentPageLocal), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Get paginated filtered results
  const getPaginatedFilteredResults = () => {
    let items = filteredDownloads;
    return items.slice(startIndex, endIndex);
  };

  const displayItems = getPaginatedFilteredResults();
  const displayTotalItems = filteredDownloads.length;
  const displayTotalPages = Math.ceil(displayTotalItems / itemsPerPage) || 1;

  // Format resource type
  const formatResourceType = (type?: string): string => {
    if (!type) return 'Type: Document';
    const formatted = type.charAt(0).toUpperCase() + type.slice(1);
    return `Type: ${formatted}`;
  };

  // Get available types for filter
  const availableTypes = getAvailableTypes();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <NavBar />
      <main className="w-full min-h-screen bg-[#fbfaf8] relative overflow-hidden">
        {/* Spade Background Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <BsSuitSpadeFill className="absolute top-[-5%] right-[-5%] rotate-12 size-40 md:size-52 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[15%] left-[-8%] -rotate-12 size-56 md:size-72 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[70%] left-[5%] rotate-[13deg] size-32 md:size-44 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[55%] right-[2%] -rotate-[6deg] size-44 md:size-56 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[45%] left-[45%] -rotate-[30deg] size-28 md:size-36 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[80%] left-[40%] rotate-[15deg] size-24 md:size-32 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[90%] left-[60%] -rotate-[10deg] size-20 md:size-28 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[20%] left-[80%] -rotate-[40deg] size-20 md:size-28 text-[#011638]/10" />
          <BsSuitSpadeFill className="absolute top-[20%] left-[20%] -rotate-[-30deg] size-20 md:size-28 text-[#011638]/10" />
        </div>

        <div className="container mx-auto pt-8 px-4 max-w-7xl relative z-10">
          <BackButton />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 xl:px-0 pt-8 pb-20 sm:pb-24">
          {/* Header */}
          <div className="text-center mb-8">
            <AnimatedTitle title="Resources" />
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Access important documents, forms, and resources from ACE CARDS.
            </p>
          </div>

          {/* Search and Filter */}
          <section className="mb-10">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative" ref={filterButtonRef}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-oswald transition-all flex items-center justify-center gap-1 ${
                      showFilters ? "bg-[#011638]" : "bg-[#011638]"
                    } text-[#eff0f2] hover:bg-[#1e4db7] active:bg-[#0d21a1]`}
                  >
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
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                    {totalFilters > 0 && (
                      <span className="bg-[#eec643] text-[#011638] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {totalFilters}
                      </span>
                    )}
                  </button>

                  <FilterPopup
                    isOpen={showFilters}
                    onClose={() => setShowFilters(false)}
                    buttonRef={filterButtonRef}
                    onReset={clearFilters}
                    selectedTypes={selectedTypes}
                    onTypeToggle={toggleType}
                    availableTypes={availableTypes}
                  />
                </div>

                <div className="flex-1 relative">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search resources..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                      value={searchQuery}
                      className="w-full px-4 py-2 pl-10 pr-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8]/90 backdrop-blur-sm text-[#475569] font-ubuntu-mono"
                    />
                    <svg
                      className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>

                    {searchQuery && (
                      <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#475569] hover:text-[#011638] transition-colors z-20"
                        aria-label="Clear search"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {totalFilters > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTypes.map(type => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#011638]/10 text-[#011638] rounded-full text-sm font-ubuntu-mono"
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    <button
                      onClick={() => toggleType(type)}
                      className="hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Downloads Grid */}
            {error ? (
              <div className="text-center py-16 border border-red-200 rounded-2xl bg-red-50/90 backdrop-blur-sm mt-8">
                <p className="text-red-600 font-bold text-xl font-ubuntu-mono">
                  {error}
                </p>
                <p className="text-slate-500 text-sm mt-2 font-ubuntu-mono">
                  Please make sure the required table exists in your database.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-[#011638] text-white rounded-xl hover:bg-[#0d21a1] transition-colors font-ubuntu-mono text-sm"
                >
                  Retry
                </button>
              </div>
            ) : downloads.length === 0 ? (
              <div className="text-center py-16 border border-[#011638]/12 rounded-2xl bg-white/90 backdrop-blur-sm mt-8">
                <p className="text-slate-700 font-medium">
                  No downloads available at the moment.
                </p>
                <p className="text-slate-500 text-sm mt-1 font-ubuntu-mono">
                  Check back later for updates.
                </p>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-12 mt-8">
                <p className="text-slate-700 font-medium text-lg">
                  No matching downloads found.
                </p>
                <p className="text-slate-500 text-sm mt-1 font-ubuntu-mono">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <div id="downloads-list" className="space-y-4 mt-8">
                  {displayItems.map((item) => {
                    const resourceType = item.type || 'document';
                    const displayType = formatResourceType(resourceType);
                    
                    return (
                      <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          group block
                          w-full
                          rounded-lg
                          border border-[#011638]
                          bg-[#fbfaf8]/90 backdrop-blur-sm
                          px-5 py-4
                          transition-all duration-300
                          hover:bg-white
                          hover:shadow-md
                          hover:border-[#1e4db7]
                          hover:scale-[1.01]
                          active:scale-[0.99]
                        "
                      >
                        <div className="flex items-center justify-between min-h-[72px] gap-5">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Document Icon */}
                            <div className="
                              flex-shrink-0
                              h-11
                              w-11
                              rounded-lg
                              border border-[#011638]
                              bg-[#011638]
                              flex items-center justify-center
                              text-[#fbfaf8]
                              group-hover:bg-[#1e4db7]
                              group-hover:text-[#fbfaf8]
                              group-hover:border-[#1e4db7]
                              transition-all duration-300
                            ">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17h4" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9h6" />
                              </svg>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1">
                                <span className="
                                  font-oswald
                                  font-semibold
                                  text-lg
                                  text-[#011638]
                                  break-words
                                ">
                                  {item.title}
                                </span>
                                <span className="
                                  inline-flex
                                  w-fit
                                  rounded-full
                                  border border-[#011638]
                                  px-2 py-0.5
                                  text-[11px]
                                  font-ubuntu-mono
                                  text-[#011638]
                                ">
                                  {displayType}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-[#64748b] font-ubuntu-mono">
                                {new Date(item.created_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* External link icon */}
                          <div className="
                            flex items-center gap-2
                            transition-all duration-300
                          ">
                            <span className="hidden sm:block text-sm font-oswald text-[#011638] group-hover:text-[#1e4db7] transition-colors">
                              Open
                            </span>
                            <svg
                              className="w-5 h-5 text-[#011638] group-hover:text-[#1e4db7] transition-colors"
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
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Pagination */}
                {mounted && (
                  <PaginationNav 
                    currentPage={validCurrentPage} 
                    totalPages={displayTotalPages} 
                    itemsPerPage={itemsPerPage} 
                    totalItems={displayTotalItems} 
                    onPageChange={handlePageChange} 
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}