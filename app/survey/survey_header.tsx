// same logic as thesis
"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

function LiveSuggestions({
  query,
  onSelect,
  isOpen,
  onClose,
  allKeywords = [],
}: {
  query: string;
  onSelect: (suggestion: string) => void;
  isOpen: boolean;
  onClose: () => void;
  allKeywords?: string[];
}) {
  const [filteredKeywords, setFilteredKeywords] = useState<string[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setFilteredKeywords(allKeywords.slice(0, 50));
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = allKeywords
        .filter(keyword => keyword.toLowerCase().startsWith(lowerQuery))
        .slice(0, 50);
      setFilteredKeywords(filtered);
    }
  }, [query, allKeywords, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || filteredKeywords.length === 0) return null;

  return (
    <div
      ref={suggestionRef}
      className="absolute z-50 w-full mt-1 bg-[#fbfaf8] border border-[#1e4db7] rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
    >
      <div className="px-4 py-2 bg-[#1e4db7] bg-opacity-20 border-b border-[#1e4db7] sticky top-0">
        <span className="text-xs font-oswald text-[#fbfaf8]">
          {query.trim() ? 'SUGGESTED KEYWORDS' : 'ALL KEYWORDS'}
        </span>
      </div>
      {filteredKeywords.map((keyword, index) => (
        <button
          key={index}
          onClick={() => {
            onSelect(keyword);
            onClose();
          }}
          className="w-full text-left px-4 py-2 hover:bg-[#e0e7ff] hover:text-[#011638] text-[#475569] font-ubuntu-mono transition-colors border-b last:border-b-0 border-[#1e4db7] border-opacity-20"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span className="truncate">{keyword}</span>
          </span>
        </button>
      ))}
      {filteredKeywords.length === 50 && allKeywords.length > 50 && (
        <div className="px-4 py-2 text-xs text-[#475569] font-ubuntu-mono text-center border-t border-[#1e4db7] border-opacity-20">
          Showing first 50 keywords. Type to filter more specifically.
        </div>
      )}
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

interface SurveyHeaderProps {
  initialQuery?: string;
  categories: Category[];
  schools: School[];
  years: number[];
  initialCategory?: string;
  initialSchool?: string;
  initialYears?: number[];
  availableKeywords?: string[];
}

export default function SurveyHeader({
  initialQuery = "",
  categories = [],
  schools = [],
  years = [],
  initialCategory = "",
  initialSchool = "",
  initialYears = [],
  availableKeywords = [],
}: SurveyHeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSchool, setSelectedSchool] = useState(initialSchool);
  const [selectedYears, setSelectedYears] = useState<number[]>(initialYears);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem("isAuthenticated") === "true";
    }
    return false;
  });
  const [isMounted, setIsMounted] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      const authenticated = !!user;
      setIsAuthenticated(authenticated);
      sessionStorage.setItem("isAuthenticated", authenticated.toString());
    };
    
    checkAuth();
  }, []);

  const updateUrl = useCallback((searchQuery: string, category: string, school: string, years: number[], page: number = 1) => {
    isUpdatingRef.current = true;
    
    const params = new URLSearchParams();
    if (searchQuery) params.append("query", searchQuery);
    if (category) params.append("category", category);
    if (school) params.append("school", school);
    
    years.forEach(year => {
      params.append("year", year.toString());
    });

    params.append("page", page.toString());

    const queryString = params.toString();
    router.replace(`/survey${queryString ? `?${queryString}` : ""}`);
    
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    updateUrl(value, selectedCategory, selectedSchool, selectedYears, 1);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    updateUrl(suggestion, selectedCategory, selectedSchool, selectedYears, 1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    updateUrl(query, value, selectedSchool, selectedYears, 1);
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSchool(value);
    updateUrl(query, selectedCategory, value, selectedYears, 1);
  };

  const handleYearToggle = (year: number) => {
    setSelectedYears(prev => {
      const newYears = prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year].sort((a, b) => b - a);
      
      updateUrl(query, selectedCategory, selectedSchool, newYears, 1);
      return newYears;
    });
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedSchool("");
    setSelectedYears([]);
    updateUrl("", "", "", [], 1);
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-oswald font-bold text-[#011638]">
        Scholar Survey Collection
      </h1>
      <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">Browse all available surveys</p>

      <div className="flex flex-col gap-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative" ref={filterButtonRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full sm:w-auto px-4 py-2 rounded-lg font-oswald transition-all flex items-center justify-center gap-1 ${
                showFilters ? "bg-[#011638]" : "bg-[#011638]"
              } text-[#eff0f2] hover:bg-[#1e4db7] active:bg-[#0d21a1]`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(selectedCategory || selectedSchool || selectedYears.length > 0) && (
                <span className="bg-[#eec643] text-[#011638] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {(selectedCategory ? 1 : 0) + (selectedSchool ? 1 : 0) + selectedYears.length}
                </span>
              )}
            </button>
            
            <FilterPopup
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              buttonRef={filterButtonRef}
              categories={categories}
              schools={schools}
              years={years}
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
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                onChange={handleChange}
                onFocus={() => setShowSuggestions(true)}
                value={query}
                className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
              />
              <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              <LiveSuggestions
                query={query}
                onSelect={handleSuggestionSelect}
                isOpen={showSuggestions}
                onClose={() => setShowSuggestions(false)}
                allKeywords={availableKeywords}
              />
            </div>
          </div>

          {isMounted && isAuthenticated && (
          <Link
            href="/survey/add"
            className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
            onClick={() => sessionStorage.removeItem("surveyDraft")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Survey
          </Link>
        )}
        </div>
      </div>
    </div>
  );
}