"use client"; // for client side rendering

import Link from "next/link"; // to link to another page
import React, { useState } from "react"; // for search query state
import { useRouter } from "next/navigation";

//filter
function FilterButton() {
  return ( //SOURCE: https://codepen.io/mattlake/pen/GRNzqoO
          // https://flowbite.com/docs/customize/icons/
          // https://www.w3schools.com/graphics/svg_stroking.asp
      <button className="bg-[#011638] text-[#eff0f2] px-4 py-2 rounded-lg hover:bg-[#0d21a1] transition-colors flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
        </svg>
        Filter
      </button>
  );
}

interface ThesisHeaderProps {
  initialQuery?: string;
}

//main page
export default function ThesisHeader({ initialQuery = "" }: ThesisHeaderProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // update the URL in-place so the server component can read it
    router.replace(`/thesis${value ? `?query=${encodeURIComponent(value)}` : ""}`);
  };

  return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#011638]">Scholar Theses Collection</h1>
        <p className="text-[#141414] mt-2">Browse all available theses</p>
        
        {/*filter, search, and add*/}
        <div className="flex items-center gap-3 mt-4">
          <FilterButton/> 

          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search theses..."
                onChange={handleChange}
                value={query}
                //SOURCE: https://codepen.io/mattlake/pen/GRNzqoO
                // https://flowbite.com/docs/customize/icons/
                // https://www.w3schools.com/graphics/svg_stroking.asp
                className="w-full px-4 py-2 pl-10 border border-[#0d21a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011638] bg-white text-[#141414]"/>
              <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>

          <Link
            href="/thesis/add"
            className="bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b43c] transition-colors flex items-center gap-2 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Thesis
          </Link>
        </div>
      </div>
  );
}