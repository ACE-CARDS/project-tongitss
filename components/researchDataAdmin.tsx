"use client";

import { useState } from 'react';
import CategoryAdmin from './categoryAdmin';
import SchoolAdmin from './schoolAdmin';

export default function ResearchDataAdmin() {
  const [activeTab, setActiveTab] = useState<'categories' | 'schools'>('categories');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Research Data Management</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">Manage system reference data including categories and schools</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex w-full">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 pb-3 px-1 font-oswald text-sm font-medium transition-colors relative text-center ${
              activeTab === 'categories'
                ? 'text-[#011638] border-b-2 border-[#011638]'
                : 'text-[#475569] hover:text-[#011638]'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`flex-1 pb-3 px-1 font-oswald text-sm font-medium transition-colors relative text-center ${
              activeTab === 'schools'
                ? 'text-[#011638] border-b-2 border-[#011638]'
                : 'text-[#475569] hover:text-[#011638]'
            }`}
          >
            Schools
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'categories' ? <CategoryAdmin /> : <SchoolAdmin />}
    </div>
  );
}