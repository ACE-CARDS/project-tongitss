//Ctrl+F niyo nalang "CHANGE AY" to know where mga ichchange ay kasi naka filter yan based don
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { useUser } from "@/components/context/userContext";
import BackButton from "@/components/backButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Member = {
  id: number;
  mem_fname: string;
  mem_lname: string;
  mem_minit: string;
  comm: number | string;
};

type Committee = {
  id: number;
  comm_name: string;
};

export default function MembersPage() {
  const supabase = createClient();

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [members, setMembers] = useState<Member[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchName, setSearchName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [importedMembers, setImportedMembers] = useState<Member[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: memberData } = await supabase
        .from("member")
        .select("*")
        .eq("acadyear", "AY 2025-2026") //CHANGE AY here yung year thnx
        .eq("is_active", true);

      const { data: committeeData } = await supabase
        .from("committee")
        .select("*")
        .order("id", { ascending: true });

      if (memberData) {
        setMembers(memberData);
        setOriginalMembers(memberData);
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

  const hasChanges =
  importedMembers.length > 0 ||
  members.some((m, i) => {
    const o = originalMembers[i];
    return !o || m.comm !== o.comm;
  });

  const handleCommitteeChange = (
    id: number,
    newCommitteeId: number | string,
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, comm: newCommitteeId } : m)),
    );
  };

  const handleSave = async () => {
    setShowConfirm(false);
  
    try {
      const importedNew = members.filter((m: any) => m.isImported);
      const existing = members.filter((m: any) => !m.isImported); 
      const DEFAULT_ACADYEAR = "AY 2025-2026";
      const DEFAULT_COMM = 23;
      const DEFAULT_SCHOL_TYPE = "Merit";
      const DEFAULT_SCHOL_YEAR = 2023;
      const DEFAULT_SCHOOL = 1;
      
      if (importedNew.length > 0) {
        const insertPayload = importedNew.map((m, index) => ({
          mem_fname: m.mem_fname,
          mem_lname: m.mem_lname,
          mem_minit: m.mem_minit,
          role: m.role,
      
          comm: m.comm ?? DEFAULT_COMM,
      
          mem_schol_type: m.mem_schol_type?.trim() || DEFAULT_SCHOL_TYPE,
          mem_schol_year: m.mem_schol_year ?? DEFAULT_SCHOL_YEAR,
          school: m.school ?? DEFAULT_SCHOOL,
      
          is_active: m.is_active ?? true,
      
          mem_email:
            m.mem_email?.trim() ||
            `temp_${Date.now()}_${index}@example.com`,
      
          acadyear: m.acadyear?.trim() || DEFAULT_ACADYEAR,
        }));
      
        const { data, error } = await supabase
          .from("member")
          .insert(insertPayload)
          .select();
      
        console.log("INSERT DATA:", data);
        console.log("INSERT ERROR:", error);
      
        if (error) {
          console.error("Insert error:", error);
          return;
        }
      }

      if (existing.length > 0) {
        const updates = existing.map((m) =>
          supabase
            .from("member")
            .update({
              comm: m.comm,
            })
            .eq("id", m.id)
        );
      
        await Promise.all(updates);
      }
  
        const { data } = await supabase
        .from("member")
        .select("*")
        .eq("acadyear", "AY 2025-2026");

        if (data) {
        const cloned = structuredClone(data);
        setMembers(cloned);
        setOriginalMembers(structuredClone(cloned));
        setImportedMembers([]); 
        }
        
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
            } catch (error) {
            console.error(error);
            }
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
                  className={`${getCommitteeStyle(o.label)} px-3 py-2 cursor-pointer hover:opacity-80`}
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

    const [deleteMember, setDeleteMember] = useState<Member | null>(null);
    
      const handleDeleteConfirm = async () => {
        if (!deleteMember) return;
      
        try {
          const { error } = await supabase
            .from("member")
            .update({ is_active: false }) 
            .eq("id", deleteMember.id);
      
          if (error) throw error;
      
          setMembers((prev) =>
            prev.filter((m) => m.id !== deleteMember.id)
          );
      
          setOriginalMembers((prev) =>
            prev.filter((m) => m.id !== deleteMember.id)
          );
      
          setDeleteMember(null);
        } catch (err) {
          console.error("Soft delete error:", err);
          alert("Failed to remove member.");
        }
      };
    
  
    //for edit
    const [editMember, setEditMember] = useState<Member | null>(null);
    const [editForm, setEditForm] = useState({
      mem_fname: "",
      mem_lname: "",
      mem_minit: "",
    });
  
    const handleEditSave = async () => {
      if (!editMember) return;
    
      try {
        if ((editMember as any).isImported) {
          setMembers((prev) =>
            prev.map((m) =>
              m.id === editMember.id
                ? { ...m, ...editForm }
                : m
            )
          );
          setEditMember(null);
          return;
        }
    
        const { error } = await supabase
          .from("member")
          .update({
            mem_fname: editForm.mem_fname,
            mem_lname: editForm.mem_lname,
            mem_minit: editForm.mem_minit,
          })
          .eq("id", editMember.id);
    
        if (error) {
          console.error("Edit error:", error);
          alert(error.message);
          return;
        }
    
        setMembers((prev) =>
          prev.map((m) =>
            m.id === editMember.id
              ? { ...m, ...editForm }
              : m
          )
        );
    
        setOriginalMembers((prev) =>
          prev.map((m) =>
            m.id === editMember.id
              ? { ...m, ...editForm }
              : m
          )
        );
    
        setEditMember(null);
    
      } catch (err) {
        console.error(err);
      }
    };

    const [showExportOptions, setShowExportOptions] = useState(false);
    
      const handleExportPDF = () => {
        const doc = new jsPDF({ orientation: "landscape" });
      
        const img = new Image();
        img.src = "/assets/logos/ACE CARDS logo.png";
      
        img.onload = () => {
          supabase
            .from("member")
            .select(`
              mem_fname,
              mem_lname,
              mem_minit,
              mem_email,
              mem_schol_type,
              mem_schol_year,
              school,
              comm,
              is_active,
              committee:comm (comm_name),
              school_rel:school (school_name)
            `)
            .eq("acadyear", "AY 2025-2026") //change ay
            .then(({ data, error }) => {
              if (error || !data) return;
      
              // sort
              const sorted = [...data].sort((a: any, b: any) =>
                `${a.mem_lname} ${a.mem_fname}`.localeCompare(
                  `${b.mem_lname} ${b.mem_fname}`
                )
              );
      
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
    
              // logo
              doc.addImage(
                img,
                "PNG",
                10,
                8,
                20,
                20
              );
    
              // titel
              doc.setTextColor(1, 22, 56);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(30);
              doc.text("MEMBERSHIP DIRECTORY", 37, 21);
    
              // ay
              doc.setTextColor(1, 22, 56);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(15);
              doc.text("AY 2025–2026", pageWidth - 10, 20, { //change AY
                align: "right",
              });
      
              const tableData = sorted.map((m: any) => [
                `${m.mem_lname}, ${m.mem_fname} ${m.mem_minit || ""}`,
                m.committee?.comm_name || "",
                m.mem_email,
                m.mem_schol_type,
                m.mem_schol_year,
                m.school_rel?.school_name || m.school,
              ]);
    
              // legend 
              doc.setFont("helvetica", "italic");
              doc.setFontSize(9);
              doc.setTextColor(160, 160, 160);
    
              doc.text(
                "* Italicized and grayed out — Inactive",
                pageWidth - 10, 
                32,
                { align: "right" }
              );
    
              const pageNumbers: number[] = [];
      
              autoTable(doc, {
                startY: 35,
                margin: { left: 8, right: 8 },
                theme: "grid",
      
                head: [[
                  "Name",
                  "Committee",
                  "Email",
                  "Scholarship Type",
                  "Year of Scholarship",
                  "University",
                ]],
      
                body: tableData,
      
                styles: {
                  fontSize: 9,
                  cellPadding: 3,
                  textColor: 30,
                  lineColor: [1, 22, 56], // borders
                  lineWidth: 0.2,
                },
      
                headStyles: {
                  fillColor: [1, 22, 56],
                  textColor: 255,
                  fontSize: 10,
                  halign: "center",
                  valign: "middle", 
                },
      
                alternateRowStyles: {
                  fillColor: [245, 247, 250],
                },
      
                columnStyles: {
                  0: { cellWidth: 60 }, //name
                  1: { cellWidth: 38 }, //comm
                  2: { cellWidth: 60 }, //email
                  3: { cellWidth: 35, halign: "center" }, //schol type
                  4: { cellWidth: 28, halign: "center" }, //schol year
                  5: { cellWidth: 60 }, // uni
                },
    
                didParseCell: function (data) {
                  const row = data.row.index;
                  const member = sorted[row];
                
                  if (member && member.is_active === false) {
                    data.cell.styles.textColor = [160, 160, 160];
                    data.cell.styles.fillColor = [245, 245, 245];
                    data.cell.styles.fontStyle = "italic"; 
                  }
                },
      
                didDrawPage: () => {
                  doc.saveGraphicsState();
                  doc.setGState(new doc.GState({ opacity: 0.06 }));
      
                  doc.addImage(
                    img,
                    "PNG",
                    pageWidth / 2 - 80,
                    pageHeight / 2 - 75,
                    160,
                    160
                  );
      
                  doc.restoreGraphicsState();
    
                  const now = new Date();
    
                  const formattedDateTime = now.toLocaleString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
      
                  // footer
                  doc.setFontSize(8);
                  doc.setTextColor(120);
    
                  doc.text(
                    `Generated automatically from ACE CARDS Member System at ${formattedDateTime}`,
                    10,
                    pageHeight - 10
                  );
                },
              });
    
              const totalPages = doc.getNumberOfPages();
    
              for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
    
                doc.setFontSize(8);
                doc.setTextColor(120);
    
                const now = new Date();
    
                            const formattedDateTime = now.toLocaleString("en-PH", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            });
    
                doc.text(
                  `Generated automatically from ACE CARDS Member System at ${formattedDateTime}`,
                  10,
                  pageHeight - 10
                );
    
                doc.text(
                  `Page ${i} of ${totalPages}`,
                  pageWidth - 10,
                  pageHeight - 10,
                  { align: "right" }
                );
              }
      
              doc.save("Membership Directory (2025-2026).pdf");
            });
        };
      };
    
      const handleExportCSV = async () => {
        const { data, error } = await supabase
          .from("member")
          .select("*")
          .eq("acadyear", "AY 2025-2026");
      
        if (error || !data) return;
      
        const sorted = [...data].sort((a: any, b: any) => {
          const nameA = `${a.mem_lname} ${a.mem_fname}`.toLowerCase();
          const nameB = `${b.mem_lname} ${b.mem_fname}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });
      
        const allKeys = Object.keys(sorted[0]);
      
        const headers = allKeys;
      
        const rows = sorted.map((m: any) =>
          allKeys.map((key) => {
            const value = m[key];
      
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
      
            return value;
          }),
        );
      
        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.join(",")),
        ].join("\n");
      
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
      
        const url = URL.createObjectURL(blob);
      
        const a = document.createElement("a");
        a.href = url;
        a.download = "Membership Directory (2025-2026).csv";
        a.click();
      
        URL.revokeObjectURL(url);
      };
    
    const [pendingImport, setPendingImport] = useState<any[]>([]);
const [showImportConfirm, setShowImportConfirm] = useState(false);

const handleConfirmImport = async () => {
  try {
    const { data, error } = await supabase
      .from("member")
      .upsert(pendingImport, {
        onConflict: "mem_email",
      })
      .select();

    if (error) {
      console.error(error);
      alert("Import failed");
      return;
    }

    const { data: refreshed } = await supabase
      .from("member")
      .select("*")
      .eq("acadyear", "AY 2025-2026")
      .eq("is_active", true);

    if (refreshed) {
      setMembers(structuredClone(refreshed));
      setOriginalMembers(structuredClone(refreshed));
    }

    setPendingImport([]);
    setShowImportConfirm(false);
  } catch (err) {
    console.error(err);
  }
};


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
              Assign members their committees.
            </p>
          </div>

          {/* committee tabs */}
          <div className="flex gap-2 flex-nowrap overflow-x-auto">
            {committeeCategories.map((cat) => {
              const getTabColor = (key: string) => {
                const name = key.toLowerCase();
                if (name.includes("internal")) return "text-purple-800";
                if (name.includes("external")) return "text-green-800";
                if (name.includes("education")) return "text-red-800";
                if (name.includes("finance")) return "text-blue-900";
                if (name.includes("publicity")) return "text-pink-800";
                if (name.includes("logistics")) return "text-yellow-600";
                if (name.includes("regional") || name.includes("secretary"))
                  return "text-gray-800";
                return "text-gray-600";
              };
              const colorClass = getTabColor(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedFilter(cat.key)}
                  className={`flex-shrink-0 px-5 py-2 rounded-t-xl font-normal transition-all border ${
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              {/* Name Search */}
              <div className="w-full sm:flex-1 relative">
                <input
                  type="text"
                  placeholder="Search member..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm sm:text-base border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
                />
                <svg
                  className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                {/* import */}
                <label
                  htmlFor="import-members"
                  className="px-4 py-2 bg-[#011638] border-2 border-[#011638] text-white rounded-xl hover:bg-[#f0f4f8] transition whitespace-nowrap hover:text-[#011638] text-center"
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
                  
                    const parseCSV = (text: string) => {
                      const rows: string[][] = [];
                      let current: string[] = [];
                      let value = "";
                      let insideQuotes = false;
                  
                      for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const next = text[i + 1];
                  
                        if (char === '"' && insideQuotes && next === '"') {
                          value += '"';
                          i++;
                        } else if (char === '"') {
                          insideQuotes = !insideQuotes;
                        } else if (char === "," && !insideQuotes) {
                          current.push(value);
                          value = "";
                        } else if ((char === "\n" || char === "\r") && !insideQuotes) {
                          if (value || current.length) {
                            current.push(value);
                            rows.push(current);
                            current = [];
                            value = "";
                          }
                        } else {
                          value += char;
                        }
                      }
                  
                      if (value || current.length) {
                        current.push(value);
                        rows.push(current);
                      }
                  
                      return rows.filter((r) => r.length > 1);
                    };
                  
                    const rows = parseCSV(text);
                    const headers = rows[0].map((h) => h.trim());
                  
                    const DEFAULT_ACADYEAR = "AY 2025-2026";
                    const DEFAULT_COMM = 23;
                    const DEFAULT_SCHOL_TYPE = "Merit";
                    const DEFAULT_SCHOL_YEAR = 2023;
                    const DEFAULT_SCHOOL = 1;
                  
                    const parsed = rows.slice(1).map((row) => {
                      const obj: any = {};
                  
                      headers.forEach((h, i) => {
                        obj[h] = row[i]?.trim() ?? "";
                      });
                  
                      return {
                        mem_fname: obj.mem_fname || "",
                        mem_lname: obj.mem_lname || "",
                        mem_minit: obj.mem_minit || "",
                        role: obj.role || "member",
                        comm: obj.comm ? Number(obj.comm) : DEFAULT_COMM,
                        mem_schol_type: obj.mem_schol_type || DEFAULT_SCHOL_TYPE,
                        mem_schol_year: obj.mem_schol_year
                          ? Number(obj.mem_schol_year)
                          : DEFAULT_SCHOL_YEAR,
                        school: obj.school ? Number(obj.school) : DEFAULT_SCHOOL,
                        is_active: true,
                        mem_email:
                          obj.mem_email?.trim() ||
                          `temp_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`,
                        acadyear: obj.acadyear || DEFAULT_ACADYEAR,
                      };
                    });
                  
                    setPendingImport(parsed);
                    setShowImportConfirm(true);
                  
                    e.target.value = ""; 
                  }}
                />

                {/* export */}
                <button
                  onClick={() => setShowExportOptions(true)}
                  className="px-4 py-2 bg-[#011638] border-2 border-[#011638] text-white rounded-xl hover:bg-[#f0f4f8] transition whitespace-nowrap hover:text-[#011638]"
                >
                  Export Members
                </button>
              </div>
            </div>

            {/* grid start */}
            <div className="hidden sm:grid grid-cols-[1.5fr_1.5fr_0.5fr] font-semibold text-[#011638]/70 px-4">
              <span className="text-center">Name</span>
              <span className="text-center">Committee</span>
              <span className="text-center">Actions</span>
            </div>

            <div className="space-y-4">
              {paginatedMembers.length === 0 ? (
                <p className="text-center text-gray-500 text-lg py-6">
                  No members in this committee yet 👀
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
                      className="flex flex-col sm:grid sm:grid-cols-[1.5fr_1.5fr_0.5fr] gap-3 sm:gap-4 bg-white/80 border shadow-lg px-4 py-3 rounded-xl hover:shadow-xl transition"
                    >
                      <span className="font-bold text-[#141414] text-sm sm:text-base">
                      {member.mem_lname}, {member.mem_fname} {member.mem_minit}
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
                      <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditMember(member);
                          setEditForm({
                            mem_fname: member.mem_fname,
                            mem_lname: member.mem_lname,
                            mem_minit: member.mem_minit || "",
                          });
                        }}
                        className="text-[#011638] hover:scale-110 transition-transform"
                      >
                          {/* edit icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>

                        <button
                          onClick={() => setDeleteMember(member)}
                          className="text-red-500 hover:scale-110 transition-transform"
                        >
                          {/* delete icon */}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
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
                    ),
                  )}
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
                className={`px-8 py-3 rounded-2xl font-semibold shadow-xl transition ${
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

      {/* mowdals */}
      {showImportConfirm && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-[380px] text-center">

          <h2 className="text-xl font-bold text-[#011638] mb-2">
            Confirm Import
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            You are about to import{" "}
            <span className="font-semibold text-[#011638]">
              {pendingImport.length}
            </span>{" "}
            members into the database.
            <br />
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setPendingImport([]);
                setShowImportConfirm(false);
              }}
              className="px-4 py-2 rounded-xl border"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmImport}
              className="px-4 py-2 rounded-xl bg-[#011638] text-white"
            >
              Confirm Import
            </button>
          </div>
        </div>
      </div>
    )}


      {showExportOptions && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[320px] text-center">

            <h2 className="text-lg font-bold text-[#011638] mb-4">
              Export Members
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              Choose file format
            </p>

            <div className="flex flex-col gap-3">

              {/* CSV */}
              <button
                onClick={() => {
                  handleExportCSV();
                  setShowExportOptions(false);
                }}
                className="px-4 py-2 rounded-xl border hover:bg-gray-100"
              >
                Export as CSV
              </button>

              {/* PDF */}
              <button
                onClick={() => {
                  handleExportPDF();
                  setShowExportOptions(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#011638] text-white hover:opacity-90"
              >
                Export as PDF
              </button>

            </div>

            <button
              onClick={() => setShowExportOptions(false)}
              className="mt-5 text-sm text-gray-400 hover:underline"
            >
              Cancel
            </button>

          </div>
        </div>
      )}


      {deleteMember && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-[350px] text-center">

          <h2 className="text-xl font-bold text-[#011638] mb-2">
            Delete Member?
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#011638]">
              {deleteMember.mem_fname} {deleteMember.mem_lname}
            </span>
            ?
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setDeleteMember(null)}
              className="px-4 py-2 rounded-xl border"
            >
              Cancel
            </button>

            <button
              onClick={() => handleDeleteConfirm()}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    {editMember && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-[400px]">

          <h2 className="text-xl font-bold text-[#011638] mb-4">
            Edit Member
          </h2>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="First Name"
              value={editForm.mem_fname}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, mem_fname: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />

            <input
              type="text"
              placeholder="Last Name"
              value={editForm.mem_lname}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, mem_lname: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />

            <input
              type="text"
              placeholder="Middle Initial"
              value={editForm.mem_minit}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, mem_minit: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setEditMember(null)}
              className="px-4 py-2 border rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleEditSave}
              className="px-4 py-2 bg-[#011638] text-white rounded-xl"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}

      {/* confirm  */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-[350px] text-center">
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
