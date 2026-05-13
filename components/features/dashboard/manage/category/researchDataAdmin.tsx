"use client";

import { useState } from 'react';
import CategoryAdmin from './categoryAdmin';
import SchoolAdmin from './schoolAdmin';

export default function ResearchDataAdmin() {
  const [activeTab, setActiveTab] = useState<'categories' | 'schools'>('categories');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">
            Research Data Management
          </h1>
          <p className="text-[#475569] font-ubuntu-mono mt-1">
            Manage system reference data including categories and schools
          </p>
        </div>

        {/* Pill-style Tab Switcher */}
        <div className="flex gap-1 p-1 bg-gray-100 w-full md:w-fit rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-ubuntu-mono text-sm font-medium transition-all duration-200 ${
              activeTab === 'categories'
                ? 'bg-[#011638] text-white shadow-md'
                : 'text-[#475569] hover:bg-gray-200 hover:text-[#011638]'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex-1 md:flex-none px-6 py-2 rounded-lg font-ubuntu-mono text-sm font-medium transition-all duration-200 ${
              activeTab === 'schools'
                ? 'bg-[#011638] text-white shadow-md'
                : 'text-[#475569] hover:bg-gray-200 hover:text-[#011638]'
            }`}
          >
            Schools
          </button>
        </div>
      </div>

      {/* Content Area with subtle fade-in transition logic could be added via framer-motion if desired */}
      <div className="bg-white rounded-2xl">
        {activeTab === 'categories' ? (
          <CategoryAdmin />
        ) : (
          <SchoolAdmin />
        )}
      </div>
    </div>
  );
}