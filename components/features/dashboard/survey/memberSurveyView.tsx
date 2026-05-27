"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import SurveyDescription from '@/app/survey/survey_description';
import SpotlightCard from "@/components/ui/SpotlightCard";
import PaginationNav from "@/components/ui/pagination";
import MemberFeatureBanner from "@/components/ui/memberFeatureBanner";

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
  onCategoryChange,
  onSchoolChange,
  onYearToggle,
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
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSchoolChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onYearToggle: (year: number) => void;
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

  if (!isOpen) return null;

  return (
    <div 
      ref={popupRef}
      className="absolute top-full mt-2 w-80 bg-[#fbfaf8] border border-[#1e4db7] rounded-lg shadow-xl p-4 z-40"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-oswald font-bold text-[#011638]">Filter Surveys</h3>
        <button
          onClick={onClose}
          className="text-[#475569] hover:text-[#011638] transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
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

        {/* Year Filter */}
        <div>
          <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
            Survey Years
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

// Card Component
function SurveyCard({ survey }: { survey: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPingColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      case "archived": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <SpotlightCard
      className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm"
      spotlightColor="rgba(239, 240, 242, 0.16)"
    >
      <div className="bg-[#011638] px-6 py-4 min-h-[110px] flex items-center">
        <h2 className="text-xl font-oswald font-bold text-[#fbfaf8] line-clamp-3 break-words overflow-hidden">
          {survey.survey_title}
        </h2>
      </div>

      <div className="px-6 py-4 flex flex-col flex-1">
        
        {/* STATUS Section */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">STATUS</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(survey.survey_status)} inline-flex items-center gap-2 shadow-sm`}>
            <span className="relative flex size-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingColor(survey.survey_status)} opacity-75`}></span>
              <span className={`relative inline-flex size-2 rounded-full ${getPingColor(survey.survey_status)}`}></span>
            </span>
            {survey.survey_status?.toUpperCase()}
          </div>
        </div>

        {/* REJECTION REASON Section */}
        {survey.survey_status === 'rejected' && survey.rejection_reason && (
          <div className="mb-4">
            <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">REJECTION REASON</h3>
            <p className="text-red-600 font-ubuntu-mono text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {survey.rejection_reason}
            </p>
          </div>
        )}

        {/* Author(s) */}
        <div className="mb-4 min-h-[60px]">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">Author(s)</h3>
          <div className="flex flex-wrap gap-2">
            {survey.survey_author && survey.survey_author.length > 0 ? (
              survey.survey_author.map((sa: any, index: number) => {
                const author = sa.author;
                if (!author) return null;
                return (
                  <div key={author.id || index} className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-ubuntu-mono">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {author.author_fname} {author.author_minit ? `${author.author_minit}.` : ""} {author.author_lname}
                  </div>
                );
              })
            ) : (
              <span className="text-[#475569] opacity-50 text-sm">No authors listed</span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">Description</h3>
          <div>
            <SurveyDescription description={survey.survey_desc} />
          </div>
        </div>

        {/* Details */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-[#475569] block font-ubuntu-mono text-xs">Category:</span>
              <span className="font-ubuntu-mono text-[#011638] text-sm">
                {survey.r_category?.r_category_name || "Uncategorized"}
              </span>
            </div>
            <div>
              <span className="text-[#475569] block font-ubuntu-mono text-xs">School:</span>
              <span className="font-ubuntu-mono text-[#011638] text-sm">
                {survey.school?.school_name || "No School"}
              </span>
            </div>
            <div>
              <span className="text-[#475569] block font-ubuntu-mono text-xs">Start Date:</span>
              <span className="font-ubuntu-mono text-[#011638] text-sm">
                {new Date(survey.survey_start).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-[#475569] block font-ubuntu-mono text-xs">End Date:</span>
              <span className="font-ubuntu-mono text-[#011638] text-sm">
                {new Date(survey.survey_end).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {survey.max_respondents && (
              <div>
                <span className="text-[#475569] block font-ubuntu-mono text-xs">Max Respondents:</span>
                <span className="font-ubuntu-mono text-[#011638] text-sm">{survey.max_respondents}</span>
              </div>
            )}
          </div>
        </div>

        {/* Survey Link */}
        {survey.survey_link && (
          <div className="mt-auto">
            <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">Survey Link</h3>
            <a 
              href={survey.survey_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-all"
            >
              Take Survey
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}

export default function MemberSurveyView() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = createClient();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  
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

      // Fetch available years from surveys
      const { data: yearsData } = await supabase
        .from("survey")
        .select("created_at")
        .not("created_at", "is", null);
      
      if (yearsData) {
        const years = [...new Set(yearsData.map(s => new Date(s.created_at).getFullYear()))];
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
      fetchUserSurveys();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...surveys];
    
    // Apply search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(survey =>
        survey.survey_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.survey_desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.survey_keyword?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      const categoryNum = Number(selectedCategory);
      filtered = filtered.filter(survey => {
        const surveyCategoryId = survey.r_category?.id ? Number(survey.r_category.id) : null;
        return surveyCategoryId === categoryNum;
      });
    }
    
    // Apply school filter
    if (selectedSchool) {
      const schoolNum = Number(selectedSchool);
      filtered = filtered.filter(survey => {
        const surveySchoolId = survey.school?.id ? Number(survey.school.id) : null;
        return surveySchoolId === schoolNum;
      });
    }
    
    // Apply year filter
    if (selectedYears.length > 0) {
      filtered = filtered.filter(survey => {
        const surveyYear = new Date(survey.created_at).getFullYear();
        return selectedYears.includes(surveyYear);
      });
    }
    
    // Sort by status: pending -> accepted -> archived -> rejected
    // Within each status, most recent first
    const statusOrder: Record<string, number> = {
      'pending': 0,
      'accepted': 1,
      'archived': 2,
      'rejected': 3
    };
    
    filtered.sort((a, b) => {
    const statusA = a.survey_status?.toLowerCase() || '';
    const statusB = b.survey_status?.toLowerCase() || '';
    
    const orderA = statusOrder[statusA] ?? 4;
    const orderB = statusOrder[statusB] ?? 4;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Same status, sort by survey_start date
    const dateA = new Date(a.survey_start).getTime();
    const dateB = new Date(b.survey_start).getTime();
    return dateB - dateA;
  });
  
  setFilteredSurveys(filtered);
  setCurrentPage(1);
}, [searchQuery, selectedCategory, selectedSchool, selectedYears, surveys]);

  const fetchUserSurveys = async () => {
    try {
      const { data: author, error: authorError } = await supabase
        .from("author")
        .select("id")
        .eq("author_email", user?.email)
        .single();

      if (authorError) {
        setLoading(false);
        return;
      }

      if (author) {      
        const { data: surveyLinks, error: surveyError } = await supabase
          .from("survey_author")
          .select(`
            survey:survey(
              *,
              r_category:r_category(*),
              school:school(*),
              survey_author:survey_author(
                author:author(*)
              )
            )
          `)
          .eq("author", author.id);

        if (surveyError) {
          console.error("Error fetching survey links:", surveyError);
          throw surveyError;
        }
        
        if (surveyLinks && surveyLinks.length > 0) {
          const fetchedSurveys = surveyLinks.map(link => link.survey);
          setSurveys(fetchedSurveys);
          setFilteredSurveys(fetchedSurveys);
        } else {
          setSurveys([]);
          setFilteredSurveys([]);
        }
      } 
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalItems = filteredSurveys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, endIndex);

  // Page change handler
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSchool("");
    setSelectedYears([]);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const activeFilterCount = (selectedCategory ? 1 : 0) + (selectedSchool ? 1 : 0) + selectedYears.length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Surveys</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted surveys
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, description, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg bg-[#fbfaf8] text-[#475569] font-ubuntu-mono opacity-50"
            />
            <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            disabled
            className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Survey
          </button>
        </div>

        <div className="min-h-[400px] w-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Surveys</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted surveys
          </p>
        </div>

        {!isAuthenticated && (
          <MemberFeatureBanner feature="Survey submission is available exclusively to ACE CARDS members." />
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
                onCategoryChange={handleCategoryChange}
                onSchoolChange={handleSchoolChange}
                onYearToggle={handleYearToggle}
                onReset={resetFilters}
              />
            </div>

            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by title, description, or keywords..."
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
                href="/survey/add?returnTo=/dashboard?tab=survey"
                className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Survey
              </Link>
            )}
          </div>
        </div>

        {!mounted ? (
          <div className="text-center text-[#475569] py-8 font-ubuntu-mono">
            Loading...
          </div>
        ) : paginatedSurveys.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#475569] font-ubuntu-mono">
              {searchQuery || selectedCategory || selectedSchool || selectedYears.length > 0 
                ? "No surveys found." 
                : "You haven't submitted any surveys yet."}
            </p>
            {!searchQuery && !selectedCategory && !selectedSchool && selectedYears.length === 0 && (
              <Link 
                href="/survey/add"
                className="inline-block mt-4 text-[#1e4db7] hover:text-[#011638] font-oswald"
              >
                Submit your first survey →
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {paginatedSurveys.map((survey) => (
                <SurveyCard key={survey.id} survey={survey} />
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