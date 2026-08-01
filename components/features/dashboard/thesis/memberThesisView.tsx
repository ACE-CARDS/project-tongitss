"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import SpotlightCard from "@/components/ui/SpotlightCard";
import PaginationNav from "@/components/ui/pagination";
import MemberFeatureBanner from "@/components/ui/memberFeatureBanner";
import ThesisAbstract from '@/app/thesis/thesis_abstract';
import Image from "next/image";

// Helper function for responsive items per page
const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 6;
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

// Filter Popup Component
function FilterPopup({
  isOpen, 
  onClose,
  categories,
  schools,
  years,
  selectedCategory,
  selectedSchool,
  selectedYears,
  selectedStatuses,
  onCategoryChange,
  onSchoolChange,
  onYearToggle,
  onStatusToggle,
  onReset,
  buttonRef
}: { 
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  schools: School[];
  years: number[];
  selectedCategory: string;
  selectedSchool: string;
  selectedYears: number[];
  selectedStatuses: string[];
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSchoolChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onYearToggle: (year: number) => void;
  onStatusToggle: (status: string) => void;
  onReset: () => void;
  buttonRef: React.RefObject<HTMLDivElement | null>;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const statuses = [
    {
      value: "accepted",
      label: "ACCEPTED",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "pending",
      label: "PENDING",
      color: "bg-yellow-100 text-yellow-800",
    },
    { value: "rejected", label: "REJECTED", color: "bg-red-100 text-red-800" },
    {
      value: "archived",
      label: "ARCHIVED",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="absolute top-full mt-2 w-80 bg-[#fbfaf8] border border-[#1e4db7] rounded-lg shadow-xl p-4 z-40"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-oswald font-bold text-[#011638]">Filter Theses</h3>
        <button
          onClick={onClose}
          className="text-[#475569] hover:text-[#011638] transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Status
          </label>
          <div className="grid grid-cols-2 gap-1">
            {statuses.map((status) => (
              <label
                key={status.value}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status.value)}
                    onChange={() => onStatusToggle(status.value)}
                    className="peer appearance-none w-4 h-4 border-2 border-black rounded-sm checked:border-[#eec643] focus:ring-0 focus:outline-none bg-transparent"
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[#eec643] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none text-sm">
                    ♠
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${status.color}`}
                >
                  {status.label}
                </span>
              </label>
            ))}
          </div>
          {selectedStatuses.length > 0 && (
            <p className="text-xs text-[#475569] font-ubuntu-mono mt-1">
              {selectedStatuses.length} status
              {selectedStatuses.length > 1 ? "es" : ""} selected
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-oswald font-medium text-[#011638] mb-2"
          >
            Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={onCategoryChange}
            className="border border-[#1e4db7] rounded-lg focus:outline-none focus:ring-[#011638] text-[#475569] bg-[#fbfaf8] w-full px-3 py-2 font-ubuntu-mono hover:border-[#0d21a1] transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.r_category_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="school"
            className="block text-sm font-oswald font-medium text-[#011638] mb-2"
          >
            University
          </label>
          <select
            id="school"
            value={selectedSchool}
            onChange={onSchoolChange}
            className="border border-[#1e4db7] rounded-lg focus:outline-none focus:ring-[#011638] text-[#475569] bg-[#fbfaf8] w-full px-3 py-2 font-ubuntu-mono hover:border-[#0d21a1] transition-colors"
          >
            <option value="">All Universities</option>
            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.school_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Publication Years
          </label>
          <div className="border border-[#1e4db7] rounded-lg p-3 max-h-48 overflow-y-auto">
            {years.length > 0 ? (
              <div className="space-y-2">
                {years.map((year) => (
                  <div key={year} className="flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        id={`year-${year}`}
                        checked={selectedYears.includes(year)}
                        onChange={() => onYearToggle(year)}
                        className="peer appearance-none w-4 h-4 border-2 border-black rounded-sm checked:border-[#eec643] focus:ring-0 focus:outline-none bg-transparent"
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[#eec643] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none text-sm">
                        ♠
                      </span>
                    </div>
                    <label 
                      htmlFor={`year-${year}`}
                      className="text-sm font-ubuntu-mono text-[#475569] cursor-pointer hover:text-[#011638]"
                    >
                      {year}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#475569] font-ubuntu-mono text-center py-2">
                No years available
              </p>
            )}
          </div>
          {selectedYears.length > 0 && (
            <p className="text-xs text-[#475569] font-ubuntu-mono mt-1">
              {selectedYears.length} year{selectedYears.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#0d21a1] hover:border-[#0d21a1] transition-colors font-oswald"
          >
            Reset Filter
          </button>
        </div>
      </div>
    </div>
  );
}

interface Category {
  id: string;
  r_category_name: string;
}

interface School {
  id: string;
  school_name: string;
}

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

// Sort function
const sortTheses = (thesesArray: any[]) => {
  const statusOrder: Record<string, number> = {
    'pending': 0,
    'accepted': 1,
    'archived': 2,
    'rejected': 3
  };
  
  return [...thesesArray].sort((a, b) => {
    const statusA = a.thesis_status?.toLowerCase() || '';
    const statusB = b.thesis_status?.toLowerCase() || '';
    
    const orderA = statusOrder[statusA] ?? 4;
    const orderB = statusOrder[statusB] ?? 4;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Same status, sort by thesis_date (most recent first)
    const dateA = new Date(a.thesis_date).getTime();
    const dateB = new Date(b.thesis_date).getTime();
    return dateB - dateA;
  });
};

// Card Component for Thesis
function ThesisCard({ thesis }: { thesis: any }) {
  const processedAuthors = getProcessedAuthors(thesis);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPingColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
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
        
        {/* STATUS Section */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            STATUS
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(thesis.thesis_status)} inline-flex items-center gap-2 shadow-sm`}>
            <span className="relative flex size-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingColor(thesis.thesis_status)} opacity-75`}></span>
              <span className={`relative inline-flex size-2 rounded-full ${getPingColor(thesis.thesis_status)}`}></span>
            </span>
            {thesis.thesis_status?.toUpperCase()}
          </div>
        </div>

        {/* REJECTION REASON Section */}
        {thesis.thesis_status === 'rejected' && thesis.rejection_reason && (
          <div className="mb-4">
            <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
              REJECTION REASON
            </h3>
            <p className="text-red-600 font-ubuntu-mono text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {thesis.rejection_reason}
            </p>
          </div>
        )}

        {/* Authors */}
        <div className="mb-4 min-h-[60px]">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            Author(s)
          </h3>
          <div className="flex flex-wrap gap-2">
            {processedAuthors.length > 0 ? (
              processedAuthors.map((author: any, index: number) => {
                const displayInfo = author.displayName;
                const isAceCards = !!author.mem_id;
                
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

                    <span className="relative z-10">
                      {displayInfo.name}
                    </span>
                  </a>
                );
              })
            ) : (
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
            
            <div>
              <span className="text-[#475569] block font-ubuntu-mono">Publication Date:</span>
              <span className="font-ubuntu-mono text-[#011638]">
                {new Date(thesis.thesis_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div>
              <span className="text-[#475569] block font-ubuntu-mono">Research Thematic Area:</span>
              <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal">
                {thesis.r_category?.r_category_name || "Uncategorized"}
              </span>
            </div>

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

            <div>
              <span className="text-[#475569] block font-ubuntu-mono">Digital Copy:</span>
              {thesis.thesis_digi ? (
                <a
                  href={thesis.thesis_digi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0d21a1] hover:text-[#011638] underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-words max-w-full whitespace-normal"
                >
                  View Digital Copy
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
}

export default function MemberThesisView() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const [theses, setTheses] = useState<any[]>([]);
  const [filteredTheses, setFilteredTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  
  // KPI counts
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  
  // Data for filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Handle responsive items per page
  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      const { data: categoriesData } = await supabase
        .from("r_category")
        .select("id, r_category_name")
        .order("r_category_name");
      
      if (categoriesData) setCategories(categoriesData);

      const { data: schoolsData } = await supabase
        .from("school")
        .select("id, school_name")
        .order("school_name");
      
      if (schoolsData) setSchools(schoolsData);

      const { data: yearsData } = await supabase
        .from("thesis")
        .select("thesis_date")
        .not("thesis_date", "is", null);
      
      if (yearsData) {
        const years = [...new Set(yearsData.map(t => new Date(t.thesis_date).getFullYear()))];
        years.sort((a, b) => b - a);
        setAvailableYears(years);
      }
    };

    fetchFilterData();
  }, [supabase]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setIsAuthenticated(!!authUser);
    };
    checkAuth();
  }, [supabase]);

  useEffect(() => {
    if (user?.email) {
      fetchUserTheses();
    }
  }, [user]);

  // Calculate KPI counts
  const calculateCounts = useCallback((dataArray: any[]) => {
    setPendingCount(dataArray.filter((t: any) => t.thesis_status === "pending").length);
    setAcceptedCount(dataArray.filter((t: any) => t.thesis_status === "accepted").length);
    setRejectedCount(dataArray.filter((t: any) => t.thesis_status === "rejected").length);
    setArchivedCount(dataArray.filter((t: any) => t.thesis_status === "archived").length);
  }, []);

  // Status card click
  const handleStatusCardClick = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const isStatusActive = (status: string) => {
    return selectedStatuses.includes(status);
  };

  // Apply all filters with AND logic
  const applyFilters = useCallback(() => {
    if (!theses.length) return;

    let filtered = [...theses];
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(thesis =>
        thesis.thesis_title?.toLowerCase().includes(query) ||
        thesis.thesis_abstract?.toLowerCase().includes(query) ||
        thesis.thesis_keyword?.toLowerCase().includes(query) ||
        thesis.r_category?.r_category_name?.toLowerCase().includes(query) ||
        thesis.school?.school_name?.toLowerCase().includes(query) ||
        thesis.thesis_phys?.toLowerCase().includes(query) 
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      const categoryNum = Number(selectedCategory);
      filtered = filtered.filter(thesis => {
        const thesisCategoryId = thesis.r_category?.id ? Number(thesis.r_category.id) : null;
        return thesisCategoryId === categoryNum;
      });
    }
    
    // Apply school filter
    if (selectedSchool) {
      const schoolNum = Number(selectedSchool);
      filtered = filtered.filter(thesis => {
        const thesisSchoolId = thesis.school?.id ? Number(thesis.school.id) : null;
        return thesisSchoolId === schoolNum;
      });
    }
    
    // Apply year filter
    if (selectedYears.length > 0) {
      filtered = filtered.filter(thesis => {
        const thesisYear = new Date(thesis.thesis_date).getFullYear();
        return selectedYears.includes(thesisYear);
      });
    }

    // Apply status filter from card click
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(thesis => 
        selectedStatuses.includes(thesis.thesis_status)
      );
    }
    
    // Sort the filtered results
    const sortedFiltered = sortTheses(filtered);
    setFilteredTheses(sortedFiltered);
    
    // Calculate KPI counts on the filtered data
    calculateCounts(sortedFiltered);
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedSchool,
    selectedYears,
    selectedStatuses,
    theses,
    calculateCounts,
  ]);

  // Apply filters whenever any filter state changes
  useEffect(() => {
    if (initialLoad) return;
    applyFilters();
  }, [
    searchQuery,
    selectedCategory,
    selectedSchool,
    selectedYears,
    selectedStatuses,
    applyFilters,
    initialLoad,
  ]);

  const fetchUserTheses = async () => {
    try {
      const { data: author, error: authorError } = await supabase
        .from("author")
        .select("id")
        .eq("author_email", user?.email)
        .single();

      if (authorError) {
        setLoading(false);
        setInitialLoad(false);
        return;
      }

      if (author) {      
        const { data: thesisLinks, error: thesisError } = await supabase
          .from("thesis_author")
          .select(`
            thesis:thesis(
              *,
              r_category:r_category(*),
              school:school(*),
              thesis_author:thesis_author(
                author:author(*)
              )
            )
          `)
          .eq("author", author.id);

        if (thesisError) {
          console.error("Error fetching thesis links:", thesisError);
          throw thesisError;
        }
        
        if (thesisLinks && thesisLinks.length > 0) {
          const fetchedTheses = thesisLinks.map(link => link.thesis);
          // Sort immediately during fetch
          const sortedTheses = sortTheses(fetchedTheses);
          setTheses(sortedTheses);
          setFilteredTheses(sortedTheses);
          calculateCounts(sortedTheses);
        } else {
          setTheses([]);
          setFilteredTheses([]);
          calculateCounts([]);
        }
      } 
    } catch (error) {
      console.error("Error fetching theses:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const totalItems = filteredTheses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTheses = filteredTheses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    
    const scrollPosition = window.scrollY;
    router.replace(`?${params.toString()}`, { scroll: false });
    
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSchool(e.target.value);
  };

  const handleYearToggle = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year].sort((a, b) => b - a)
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSchool("");
    setSelectedYears([]);
    setSelectedStatuses([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedSchool ? 1 : 0) + selectedYears.length + selectedStatuses.length;

  if (loading) {
    return (
    <div className="space-y-6 min-h-screen">
      <div>
        <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Theses</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
          View and manage your submitted theses
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <button
              disabled
              className="w-full sm:w-auto px-4 py-2 rounded-lg font-oswald transition-all flex items-center justify-center gap-1 bg-[#011638] text-[#eff0f2] opacity-70 cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                disabled
                className="w-full px-4 py-2 pl-10 pr-10 border border-[#011638] rounded-lg bg-[#fbfaf8] text-[#475569] font-ubuntu-mono opacity-70 cursor-not-allowed"
              />
              <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <button
            disabled
            className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap opacity-70 cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Thesis
          </button>
        </div>
      </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 min-h-screen">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Theses</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted theses
          </p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {/* Pending Card */}
          <div
            onClick={() => handleStatusCardClick("pending")}
            className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
              isStatusActive("pending") ? "ring-3 ring-[#eec643]" : ""
            }`}
          >
            <div className="relative z-10">
              <p className="text-xs font-ubuntu-mono text-[#475569] uppercase tracking-wider font-semibold">Pending</p>
              <p className="text-2xl font-oswald font-bold text-[#011638]">{pendingCount}</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20 text-yellow-500 pointer-events-none">
              <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Accepted Card */}
          <div
            onClick={() => handleStatusCardClick("accepted")}
            className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
              isStatusActive("accepted") ? "ring-3 ring-[#eec643]" : ""
            }`}
          >
            <div className="relative z-10">
              <p className="text-xs font-ubuntu-mono text-[#475569] uppercase tracking-wider font-semibold">Accepted</p>
              <p className="text-2xl font-oswald font-bold text-[#011638]">{acceptedCount}</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20 text-green-500 pointer-events-none">
              <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Rejected Card */}
          <div
            onClick={() => handleStatusCardClick("rejected")}
            className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
              isStatusActive("rejected") ? "ring-3 ring-[#eec643]" : ""
            }`}
          >
            <div className="relative z-10">
              <p className="text-xs font-ubuntu-mono text-[#475569] uppercase tracking-wider font-semibold">Rejected</p>
              <p className="text-2xl font-oswald font-bold text-[#011638]">{rejectedCount}</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20 text-red-500 pointer-events-none">
              <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Archived Card */}
          <div
            onClick={() => handleStatusCardClick("archived")}
            className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] cursor-pointer relative overflow-hidden ${
              isStatusActive("archived") ? "ring-3 ring-[#eec643]" : ""
            }`}
          >
            <div className="relative z-10">
              <p className="text-xs font-ubuntu-mono text-[#475569] uppercase tracking-wider font-semibold">Archived</p>
              <p className="text-2xl font-oswald font-bold text-[#011638]">{archivedCount}</p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-20 text-gray-500 pointer-events-none">
              <svg className="w-28 h-28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <MemberFeatureBanner feature="Thesis submission is available exclusively to ACE CARDS members." />
        )}

        <div className="flex flex-col gap-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative" ref={filterButtonRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg font-oswald transition-all flex items-center justify-center gap-1 bg-[#011638] text-[#eff0f2] hover:bg-[#1e4db7] active:bg-[#0d21a1]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-[#eec643] text-[#011638] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <FilterPopup
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                buttonRef={filterButtonRef}
                categories={categories}
                schools={schools}
                years={availableYears}
                selectedCategory={selectedCategory}
                selectedSchool={selectedSchool}
                selectedYears={selectedYears}
                selectedStatuses={selectedStatuses}
                onCategoryChange={handleCategoryChange}
                onSchoolChange={handleSchoolChange}
                onYearToggle={handleYearToggle}
                onStatusToggle={handleStatusToggle}
                onReset={resetFilters}
              />
            </div>

            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  className="w-full px-4 py-2 pl-10 pr-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
                />
                <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#475569] hover:text-[#011638] transition-colors z-20"
                    aria-label="Clear search"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <Link
                href="/thesis/add?returnTo=/dashboard?tab=thesis"
                className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Thesis
              </Link>
            )}
          </div>
        </div>

        {!mounted ? (
          <div className="text-center text-[#475569] py-8 font-ubuntu-mono">
            Loading...
          </div>
        ) : paginatedTheses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#475569] font-ubuntu-mono">
              {searchQuery || selectedCategory || selectedSchool || selectedYears.length > 0 || selectedStatuses.length > 0
                ? "No theses found." 
                : "You haven't submitted any theses yet."}
            </p>
            {!searchQuery && !selectedCategory && !selectedSchool && selectedYears.length === 0 && selectedStatuses.length === 0 && (
              <Link 
                href="/thesis/add"
                className="inline-block mt-4 text-[#1e4db7] hover:text-[#011638] font-oswald"
              >
                Submit your first thesis →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {paginatedTheses.map((thesis) => (
                <ThesisCard key={thesis.id} thesis={thesis} />
              ))}
            </div>

            <PaginationNav 
              currentPage={validCurrentPage} 
              totalPages={totalPages} 
              itemsPerPage={itemsPerPage} 
              totalItems={totalItems} 
              onPageChange={handlePageChange} 
            />
          </>
        )}
      </div>
    </>
  );
}