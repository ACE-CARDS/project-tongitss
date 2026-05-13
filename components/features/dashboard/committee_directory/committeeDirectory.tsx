"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { BsSuitSpadeFill } from "react-icons/bs";
import FilterDropdown from "@/components/ui/filterDropdown";
import PaginationNav from "@/components/ui/pagination";

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

const normalizeName = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
    { label: "Non-Committee", value: "NON-COMMITTEE" },
    { label: "Internals", value: "INTERNALS" },
    { label: "Externals", value: "EXTERNALS" },
    { label: "Finance and Business", value: "FINANCE" },
    { label: "Publicity and Media", value: "PUBLICITY" },
    { label: "Education and Research", value: "EDUCATION" },
    { label: "Events and Logistics", value: "EVENTS" },
  ];

  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("NON-COMMITTEE");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentAcademicYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month >= 10 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    async function getMembers() {
      const ACADYEAR = `AY ${getCurrentAcademicYear()}`;
      try {
        const { data, error } = await supabase
          .from("member")
          .select(`*, committee:committee (comm_name), school:school (school_name)`)
          .eq("acadyear", ACADYEAR)
          .eq("is_active", true)
          .order("comm", { ascending: true });

        if (error) throw error;
        if (data) setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
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
      case "NON-COMMITTEE":
        return ["Regional Director", "Secretary", "Assistant Secretary"].includes(role);
      case "INTERNALS": return role?.includes("Internal");
      case "EXTERNALS": return role?.includes("External");
      case "FINANCE": return role?.includes("Finance and Business");
      case "PUBLICITY": return role?.includes("Publicity and Media");
      case "EDUCATION": return role?.includes("Education and Research");
      case "EVENTS": return role?.includes("Events and Logistics");
      default: return false;
    }
  });

  const totalItems = filteredMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

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

      {/* Filter Dropdown Integration */}
      <div className="flex justify-center w-full mb-12">
        <FilterDropdown
          value={activeTab}
          options={commTabs}
          onChange={(val) => setActiveTab(val)}
        />
      </div>

      {isLoading ? (
        <div className="min-h-[400px] w-full" />
      ) : (
        <>
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="flex flex-wrap justify-center gap-6 lg:gap-8 max-w-7xl w-full"
          >
            {paginatedMembers.length === 0 ? (
              <p className="text-center text-slate-500 text-lg mt-10 w-full font-ubuntu-mono">
                No members found.
              </p>
            ) : (
              paginatedMembers.map((person, index) => {
                const firstName = person.mem_fname.toLowerCase().trim();
                const lastName = person.mem_lname.toLowerCase().trim();
                const baseFileName = `${firstName}_${lastName}`.replace(/\s+/g, "");
                const photoUrlJpg = `${STORAGE_URL}/${baseFileName}.jpg`;
                const photoUrlPng = `${STORAGE_URL}/${baseFileName}.png`;
                const fallbackUrl = `https://ui-avatars.com/api/?name=${person.mem_fname}+${person.mem_lname}&background=f1f5f9&color=64748b&bold=true`;

                return (
                  <motion.div
                    key={index}
                    className="group relative rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-[#011638] shadow-md
                      transition-all duration-300 ease-out
                      hover:-translate-y-3 hover:shadow-2xl hover:border-[#eec643] hover:bg-white
                      w-[42%] md:w-[28%] lg:w-[20%] min-h-[180px] sm:min-h-[240px] flex flex-col"
                  >
                    <div className="absolute inset-0 opacity-20 overflow-hidden">
                      <BsSuitSpadeFill className="size-6 md:size-8 text-[#011638] absolute top-5 left-5" />
                      <BsSuitSpadeFill className="size-6 md:size-8 text-[#011638] absolute bottom-5 right-5 rotate-180" />
                    </div>

                    <div className="relative flex justify-center mt-2">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:scale-105 transition">
                        <img
                          src={photoUrlJpg}
                          alt={`${person.mem_fname} ${person.mem_lname}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes(".jpg")) {
                              img.src = photoUrlPng;
                            } else {
                              img.src = fallbackUrl;
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col items-center justify-start overflow-hidden">
                      <h2 className="mt-2 sm:mt-4 text-center font-bold text-sm sm:text-xl text-[#011638] leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[3rem] flex items-center justify-center break-words">
                        {normalizeName(person.mem_fname)} {normalizeName(person.mem_lname)}
                      </h2>
                      <div className="flex justify-center mt-1 min-h-[2.5rem] sm:min-h-[3.5rem] items-center">
                        <span className="text-[10px] sm:text-sm text-[#0d21a1] px-2 sm:px-3 py-1 sm:py-2 rounded-lg md:rounded-full bg-[#0d21a1]/10 font-semibold text-center line-clamp-2">
                          {person.committee?.comm_name}
                        </span>
                      </div>
                    </div>
                    <p className="relative z-10 text-center text-[8px] sm:text-xs text-slate-300 mt-2 sm:mt-4 uppercase tracking-widest font-ubuntu-mono">
                      {person.acadyear}
                    </p>
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Pagination Navigation Integration */}
          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}