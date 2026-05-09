"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Pagination from "./pagination";
import { BsSuitSpadeFill } from "react-icons/bs";

const supabase = createClient();

const STORAGE_URL =
  "https://lnxkspjvyiceoiibdjow.supabase.co/storage/v1/object/public/member-photos";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

//hehe normalize q lang po names
const normalizeName = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const getItemsPerPage = () => {
  if (typeof window === "undefined") return 8;

  const width = window.innerWidth;
  if (width < 640) return 4;
  if (width < 1024) return 6;
  return 8;
};

export default function CommitteeDirectory() {
  const commTabs = [
    { label: "Non-Committee", key: "NON-COMMITTEE" },
    { label: "Internals", key: "INTERNALS" },
    { label: "Externals", key: "EXTERNALS" },
    { label: "Finance and Business", key: "FINANCE" },
    { label: "Publicity and Media", key: "PUBLICITY" },
    { label: "Education and Research", key: "EDUCATION" },
    { label: "Events and Logistics", key: "EVENTS" },
  ];

  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("NON-COMMITTEE");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          .order("comm", { ascending: true });

        if (error) throw error;
        if (data) setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
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
      case "NON-COMMITTEE":
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
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
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

  if (isLoading) {
    // Blank while loading
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

        {/* Committee Dropdown */}
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

        {/* Members */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-7xl w-full">
          <div className="min-h-[400px] w-full"></div>
        </div>
      </div>
    );
  }

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
      <motion.div
        key={activeTab}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
        className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-7xl w-full "
      >
        {paginatedMembers.length === 0 ? (
          <p className="text-center text-slate-500 text-lg mt-10 w-full">
            No members found.
          </p>
        ) : (
          paginatedMembers.map((person, index) => {
            const firstName = normalizeName(person.mem_fname);
            const lastName = normalizeName(person.mem_lname);
            const fileName = `${firstName}_${lastName}`.replace(/\s+/g, "");
            const photoUrl = `${STORAGE_URL}/${fileName}.jpg`;
            const fallbackUrl = `https://ui-avatars.com/api/?name=${person.mem_fname}+${person.mem_lname}&background=f1f5f9&color=64748b&bold=true`;

            return (
              <motion.div
                key={index}
                className="group relative rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-[#011638] shadow-md
                  transition-all duration-300 ease-out
                  hover:-translate-y-3 hover:shadow-2xl hover:border-[#eec643] hover:bg-white
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

                <div className="absolute inset-0 opacity-20 overflow-hidden ">
                  <BsSuitSpadeFill className="size-6 md:size-8 text-[#011638] absolute top-5 left-5" />
                  <BsSuitSpadeFill className="size-6 md:size-8 text-[#011638] absolute bottom-5 right-5 rotate-180" />
                </div>

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

                <div className="flex-grow flex flex-col items-center justify-start overflow-hidden">
                  {/* Name */}
                  <h2
                    className="mt-2 sm:mt-4 text-center font-bold text-sm sm:text-xl text-[#011638] leading-tight 
                     line-clamp-2 min-h-[2rem] sm:min-h-[3rem] flex items-center justify-center break-words
                      hyphens-auto "
                  >
                    {normalizeName(person.mem_fname)}{" "}
                    {normalizeName(person.mem_lname)}
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
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* pagination nijaerish  */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-12 mb-2 gap-2">
          <p className="text-sm text-slate-500 font-ubuntu-mono">
            Showing {startIndex + 1} -{" "}
            {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}{" "}
            members
          </p>
          <p className="text-slate-500 font-ubuntu-mono text-sm">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <nav className="flex justify-center items-center space-x-2 mt-8 mb-4">
          {/* Prev button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              currentPage === 1
                ? "text-[#94a3b8] cursor-not-allowed"
                : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {(() => {
              const pages: (number | string)[] = [];
              if (totalPages <= 4) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                const showLeft = currentPage <= 2;
                const showRight = currentPage >= totalPages - 1;
                if (showLeft) {
                  pages.push(1, 2, "...", totalPages);
                } else if (showRight) {
                  pages.push(1, "...", totalPages - 1, totalPages);
                } else {
                  pages.push(1, "...", currentPage, "...", totalPages);
                }
              }

              return pages.map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg text-sm transition ${
                      page === currentPage
                        ? "bg-[#011638] text-white font-bold"
                        : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              );
            })()}
          </div>

          {/* Next button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              currentPage === totalPages
                ? "text-[#94a3b8] cursor-not-allowed"
                : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </nav>
      )}
    </div>
  );
}
