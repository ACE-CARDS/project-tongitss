"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const STORAGE_URL =
  "https://lnxkspjvyiceoiibdjow.supabase.co/storage/v1/object/public/member-photos";

export default function CommitteeDirectory() {
  const commTabs = [
    { label: "EXECUTIVES", key: "EXECUTIVES" },
    { label: "INTERNALS", key: "INTERNALS" },
    { label: "EXTERNALS", key: "EXTERNALS" },
    { label: "FINANCE AND BUSINESS", key: "FINANCE" },
    { label: "PUBLICITY AND MEDIA", key: "PUBLICITY" },
    { label: "EDUCATION AND RESEARCH", key: "EDUCATION" },
    { label: "EVENTS AND LOGISTICS", key: "EVENTS" },
  ];

  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("EXECUTIVES");

  useEffect(() => {
    async function getMembers() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const month = now.getMonth();

      // 2. Calculate the string and add "AY " to match your DB
      const currentAcadYear =
        month >= 7
          ? `${currentYear}-${currentYear + 1}`
          : `${currentYear - 1}-${currentYear}`;

      const ACADYEAR = `AY ${currentAcadYear}`; // Result: "AY 2025-2026"

      try {
        const { data, error } = await supabase
          .from("member")
          .select(
            `*, committee:committee (comm_name), school:school (school_name)`,
          )
          .eq("acadyear", ACADYEAR)
          .eq("is_active", "TRUE")
          .order("id", { ascending: true });

        if (error) throw error;
        if (data) setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }
    getMembers();
  }, []);

  const filteredMembers = members.filter((person) => {
    const role = person.committee?.comm_name;
    switch (activeTab) {
      case "EXECUTIVES":
        return [
          "Regional Director",
          "Secretary",
          "Assistant Secretary",
        ].includes(role);
      case "INTERNALS":
        return role?.includes("Internal Affairs");
      case "EXTERNALS":
        return role?.includes("External Affairs");
      case "FINANCE":
        return role?.includes("Finance and Business");
      case "PUBLICITY":
        return role?.includes("Publicity and Media");
      case "EDUCATION":
        return role?.includes("Education and Research");
      case "EVENTS":
        return role?.includes("Events and Logistics");
      default:
        return false;
    }
  });

  return (
    <div className="w-full">
      {/* Tab Bar */}
      <div className="flex flex-wrap gap-1 mb-6">
        {commTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold text-[10px] md:text-xs transition-all border ${
              activeTab === tab.key
                ? "bg-[#0b1763] text-white border-[#0b1763] shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Member */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((person) => {
          const fileName = `${person.mem_fname}_${person.mem_lname}`.replace(
            /\s+/g,
            "",
          );
          const photoUrl = `${STORAGE_URL}/${fileName}.jpg`;

          const fallbackUrl = `https://ui-avatars.com/api/?name=${person.mem_fname}+${person.mem_lname}&background=f1f5f9&color=64748b&bold=true`;

          return (
            <div
              key={person.id}
              className="bg-white p-6 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full mb-4 flex items-center justify-center overflow-hidden border-4 border-white shadow-inner">
                <img
                  src={photoUrl}
                  alt={`${person.mem_fname} ${person.mem_lname}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== fallbackUrl) {
                      target.src = fallbackUrl;
                    }
                  }}
                />
              </div>
              <h3 className="font-bold text-[#011638] text-lg">
                {person.mem_fname} {person.mem_lname}
              </h3>
              <p className="text-sm text-[#0d21a1] tracking-tight">
                {person.committee?.comm_name}
              </p>
              <p className="text-xs text-[#475569] font-medium ">
                {person.mem_schol_year} {person.mem_schol_type}
              </p>
              <p className="text-xs text-[#475569] font-medium italic">
                {person.school?.school_name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
