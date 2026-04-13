"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const STORAGE_URL =
  "https://lnxkspjvyiceoiibdjow.supabase.co/storage/v1/object/public/member-photos";

export default function CommitteeDirectory() {
  const commTabs = [
    { label: "Executives", key: "EXECUTIVES" },
    { label: "Internals", key: "INTERNALS" },
    { label: "Externals", key: "EXTERNALS" },
    { label: "Finance and Business", key: "FINANCE" },
    { label: "Publicity and Media", key: "PUBLICITY" },
    { label: "Education and Research", key: "EDUCATION" },
    { label: "Events and Logistics", key: "EVENTS" },
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

  //ginaya ko lang to from mem directory hehehe
  const CommitteeDropdown = ({
    value,
    options,
    onChange,
  }: {
    value: string | number;
    options: { label: string; value: string | number }[];
    onChange: (val: string | number) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
          setSearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedLabel =
      options.find((o) => o.value === value)?.label || "Select";

    return (
      <div ref={ref} className="relative w-[60%] max-w-md font-sans">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-3 py-2 border-[#0b1763] border rounded-xl text-left shadow-sm font-semibold relative text-[#0b1763]"
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${
              open ? "rotate-225" : "rotate-45"
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-100 border-[#0b1763]">
            <ul className="custom-scrollbar py-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((o) => (
                  <li
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`px-5 py-3 cursor-pointer hover:opacity-50 transition-colors text-md font-medium`}
                  >
                    {o.label}
                  </li>
                ))
              ) : (
                <li className="px-5 py-3 text-gray-400 text-sm">
                  No results found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Committee Dropdown*/}
      <div className="w-full max-w-sm mb-8">
        <CommitteeDropdown
          value={activeTab}
          options={commTabs.map((tab) => ({
            label: tab.label,
            value: tab.key,
          }))}
          onChange={(val) => setActiveTab(val as string)}
        />
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
