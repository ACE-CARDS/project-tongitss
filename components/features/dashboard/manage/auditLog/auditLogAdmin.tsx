"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

type AuditLog = {
  id: number;
  action: string;
  details: string;
  user: string;
  user_email: string;
  table_name: string;
  created_at: string;
};

export default function AuditLogAdmin() {
  const supabase = createClient();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDetails, setExpandedDetails] = useState<number[]>([]);
  const ITEMS_PER_PAGE = 4;

  const toggleDetails = (id: number) => {
    setExpandedDetails((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const shouldShowReadMore = (text: string) => text.length > 120;

  const actions = [
    { label: "All Actions", key: "all" },
    { label: "Create", key: "Create" },
    { label: "Update", key: "Update" },
    { label: "Delete", key: "Delete" },
    { label: "Import", key: "Import" },
    { label: "Export", key: "Export" },
    { label: "Archive", key: "Archive" },
  ];

  const tables = [
    { label: "All Tables", key: "all" },
    { label: "Member", key: "member" },
    { label: "Landing Page Announcement", key: "announce_landing" },
    { label: "Member Announcement", key: "announce_dash" },
    { label: "Member Application", key: "announce_memapp" },
    { label: "Event", key: "events" },
    { label: "News", key: "news_media" },
    { label: "Survey", key: "survey" },
    { label: "Thesis", key: "thesis" },
    { label: "School", key: "school" },
    { label: "Category", key: "r_category" },
  ];

  useEffect(() => {
    const fetchAuditLogs = async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        console.error("Error fetching audit logs:", error);
        return;
      }

      if (data) {
        setAuditLogs(data);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };

    fetchAuditLogs();
  }, []);

  //pagination
  useEffect(() => {
    let filtered = auditLogs;

    if (selectedAction !== "all") {
      filtered = filtered.filter((log) => log.action === selectedAction);
    }

    if (selectedTable !== "all") {
      filtered = filtered.filter((log) => log.table_name === selectedTable);
    }

    if (searchTerm.trim()) {
      const lowercaseTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((log) => {
        return (
          log.details.toLowerCase().includes(lowercaseTerm) ||
          log.user.toLowerCase().includes(lowercaseTerm) ||
          log.user_email.toLowerCase().includes(lowercaseTerm) ||
          log.action.toLowerCase().includes(lowercaseTerm)
        );
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [auditLogs, selectedAction, selectedTable, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "Create":
        return "text-green-700 bg-green-50";
      case "Update":
        return "text-indigo-700 bg-indigo-50";
      case "Delete":
        return "text-red-700 bg-red-50";
      case "Import":
        return "text-orange-700 bg-orange-50";
      case "Export":
        return "text-purple-700 bg-purple-50";
      case "Archive":
        return "text-pink-700 bg-pink-50";
      default:
        return "text-slate-700 bg-slate-50";
    }
  };

  const getTableColor = (tableName: string) => {
    const name = tableName.toLowerCase();
    if (name.includes("member")) return "text-mist-700";
    if (name.includes("announce_landing")) return "text-yellow-700";
    if (name.includes("announce_dash")) return "text-olive-700";
    if (name.includes("announce_memapp")) return "text-rose-700";
    if (name.includes("events")) return "text-cyan-700";
    if (name.includes("news_media")) return "text-amber-700";
    if (name.includes("survey")) return "text-teal-700";
    if (name.includes("thesis")) return "text-violet-700";
    return "text-gray-700";
  };

  const getDropdownStyle = (_label: string) => "text-[#011638]";

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
          className="w-full px-3 py-2 border rounded-xl text-left shadow-sm font-normal relative cursor-pointer"
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${
              open ? "rotate-225" : "rotate-45"
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-[10000] mt-1 bg-white border rounded-xl shadow-lg overflow-hidden w-full">
            <div className="custom-scrollbar-blue overflow-auto w-full max-h-60">
              <ul className="">
                {filteredOptions.map((o) => (
                  <li
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`${getDropdownStyle(o.label)} px-3 py-2 cursor-pointer hover:opacity-50`}
                  >
                    {o.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col">
      <main className="flex-1">
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">
              Activity Log
            </h1>
            <p className="text-[#475569] font-ubuntu-mono mt-1">
              View recent system activities and changes
            </p>
          </div>
          <div className=" p-6 mb-6 flex flex-col md:flex-row md:items-end gap-4 md:mt-[-8]">
            {" "}
            {/* searchbar */}
            <div className="w-full md:w-1/2 relative">
              <input
                type="text"
                placeholder="Search by action, details, user or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 text-sm border border-[#011638] rounded-[10px] focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
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
            {/* filter */}
            <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* by actions */}
              <div>
                <label className="block text-xs font-semibold text-[#011638] mb-2">
                  Filter by Action
                </label>
                <CommitteeDropdown
                  value={selectedAction}
                  options={actions.map((action) => ({
                    label: action.label,
                    value: action.key,
                  }))}
                  onChange={(val) => setSelectedAction(String(val))}
                />
              </div>

              {/* by tables */}
              <div>
                <label className="block text-xs font-semibold text-[#011638] mb-2">
                  Filter by Table
                </label>
                <CommitteeDropdown
                  value={selectedTable}
                  options={tables.map((table) => ({
                    label: table.label,
                    value: table.key,
                  }))}
                  onChange={(val) => setSelectedTable(String(val))}
                />
              </div>
            </div>
          </div>

          {/* audit log mismo */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-300 rounded-xl shadow-md p-6 space-y-4">
            {totalPages > 1 && (
              <nav className="flex justify-center items-center space-x-2 mt-8 mb-4">
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

                <div className="flex items-center space-x-1">
                  {(() => {
                    const pages: (number | string)[] = [];

                    if (totalPages <= 4) {
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
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
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-gray-500"
                        >
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

            <div className="text-sm text-gray-600 pt-2">
              Showing {paginatedLogs.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length)} of{" "}
              {filteredLogs.length} results
            </div>

            {isLoading ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-gray-500">Loading activity logs...</div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="min-h-[300px] flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <p className="text-lg font-semibold">No activity detected</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[720px] overflow-y-auto pr-2">
                {paginatedLogs.map((log) => {
                  const expanded = expandedDetails.includes(log.id);
                  const showReadMore = shouldShowReadMore(log.details);

                  return (
                    <div
                      key={log.id}
                      className="border border-gray-200 rounded-lg p-4 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}
                            >
                              {log.action}
                            </span>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTableColor(log.table_name)} bg-gray-100`}
                            >
                              {log.table_name}
                            </span>
                          </div>

                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <p
                              className="text-sm text-gray-700 break-words transition-all"
                              style={
                                expanded
                                  ? { overflow: "hidden" }
                                  : {
                                      display: "-webkit-box",
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }
                              }
                            >
                              {log.details}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 text-xs text-gray-500">
                            <p>
                              <span className="font-semibold text-gray-600">
                                User:
                              </span>{" "}
                              {log.user}
                            </p>
                            <p>
                              <span className="font-semibold text-gray-600">
                                Email:
                              </span>{" "}
                              {log.user_email}
                            </p>
                            <p>
                              <span className="font-semibold text-gray-600">
                                Time:
                              </span>{" "}
                              {formatDate(log.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right text-xs text-gray-400">
                          <p>ID: {log.id}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
