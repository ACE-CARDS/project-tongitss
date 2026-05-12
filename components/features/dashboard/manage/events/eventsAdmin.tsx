"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Pagination from "@/components/ui/pagination";

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

function EventDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!description) return null;

  if (description.length <= 120) {
    return <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed break-words">{description}</p>;
  }

  return (
    <div className="w-full mt-1">
      {!isOpen ? (
        <div>
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-2 break-words" title={description}>{description}</p>
          <button onClick={() => setIsOpen(true)} className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors">
            Read more →
          </button>
        </div>
      ) : (
        <div>
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed max-h-32 overflow-y-auto pr-2 break-words custom-scrollbar">
            {description}
          </div>
          <button onClick={() => setIsOpen(false)} className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors">
            Read less ↑
          </button>
        </div>
      )}
    </div>
  );
}

function DeleteConfirmPopup({ isOpen, onClose, onConfirm, title }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; }) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) onClose();
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[3px] bg-black/30 flex items-center justify-center z-50 p-4">
      <div ref={popupRef} className="bg-[#fbfaf8] rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="bg-[#011638] px-6 py-4">
          <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">Confirm Delete</h3>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
            Are you sure you want to delete <span className="font-bold text-[#011638]">&quot;{title}&quot;</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] transition-colors">Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-oswald tracking-widest uppercase font-bold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchBar({ searchTerm, onSearchChange }: { searchTerm: string; onSearchChange: (value: string) => void; }) {
  return (
    <div className="relative flex-1">
      <input type="text" placeholder="Search events by title..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
      <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

export default function EventsAdmin() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const itemsPerPage = 5;

  const updateUrl = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentPage !== 1) {
      updateUrl({ page: "1" });
    }
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
        let aValue = sortField === "title" ? a.title || "" : new Date(a.start_date).getTime();
        let bValue = sortField === "title" ? b.title || "" : new Date(b.start_date).getTime();

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
    const { data } = await supabase.from("events").select("*").eq("is_deleted", false).order("start_date", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      await supabase.from("events").update({ is_deleted: true }).eq("id", selectedEvent.id);
      setEvents(events.filter((item) => item.id !== selectedEvent.id));
      setDeletePopupOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else if (sortOrder === "desc") { setSortField(null); setSortOrder(null); }
    }
  };

  const formatSchedule = (start: string, end: string) => {
    if (!start) return "";
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : d1;
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    if (!end || start === end) return d1.toLocaleDateString('en-US', opts);
    return `${d1.toLocaleDateString('en-US', opts)} to ${d2.toLocaleDateString('en-US', opts)}`;
  };

  const totalItems = filteredEvents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  const emptyRowsCount = itemsPerPage - currentEvents.length;

  if (loading) {
    return (
      <div className="text-center py-12 flex-1 flex flex-col justify-center">
        <p className="text-gray-500 font-ubuntu-mono animate-pulse">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden flex flex-col min-h-screen">
      
      <div className="mb-8 flex justify-between sm:items-end items-center sm:flex-row flex-col sm:gap-0 gap-3">
        <div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638]">Event Management</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-1">Manage and moderate all community event schedules</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center shrink-0">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <Link href="/dashboard/add/event?from=admin" className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] flex items-center justify-center gap-2 font-oswald">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> 
          Add Event
        </Link>
      </div>

      <div className="flex flex-col flex-1 pb-10">
        <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-fixed w-full border-collapse">
              
              <thead className="bg-[#011638]">
                <tr>
                  <th className="w-[15%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Media</th>
                  <th className={`w-[35%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider cursor-pointer hover:bg-[#0d21a1] transition-colors ${sortField === "title" ? "bg-[#0d21a1]" : ""}`} onClick={() => handleSort("title")}>
                    <div className="flex items-center justify-center gap-2">Title & Info
                      <div className="flex flex-col gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mb-1 ${sortField === "title" && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mt-1 ${sortField === "title" && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                      </div>
                    </div>
                  </th>
                  <th className={`w-[25%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider cursor-pointer hover:bg-[#0d21a1] transition-colors ${sortField === "start_date" ? "bg-[#0d21a1]" : ""}`} onClick={() => handleSort("start_date")}>
                    <div className="flex items-center justify-center gap-2">Duration & Location
                      <div className="flex flex-col gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mb-1 ${sortField === "start_date" && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-3.5 h-3.5 -mt-1 ${sortField === "start_date" && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/30"}`}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                      </div>
                    </div>
                  </th>
                  <th className="w-[15%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Status</th>
                  <th className="w-[10%] px-4 py-3 text-center text-xs font-oswald font-bold text-[#eff0f2] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center font-ubuntu-mono text-gray-400">No events found.</td>
                  </tr>
                ) : (
                  currentEvents.map((item, index) => {
                    const dateStr = formatSchedule(item.start_date, item.end_date);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors h-[160px]">
                        
                        {/* Media */}
                        <td className="px-4 py-2 align-middle text-center border-b border-gray-100">
                          <div className="flex justify-center">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.title} className="w-16 h-16 shrink-0 object-cover rounded-md border border-slate-200 shadow-sm" style={{ objectPosition: "center" }} />
                            ) : (
                              <div className="w-16 h-16 shrink-0 bg-slate-100 flex items-center justify-center rounded-md border border-slate-200 shadow-sm">
                                <img src="/assets/logos/ACE CARDS logo.png" alt="ACE CARDS Logo" className="w-8 h-8 object-contain opacity-50" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Description */}
                        <td className="px-4 py-2 align-middle w-full border-b border-gray-100">
                          <div className="font-semibold text-[#011638] text-sm line-clamp-1 break-words" title={item.title}>
                            {item.title}
                          </div>
                          {item.short_title && (
                            <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 truncate" title={item.short_title}>
                              {item.short_title}
                            </div>
                          )}
                          <EventDescription description={item.description} />
                        </td>

                        {/* Schedule & Location */}
                        <td className="px-4 py-2 align-middle text-center border-b border-gray-100">
                          <div className="flex flex-col items-center gap-2 max-w-[220px] mx-auto">
                            <span className="text-sm font-bold text-[#011638] font-ubuntu-mono w-full truncate" title={dateStr}>
                              {dateStr}
                            </span>
                            
                            {item.location && (
                              <div className="flex items-start justify-center gap-1.5 w-full text-slate-500" title={item.location}>
                                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                <span className="text-xs font-ubuntu-mono text-left line-clamp-3 leading-tight break-words">{item.location}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-2 align-middle text-center border-b border-gray-100">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm whitespace-nowrap ${item.status?.toUpperCase() === "COMPLETED" ? "bg-slate-100 text-slate-500 border border-slate-200" : item.status?.toUpperCase() === "ONGOING" ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-green-100 text-green-700 border border-green-200"}`}>
                            {item.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2 align-middle text-center border-b border-gray-100">
                          <div className="flex items-center justify-center gap-3">
                            <Link href={`/dashboard/edit/event/${item.id}`} className="text-[#0d21a1] hover:scale-110 transition-transform" title="Edit Event">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                            </Link>
                            <button onClick={() => { setSelectedEvent(item); setDeletePopupOpen(true); }} className="text-red-600 hover:scale-110 transition-transform" title="Delete Event">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}

                {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-[160px]">
                    <td colSpan={5} className="px-4 py-4 text-transparent select-none border-b border-transparent">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && totalPages > 1 && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-2 gap-2">
              <p className="text-[#475569] font-ubuntu-mono text-xs mb-2">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
              </p>
              <p className="text-[#475569] font-ubuntu-mono text-sm">
                Page {validCurrentPage} of {totalPages || 1}
              </p>
            </div>
            
            <Pagination 
              currentPage={validCurrentPage} 
              totalPages={totalPages || 1} 
            />
          </>
        )}
      </div>

      <DeleteConfirmPopup isOpen={deletePopupOpen} onClose={() => setDeletePopupOpen(false)} onConfirm={handleDelete} title={selectedEvent?.title || "this event"} />
    </div>
  );
}