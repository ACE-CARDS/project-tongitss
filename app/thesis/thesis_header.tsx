"use client"; // for client side rendering

import Link from "next/link"; // to link to another page
import React, { useState } from "react"; // for search query state
import { useRouter } from "next/navigation";

//filter
function FilterButton({ isOpen }: { isOpen: boolean }) {
  return (
    <button
      className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 font-medium ${
        isOpen
          ? "bg-[#0d21a1] text-[#eff0f2]"
          : "bg-[#011638] text-[#eff0f2] hover:bg-[#0d21a1]"
      }`}
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
      Filter {isOpen ? "✕" : ""}
    </button>
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

interface ThesisHeaderProps {
  initialQuery?: string;
  categories: Category[];
  schools: School[];
  initialCategory?: string;
  initialSchool?: string;
}

//main page
export default function ThesisHeader({
  initialQuery = "",
  categories = [],
  schools = [],
  initialCategory = "",
  initialSchool = "",
}: ThesisHeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSchool, setSelectedSchool] = useState(initialSchool);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    updateUrl(value, selectedCategory, selectedSchool);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    updateUrl(query, value, selectedSchool);
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSchool(value);
    updateUrl(query, selectedCategory, value);
  };

  const updateUrl = (searchQuery: string, category: string, school: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("query", searchQuery);
    if (category) params.append("category", category);
    if (school) params.append("school", school);

    const queryString = params.toString();
    router.replace(`/thesis${queryString ? `?${queryString}` : ""}`);
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedSchool("");
    updateUrl("", "", "");
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-[#011638]">
        Scholar Theses Collection
      </h1>
      <p className="text-[#141414] mt-2">Browse all available theses</p>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 bg-[#eff0f2]"
            style={{
              backgroundColor: showFilters ? "#0d21a1" : "#011638",
            }}
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
            Filters {showFilters ? ".... ✕" : ""}
          </button>

          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search theses..."
                onChange={handleChange}
                value={query}
                className="w-full px-4 py-2 pl-10 border border-[#0d21a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011638] bg-white text-[#141414]"
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
            </div>
          </div>

          <Link
            href="/thesis/add"
            className="bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b43c] transition-colors flex items-center gap-2 font-medium"
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

        {showFilters && (
          <div className="bg-white border border-[#0d21a1] rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 w-[60%]">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-[#011638] mb-2"
              >
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className=" border border-[#0d21a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011638] text-[#141414] bg-white w-full px-3 py-2"
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
                className="block text-sm font-medium text-[#011638] mb-2"
              >
                University
              </label>
              <select
                id="school"
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="border border-[#0d21a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011638] text-[#141414] bg-white w-full px-3 py-2"
              >
                <option value="">All Universities</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.school_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-[#011638] bg-[#eff0f2] border border-[#011638] rounded-lg hover:bg-[#e0e1e5] transition-colors font-medium"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
