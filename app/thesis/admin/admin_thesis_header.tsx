"use client";

import Link from "next/link";
import React, { useState, useRef, useEffect, useCallback } from "react";

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
  buttonRef,
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
      className="absolute top-full mt-2 w-80 bg-[#fbfaf8] border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] shadow-xl p-4 z-40"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-oswald font-bold text-[#011638]">Filter Theses</h3>
        <button
          onClick={onClose}
          className="cursor-pointer text-[#475569] hover:text-[#011638] transition-colors"
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
            Research Thematic Area
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={onCategoryChange}
            className="border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] text-[#011638] bg-[#fbfaf8] w-full px-3 py-2 font-ubuntu-mono transition-colors"
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
            className="border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] text-[#011638] bg-[#fbfaf8] w-full px-3 py-2 font-ubuntu-mono transition-colors"
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
          <div className="border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] text-[#011638] bg-[#fbfaf8] w-full px-3 py-2 font-ubuntu-mono transition-colors p-3 max-h-48 overflow-y-auto">
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
              {selectedYears.length} year{selectedYears.length > 1 ? "s" : ""}{" "}
              selected
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
        .filter((keyword) => keyword.toLowerCase().startsWith(lowerQuery))
        .slice(0, 50);
      setFilteredKeywords(filtered);
    }
  }, [query, allKeywords, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node)
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
  }, [isOpen, onClose]);

  if (!isOpen || filteredKeywords.length === 0) return null;

  return (
    <div
      ref={suggestionRef}
      className="absolute z-50 w-full mt-1 bg-[#fbfaf8] border border-[#011638] rounded-lg shadow-xl"
    >
      <div className="px-4 py-2 bg-[#1e4db7] bg-opacity-20 border-b border-[#011638] rounded-t-lg sticky top-0">
        <span className="text-xs font-oswald font-semibold text-[#fbfaf8]">
          {query.trim() ? "SUGGESTED KEYWORDS" : "ALL KEYWORDS"}
        </span>
      </div>

      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        {filteredKeywords.map((keyword, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(keyword);
              onClose();
            }}
            className="w-full text-left px-4 py-2 hover:bg-[#e0e7ff] hover:text-[#011638] text-[#475569] font-ubuntu-mono transition-colors border-b last:border-b-0 border-[#011638] border-opacity-20"
          >
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                />
              </svg>
              <span className="truncate">{keyword}</span>
            </span>
          </button>
        ))}
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

interface AdminThesisHeaderProps {
  initialQuery?: string;
  categories: Category[];
  schools: School[];
  years: number[];
  initialCategory?: string;
  initialSchool?: string;
  initialYears?: number[];
  initialStatuses?: string[];
  availableKeywords?: string[];
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  archivedCount: number;
  onFilterChange: (filters: {
    query?: string;
    category?: string;
    school?: string;
    years?: number[];
    statuses?: string[];
  }) => void;
}

export default function AdminThesisHeader({
  initialQuery = "",
  categories = [],
  schools = [],
  years = [],
  initialCategory = "",
  initialSchool = "",
  initialYears = [],
  initialStatuses = [],
  availableKeywords = [],
  pendingCount = 0,
  acceptedCount = 0,
  rejectedCount = 0,
  archivedCount = 0,
  onFilterChange,
}: AdminThesisHeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSchool, setSelectedSchool] = useState(initialSchool);
  const [selectedYears, setSelectedYears] = useState<number[]>(initialYears);
  const [selectedStatuses, setSelectedStatuses] =
    useState<string[]>(initialStatuses);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialRender = useRef(true);

  // AND logic
  const buildFilterParams = useCallback(() => {
    const filters: {
      query?: string;
      category?: string;
      school?: string;
      years?: number[];
      statuses?: string[];
    } = {};

    if (query) filters.query = query;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedSchool) filters.school = selectedSchool;
    if (selectedYears.length > 0) filters.years = selectedYears;
    filters.statuses = selectedStatuses;

    return filters;
  }, [query, selectedCategory, selectedSchool, selectedYears, selectedStatuses]);

  // Apply filters when any filter changes
  useEffect(() => {
    // Skip on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const filters = buildFilterParams();
    onFilterChange(filters);
  }, [query, selectedCategory, selectedSchool, selectedYears, selectedStatuses, onFilterChange, buildFilterParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    // clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // set new timer
    debounceTimer.current = setTimeout(() => {
    }, 500);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSchool(value);
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
  };

  const handleYearToggle = (year: number) => {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year].sort((a, b) => b - a);
    setSelectedYears(newYears);
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedSchool("");
    setSelectedYears([]);
    setSelectedStatuses([]);
  };

  // Handle status card filter
  const handleStatusCardClick = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status) // Remove if already selected
      : [...selectedStatuses, status]; // Add if not selected
    
    setSelectedStatuses(newStatuses);
  };

  const totalFilters =
    (selectedCategory ? 1 : 0) +
    (selectedSchool ? 1 : 0) +
    selectedYears.length +
    selectedStatuses.length;

  const isStatusActive = (status: string) => {
    return selectedStatuses.includes(status);
  };

  // Clear search handler
  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">
            Admin Thesis Management
          </h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            Manage and moderate all thesis submissions
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Pending Card */}
        <div
          onClick={() => handleStatusCardClick("pending")}
          className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${
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
          className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${
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
          className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${
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
          className={`bg-white border border-[#011638] rounded-xl p-4 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${
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
            categories={categories}
            schools={schools}
            years={years}
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
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              value={query}
              className="w-full px-4 py-2 pl-10 pr-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
            />
            <svg
              className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
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

            {/* clear/X button */}
            {(query || showSuggestions) && (
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

          {/* LiveSuggestions */}
          <LiveSuggestions
            query={query}
            onSelect={handleSuggestionSelect}
            isOpen={showSuggestions}
            onClose={() => setShowSuggestions(false)}
            allKeywords={availableKeywords}
          />
        </div>

        {/* Add button */}
        <Link
          href="/thesis/add?returnTo=/dashboard"
          className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Thesis
        </Link>
      </div>
    </div>
  );
}