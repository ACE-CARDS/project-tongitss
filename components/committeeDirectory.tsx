"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Pagination from "./pagination";

const supabase = createClient();

const STORAGE_URL =
  "https://lnxkspjvyiceoiibdjow.supabase.co/storage/v1/object/public/member-photos";

const getItemsPerPage = () => {
  if (typeof window === "undefined") return 8;

  const width = window.innerWidth;
  if (width < 640) return 4;
  if (width < 1024) return 6;
  return 8;
};

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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getMembers() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const month = now.getMonth();

      const currentAcadYear =
        month >= 7
          ? `${currentYear}-${currentYear + 1}`
          : `${currentYear - 1}-${currentYear}`;

      const ACADYEAR = `AY ${currentAcadYear}`;

      try {
        const { data, error } = await supabase
          .from("member")
          .select(
            `*, committee:committee (comm_name), school:school (school_name)`,
          )
          .eq("acadyear", ACADYEAR)
          .eq("is_active", true)
          .order("id", { ascending: true });

        if (error) throw error;
        if (data) setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }
    getMembers();
  }, []);

  useEffect(() => {
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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

  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  //ginaya ko lang to from mem directory hehehe
  const CommitteeDropdown = ({ value, options, onChange }: any) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
      options.find((o: any) => o.value === value)?.label || "Select";

    return (
      <div ref={ref} className="relative w-full max-w-xs font-sans">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full bg-white/70 backdrop-blur-xl px-6 py-3 border border-[#0b1763] rounded-xl text-[#0b1763] font-medium font-semibold shadow-sm hover:shadow-md transition flex justify-between items-center"
        >
          {selectedLabel}
          <svg
            className={`w-5 h-5 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-100 border-[#0b1763] overflow-hidden">
            <ul className="py-2">
              {options.map((o: any) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="px-5 py-3 cursor-pointer hover:opacity-50 transition-colors text-sm font-medium"
                >
                  {o.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-oswald font-bold text-[#011638]">
          Committee Directory
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-2">
          Meet the members of the organization and their committees.
        </p>
      </div>

      {/* Committee Dropdown*/}
      <div className="flex justify-center w-full mb-12" ref={headerRef}>
        <CommitteeDropdown
          value={activeTab}
          options={commTabs.map((tab) => ({
            label: tab.label,
            value: tab.key,
          }))}
          onChange={(val: string) => setActiveTab(val)}
        />
      </div>

      {/* Members etc */}
      <div className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-7xl w-full">
        {paginatedMembers.map((person, index) => {
          const fileName = `${person.mem_fname}_${person.mem_lname}`.replace(
            /\s+/g,
            "",
          );
          const photoUrl = `${STORAGE_URL}/${fileName}.jpg`;
          const fallbackUrl = `https://ui-avatars.com/api/?name=${person.mem_fname}+${person.mem_lname}&background=f1f5f9&color=64748b&bold=true`;

          return (
            <div
              key={index}
              className="group relative rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-md
                  transition-all duration-300 ease-out
                  hover:-translate-y-3 hover:shadow-2xl hover:border-indigo-200 hover:bg-white
                  w-[42%] sm:w-[42%] md:w-[28%] lg:w-[20%]
                  min-h-[180px] sm:min-h-[240px]
                  flex flex-col"
            >
              {/*<div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'url("/assets/logos/ACE CARDS logo.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />*/}

              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-[#0b1763]/4 to-transparent" />
              <div className="relative flex justify-center mt-2">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:scale-105 transition">
                  <img
                    src={photoUrl}
                    alt={person.mem_fname}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackUrl;
                    }}
                  />
                </div>
              </div>

              <div className="flex-grow flex flex-col items-center justify-start">
                {/* Name */}
                <h2
                  className="mt-2 sm:mt-4 text-center font-bold text-sm sm:text-xl text-[#011638] leading-tight 
                   line-clamp-2 min-h-[2rem] sm:min-h-[3rem] flex items-center justify-center"
                >
                  {person.mem_fname} {person.mem_lname}
                </h2>

                {/* Committee */}
                <div className="flex justify-center mt-1 min-h-[2.5rem] sm:min-h-[3.5rem] items-center">
                  <span
                    className="text-[10px] sm:text-sm text-[#0d21a1] tracking-tighter sm:tracking-tight px-2 sm:px-3 py-1 sm:py-2 
                       rounded-lg md:rounded-full bg-[#0d21a1]/10 font-semibold sm:font-medium text-center line-clamp-2"
                  >
                    {person.committee?.comm_name}
                  </span>
                </div>

                {/* School*/}
                <div className="flex justify-center mt-1 min-h-[2.5rem] sm:min-h-[3.5rem] items-center">
                  <p className="hidden sm:block text-center text-xs text-slate-400 mt-2 italic px-2 line-clamp-2 min-h-[2rem]">
                    {person.school?.school_name}
                  </p>
                </div>
              </div>
              <p className="relative z-10 text-center text-[8px] sm:text-xs text-slate-300 mt-2 sm:mt-4 uppercase tracking-widest">
                {person.acadyear}
              </p>
            </div>
          );
        })}
        {/*If no members*/}
        {paginatedMembers.length === 0 && (
          <p className="text-center text-slate-500 text-lg mt-10">
            No members found 👀
          </p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-sm text-slate-500 font-ubuntu-mono">
            Showing {startIndex + 1} -{" "}
            {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}{" "}
            members
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              headerRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
