"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function CommitteeDirectory() {
  const commTabs = [
    { label: "EXECUTIVES", key: "EXECUTIVES" }, //to be changed kasi i dont know the term
    { label: "INTERNALS", key: "INTERNALS" },
    { label: "EXTERNALS", key: "EXTERNALS" },
    { label: "FINANCE AND BUSINESS", key: "FINANCE" },
    { label: "PUBLICITY AND MEDIA", key: "PUBLICITY" },
    { label: "EDUCATION AND RESEARCH", key: "EDUCATION" },
    { label: "EVENTS AND LOGISTICS", key: "EVENTS" },
  ];
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("EXECUTIVES");

  const now = new Date();
  const currentYear = now.getFullYear();
  const month = now.getMonth();
  const currentAcadYear =
    month >= 7
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

  const ACADYEAR = `AY ${currentAcadYear}`; // Result: "AY 2025-2026"a

  useEffect(() => {
    async function getMembers() {
      try {
        const { data, error } = await supabase
          .from("member")
          .select(
            `*,
            committee:committee (comm_name),
            school:school (school_name)`,
          )
          .eq("acadyear", ACADYEAR)
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
        return role?.includes("Internal");
      case "EXTERNALS":
        return role?.includes("External");
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
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg font-bold text-[10px] md:text-xs transition-all border ${
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
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((person) => (
            <div
              key={person.id}
              className="bg-white p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-2xl overflow-hidden border-2 border-gray-50">
                {person.image_url ? (
                  <img
                    src={person.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">:P</span>
                )}
              </div>
              <h3 className="font-bold text-[#011638] font-2xl">
                {person.mem_fname} {person.mem_lname}
              </h3>
              <p className="text-sm text-[#0d21a1] font-medium">
                {person.committee?.comm_name}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {person.school?.school_name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Empty
        <div className="py-20 text-center">
          <p className="text-gray-400 italic">
            No members found in this committee.
          </p>
        </div>
      )}
    </div>
  );
}
