"use client";

import { useState } from 'react';
import CategoryAdmin from './categoryAdmin';
import SchoolAdmin from './schoolAdmin';
import TabPill, { TabOption } from '@/components/ui/tabPill';

type AdminTab = "categories" | "schools";

export default function ResearchDataAdmin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("categories");

  const tabConfig: TabOption<AdminTab>[] = [
    { id: "categories", label: "Categories" },
    { id: "schools", label: "Schools" },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638]">
            Research Data Management
          </h1>
          <p className="text-[#475569] font-ubuntu-mono mt-1">
            Manage system reference data including categories and schools
          </p>
        </div>

        {/* Pill-style Tab Switcher */}
        <TabPill
          tabs={tabConfig} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
      />
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