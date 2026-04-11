"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/context/userContext";

type Member = {
  id: number;
  mem_fname: string;
  mem_lname: string;
  role: string;
  comm: number | string;
};

type Committee = {
  id: number;
  comm_name: string;
};

export default function MembersPage() {
  const supabase = createClient();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [members, setMembers] = useState<Member[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchName, setSearchName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: memberData } = await supabase
        .from("member")
        .select("*")
        .eq("acadyear", "AY 2025-2026"); //change here yung year thnx

      const { data: committeeData } = await supabase
        .from("committee")
        .select("*")
        .order("id", { ascending: true });

        if (memberData) {
            const cloned = structuredClone(memberData);
          
            setMembers(cloned);
            setOriginalMembers(structuredClone(cloned));
          }
      if (committeeData) setCommittees(committeeData);
    };
    fetchData();
  }, []);

  //keywords for committee tabs
  const committeeCategories = [
    { label: "All", key: "all" },
    { label: "Non-Committee", key: "regional" },
    { label: "Internals", key: "internal" },
    { label: "Externals", key: "external" },
    { label: "Finance and Business", key: "finance" },
    { label: "Publicity and Media", key: "publicity" },
    { label: "Education and Research", key: "education" },
    { label: "Events and Logistics", key: "logistics" },
  ];

  const filteredMembers = members.filter((m) => {
    const commName =
      typeof m.comm === "number"
        ? committees.find((c) => c.id === m.comm)?.comm_name || ""
        : m.comm;

        const committeeMatch =
  selectedFilter === "all"
    ? true
    : selectedFilter === "regional"
      ? commName.toLowerCase().includes("regional") ||
        commName.toLowerCase().includes("secretary")
      : commName.toLowerCase().includes(selectedFilter);

    const nameMatch = `${m.mem_fname} ${m.mem_lname}`
      .toLowerCase()
      .includes(searchName.toLowerCase());

    return committeeMatch && nameMatch;
  });

  const getCommName = (comm: number | string) => {
    if (typeof comm === "number") {
      return committees.find((c) => c.id === comm)?.comm_name || "";
    }
    return comm;
  };

  const normalize = (str: string) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  // prio for listing
  const priority = [
    "Regional Director",
    "Director for Internal Affairs",
    "Deputy Director for Internal Affairs",
    "Director for External Affairs",
    "Deputy Director for External Affairs",
    "Secretary",
    "Assistant Secretary",
    "Finance and Business Committee Head",
    "Finance and Business Committee Deputy",
    "Publicity and Media Committee Head",
    "Publicity and Media Committee Deputy",
    "Education and Research Committee Head",
    "Education and Research Committee Deputy",
    "Events and Logistics Committee Head",
    "Events and Logistics Committee Deputy",
  ].map(normalize);

  const getPriorityIndex = (commName: string) =>
    priority.indexOf(normalize(commName));

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const commA = getCommName(a.comm);
    const commB = getCommName(b.comm);

    const indexA = getPriorityIndex(commA);
    const indexB = getPriorityIndex(commB);

    const aInList = indexA !== -1;
    const bInList = indexB !== -1;

    if (aInList && bInList) return indexA - indexB;

    if (aInList) return -1;
    if (bInList) return 1;

    // alpabetical if wala s aprio list
    return `${a.mem_fname} ${a.mem_lname}`
      .toLowerCase()
      .localeCompare(`${b.mem_fname} ${b.mem_lname}`.toLowerCase());
  });

  // pagination
  const totalPages = Math.ceil(sortedMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = sortedMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const hasChanges = members.some((m, i) => {
    const o = originalMembers[i];
    return !o || m.role !== o.role || m.comm !== o.comm;
  });

  //saving roles sa supabase
  const handleRoleChange = (id: number, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, role: String(newRole) } : m
      )
    );
  };
  
  const handleCommitteeChange = (id: number, newCommitteeId: number | string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, comm: newCommitteeId } : m
      )
    );
  };

  const handleSave = async () => {
    setShowConfirm(false);
  
    try {
      const updates = members.map((m) =>
        supabase
          .from("member")
          .update({ role: m.role, comm: m.comm })
          .eq("id", m.id)
      );
  
      await Promise.all(updates);
  
      setMembers((prev) => structuredClone(prev));
      setOriginalMembers(structuredClone(members));
  
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (error) {
      console.error(error);
    }
  };

  //yellow hehe panget but sana gets
  const getRoleStyle = (role: string) => {
    if (role === "superadmin") return "text-black-600";
    if (role === "admin") return "text-black-600";
    return "text-black-600";
  };

  //color based sa GA
  const getCommitteeStyle = (commName: string) => {
    const name = commName.toLowerCase();
    if (name.includes("internal")) return "text-purple-800";
    if (name.includes("external")) return "text-green-800";
    if (name.includes("education")) return "text-red-800";
    if (name.includes("finance")) return "text-blue-900";
    if (name.includes("publicity")) return "text-pink-800";
    if (name.includes("logistics")) return "text-yellow-600";
    if (name.includes("regional")) return "text-gray-800";
    if (name.includes("secretary")) return "text-gray-900";
    return "text-gray-600";
  };

  //role dropdwn
  const Dropdown = ({
    value,
    options,
    onChange,
    styleClass,
  }: {
    value: string | number;
    options: { label: string; value: string | number }[];
    onChange: (val: string | number) => void;
    styleClass?: string;
  }) => {
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
      options.find((o) => o.value === value)?.label || "Select";

    return (
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`w-full px-3 py-2 border rounded-xl text-left shadow-sm font-normal relative ${styleClass}`}
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${
              open ? "rotate-225" : "rotate-45"
            }`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto">
            {options.map((o) => (
              <li
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`${getRoleStyle(o.value as string)} px-3 py-2 cursor-pointer hover:opacity-30`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  //committee dropdwn
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
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-3 py-2 border rounded-xl text-left shadow-sm font-normal relative"
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${
              open ? "rotate-225" : "rotate-45"
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
            />
            <ul>
              {filteredOptions.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`${getCommitteeStyle(o.label)} px-3 py-2 cursor-pointer hover:opacity-50`}
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchName]);

  //REAL MAIN PURO RETURN E ANG HIRAP HANAPIN
  return (
    <div className="w-full min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="relative w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-oswald font-bold text-[#011638]">
            Member Directory
          </h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            Meet the members of the organization and their committees.
          </p>
          </div>

          {/* committee tabs */}
          <div className="flex gap-2 flex-nowrap overflow-x-auto">
            {committeeCategories.map((cat) => {
              const getTabColor = (key: string) => {
                const name = key.toLowerCase();
                if (name.includes("internal"))
                  return "text-purple-800";
                if (name.includes("external"))
                  return "text-green-800";
                if (name.includes("education")) return "text-red-800";
                if (name.includes("finance"))
                  return "text-blue-900";
                if (name.includes("publicity"))
                  return "text-pink-800";
                if (name.includes("logistics"))
                  return "text-yellow-600";
                if (name.includes("regional") || name.includes("secretary"))
                    return "text-gray-800";
                return "text-gray-600";
              };
              const colorClass = getTabColor(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedFilter(cat.key)}
                  className={`flex-shrink-0 px-5 py-2 rounded-t-xl font-semibold transition-all border ${
                    selectedFilter === cat.key
                      ? `bg-white shadow-md border-gray-300 border-b-white text-[#011638]`
                      : `${colorClass} border-gray-500 hover:shadow-sm hover:opacity-50`
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Members Table */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-xxl p-6 pt-4 space-y-6">
            <div className="flex items-center justify-between gap-4 mb-4">
                
                {/* Name Search */}
                <div className="flex-1 relative">
                <input
                    type="text"
                    placeholder="Search member..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
                />
                <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                {/* import */}
                <label
                    htmlFor="import-members"
                    className="px-4 py-2 bg-white border-2 border-[#011638] text-[#011638] rounded-xl cursor-pointer hover:bg-[#f0f4f8] transition whitespace-nowrap"
                >
                    Import Members
                </label>
                <input
                    type="file"
                    id="import-members"
                    accept=".csv"
                    className="hidden"
                    onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const text = await file.text();
                    const rows = text.split("\n").filter(Boolean);
                    const headers = rows[0].split(",");
                    const importedMembers: Member[] = rows.slice(1).map((row) => {
                        const values = row.split(",");
                        const memberObj: any = {};
                        headers.forEach((h, i) => {
                        memberObj[h.trim()] = values[i]?.trim();
                        });
                        return memberObj as Member;
                    });
                    setMembers(importedMembers);
                    }}
                />

                {/* export */}
                <button
                    onClick={() => {
                    if (!members.length) return;
                    const headers = Object.keys(members[0]);
                    const csvContent = [
                        headers.join(","),
                        ...members.map((m) =>
                        headers.map((h) => (m as any)[h]).join(","),
                        ),
                    ].join("\n");
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "members.csv";
                    a.click();
                    URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-white border-2 border-[#011638] text-[#011638] rounded-xl hover:bg-[#f0f4f8] transition whitespace-nowrap"
                >
                    Export Members
                </button>
                </div>
            </div>

            {/* grid start */}
            <div className="grid grid-cols-3 font-semibold text-[#011638]/70 px-4">
              <span>Name</span>
              <span>Committee</span>
              <span>Role</span>
            </div>

            <div className="space-y-4">
              {paginatedMembers.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-6">
                  No members found 👀
                </p>
              ) : (
                paginatedMembers.map((member) => {
                  const commName =
                    typeof member.comm === "number"
                      ? committees.find((c) => c.id === member.comm)
                          ?.comm_name || ""
                      : member.comm;

                  return (
                    <div
                      key={member.id}
                      className="grid grid-cols-3 items-center gap-4 bg-white/80 border shadow-lg px-4 py-3 rounded-xl hover:shadow-xl transition"
                    >
                      <span className="font-bold text-[#141414]">
                        {member.mem_lname}, {member.mem_fname}
                      </span>
                      <div
                        className={`${getCommitteeStyle(commName)} font-normal rounded-xl`}
                      >
                        <CommitteeDropdown
                          value={member.comm}
                          options={committees.map((c) => ({
                            label: c.comm_name,
                            value: c.id,
                          }))}
                          onChange={(val) =>
                            handleCommitteeChange(member.id, val)
                          }
                        />
                      </div>
                      <Dropdown
                        value={member.role}
                        options={[
                          { label: "Member", value: "member" },
                          { label: "Admin", value: "admin" },
                          { label: "Superadmin", value: "superadmin" },
                        ]}
                        onChange={(val) =>
                          handleRoleChange(member.id, val as string)
                        }
                        styleClass={getRoleStyle(member.role)}
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* pagination */}
{totalPages > 1 && (
  <nav className="flex justify-center items-center space-x-2 mt-8 mb-4">

    {/* Prev button */}
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      disabled={currentPage === 1}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        currentPage === 1
          ? "text-[#94a3b8]"
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
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`min-w-[40px] px-3 py-2 rounded-lg text-sm transition ${
            page === currentPage
              ? "bg-[#011638] text-white font-bold"
              : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638]"
          }`}
        >
          {page}
        </button>
      ))}
    </div>

    {/* Next button */}
    <button
      onClick={() =>
        setCurrentPage((p) => Math.min(p + 1, totalPages))
      }
      disabled={currentPage === totalPages}
      className={`px-3 py-2 rounded-lg text-sm transition ${
        currentPage === totalPages
          ? "text-[#94a3b8]"
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

            {/* save Changes  */}
            <div className="flex justify-end pt-4">
              <button
                disabled={!hasChanges}
                onClick={() => setShowConfirm(true)}
                className={`px-8 py-3 rounded-xl font-semibold shadow-xl transition ${
                  hasChanges
                    ? "bg-[#011638] text-white hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* confirm  */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-[350px] text-center">
            <h2 className="text-xl font-bold text-[#011638] mb-2">
              Save Changes?
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to apply all updates?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#011638] text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
