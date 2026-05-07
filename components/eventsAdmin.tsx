"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface EventItem {
  id: number;
  title: string;
  short_title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  location: string;
  status: string;
  year: string;
}

type SortField = "title" | "start_date" | null;
type SortOrder = "asc" | "desc" | null;

// Read more component for description
function EventDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!description) {
    return null;
  }

  if (description.length <= 100) {
    return (
      <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed break-words break-all whitespace-normal">
        {description}
      </p>
    );
  }

  return (
    <div className="w-full min-w-0">
      {!isOpen ? (
        <div className="w-full min-w-0">
          <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed line-clamp-2 break-words break-all whitespace-normal">
            {description}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors"
          >
            Read more →
          </button>
        </div>
      ) : (
        <div className="w-full min-w-0">
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed h-24 overflow-y-auto pr-2 break-words break-all whitespace-normal custom-scrollbar">
            {description}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors"
          >
            Read less ↑
          </button>
        </div>
      )}
    </div>
  );
}

// Delete confirmation popup
function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        ref={popupRef}
        className="bg-[#fbfaf8] rounded-xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
            Confirm Delete
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
            Are you sure you want to delete{" "}
            <span className="font-bold text-[#011638]">
              &quot;{title}&quot;
            </span>
            ? This action will hide it from the public view.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-oswald tracking-widest uppercase font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Bar
function SearchBar({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Search events by title..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
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
  );
}

// Main component
export default function EventsAdmin() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Reset to page 1 whenever search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortField, sortOrder]);

  useEffect(() => {
    let filtered = [...events];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.short_title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue =
          sortField === "title"
            ? a.title || ""
            : new Date(a.start_date).getTime();
        let bValue =
          sortField === "title"
            ? b.title || ""
            : new Date(b.start_date).getTime();

        if (sortField === "title") {
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredEvents(filtered);
  }, [searchTerm, events, sortField, sortOrder]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("is_deleted", false)
      .order("start_date", { ascending: false });

    setEvents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    await supabase.from("events").update({ is_deleted: true }).eq("id", id);
    setEvents(events.filter((item) => item.id !== id));
  };

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortField(null);
        setSortOrder(null);
      }
    }
  };

  const formatSchedule = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endDate = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return startDate === endDate ? startDate : `${startDate} to ${endDate}`;
  };

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 font-ubuntu-mono animate-pulse">
          Loading events...
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638] uppercase tracking-wide">
          Event Management
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">
          Manage and moderate all community event schedules
        </p>
      </div>

      {/* Search & Add Header */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Link
          href="/dashboard/add/event?from=admin"
          className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald uppercase tracking-widest whitespace-nowrap shadow-sm"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Event
        </Link>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-[#fbfaf8] rounded-xl shadow-lg border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm border border-slate-100">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-oswald font-bold text-[#011638] mb-2 uppercase tracking-wide">
            No Events Found
          </h3>
          <p className="text-[#475569] font-ubuntu-mono">
            Get started by creating your first event
          </p>
        </div>
      ) : (
        /* Event Table */
        <div className="bg-[#fbfaf8] rounded-xl shadow-lg border border-gray-200 w-full overflow-hidden flex flex-col">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-fixed w-full">
              <thead className="bg-[#011638]">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[120px]">
                    Media
                  </th>
                  <th
                    className={`px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider cursor-pointer hover:bg-[#0d21a1] transition-colors w-full ${
                      sortField === "title" && sortOrder !== null
                        ? "bg-[#0d21a1]"
                        : ""
                    }`}
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Title & Info
                      <div className="flex flex-col gap-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className={`w-3.5 h-3.5 -mb-1 ${sortField === "title" && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/50"}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                          />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className={`w-3.5 h-3.5 -mt-1 ${sortField === "title" && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/50"}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th
                    className={`px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider cursor-pointer hover:bg-[#0d21a1] transition-colors w-[220px] ${
                      sortField === "start_date" && sortOrder !== null
                        ? "bg-[#0d21a1]"
                        : ""
                    }`}
                    onClick={() => handleSort("start_date")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Schedule & Location
                      <div className="flex flex-col gap-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className={`w-3.5 h-3.5 -mb-1 ${sortField === "start_date" && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/50"}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 15.75 7.5-7.5 7.5 7.5"
                          />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className={`w-3.5 h-3.5 -mt-1 ${sortField === "start_date" && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/50"}`}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[120px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider w-[100px]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentEvents.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#fbfaf8]"}
                  >
                    {/* Image Column */}
                    <td className="px-4 py-4 text-center align-top w-[120px]">
                      <div className="flex justify-center w-full">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-24 h-24 min-w-[6rem] min-h-[6rem] shrink-0 object-cover rounded-md border border-slate-200 hover:scale-105 transition-transform duration-200 shadow-sm"
                            style={{ objectPosition: "center" }}
                          />
                        ) : (
                          <div className="w-24 h-24 min-w-[6rem] min-h-[6rem] shrink-0 bg-slate-100 flex items-center justify-center rounded-md border border-slate-200 shadow-sm">
                            <img
                              src="/assets/logos/ACE CARDS logo.png"
                              alt="ACE CARDS Logo"
                              className="w-16 h-16 object-contain opacity-50"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Description Column */}
                    <td className="px-4 py-4 align-top w-full overflow-hidden min-w-0">
                      <div className="flex flex-col h-full w-full min-w-0">
                        <div className="mb-2 w-full min-w-0">
                          <span className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-wide block leading-tight break-words break-all whitespace-normal">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block break-words break-all whitespace-normal mt-1">
                            {item.short_title}
                          </span>
                        </div>
                        <div className="w-full min-w-0">
                          {item.description ? (
                            <EventDescription description={item.description} />
                          ) : (
                            <p className="text-sm text-gray-400 italic font-ubuntu-mono">
                              No description provided
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Schedule & Location Column */}
                    <td className="px-4 py-4 text-center align-top">
                      <div className="flex flex-col items-center justify-center gap-2 h-full pt-1 w-full">
                        <div className="text-sm text-[#011638] font-bold font-ubuntu-mono whitespace-nowrap bg-slate-100 px-3 py-1 rounded border border-slate-200">
                          {formatSchedule(item.start_date, item.end_date)}
                        </div>

                        <div className="text-xs text-slate-500 font-ubuntu-mono flex items-start justify-center gap-1 mt-1 w-full max-w-[200px] mx-auto">
                          <svg
                            className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-[2px]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="break-words line-clamp-2 text-left">
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-4 py-4 text-center align-top pt-5">
                      <span
                        className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm whitespace-nowrap ${
                          item.status?.toUpperCase() === "COMPLETED"
                            ? "bg-slate-100 text-slate-500 border border-slate-200"
                            : item.status?.toUpperCase() === "ONGOING"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="px-4 py-4 whitespace-nowrap text-center align-top pt-5">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/dashboard/edit/event/${item.id}`}
                          className="text-[#0d21a1] hover:text-[#011638] transition-colors"
                          title="Edit Event"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedEvent(item);
                            setDeletePopupOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Event"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 font-ubuntu-mono w-full">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
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

          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none custom-scrollbar pb-2 sm:pb-0">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 shrink-0 rounded-xl font-bold transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#011638] text-white shadow-md"
                    : "text-[#475569] hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
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
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={() => setDeletePopupOpen(false)}
        onConfirm={() => {
          if (selectedEvent) {
            handleDelete(selectedEvent.id);
            setDeletePopupOpen(false);
            setSelectedEvent(null);
          }
        }}
        title={selectedEvent?.title || "this event"}
      />
    </div>
  );
}
