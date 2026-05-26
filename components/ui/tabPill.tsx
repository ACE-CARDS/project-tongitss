"use client";

export interface TabOption<T extends string> {
  id: T;
  label: string;
}

interface TabPillProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
}

export default function TabPill<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: TabPillProps<T>) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 w-full md:w-fit rounded-xl border border-gray-200 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`cursor-pointer flex-1 md:flex-none px-6 py-2 rounded-lg font-ubuntu-mono text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-[#011638] text-white shadow-md"
                : "text-[#475569] hover:bg-gray-200 hover:text-[#011638]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}