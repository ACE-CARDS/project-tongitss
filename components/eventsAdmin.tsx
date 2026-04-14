"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function EventsAdmin() {
  const supabase = createClient();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState("ALL");

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_deleted", false)
      .order("start_date", { ascending: false });

    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetFilters = () => {
    setSelectedStatuses([]);
    setSelectedYears([]);
    setLocationFilter("ALL");
    setSearchQuery("");
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleYear = (year: string) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const uniqueYears = Array.from(new Set(events.map((e) => e.year))).sort().reverse();
  const uniqueLocations = Array.from(new Set(events.map((e) => e.location))).sort();

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          event.short_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(event.status);
    const matchesYear = selectedYears.length === 0 || selectedYears.includes(event.year);
    const matchesLocation = locationFilter === "ALL" || event.location === locationFilter;
    return matchesSearch && matchesStatus && matchesYear && matchesLocation;
  });

  const handleDelete = async (id: number, title: string) => {
    if (confirm(`Hide "${title}" from public view?`)) {
      const { error } = await supabase.from("events").update({ is_deleted: true }).eq("id", id);
      if (!error) fetchEvents();
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-oswald font-bold text-[#011638] uppercase tracking-tight">Admin Event Management</h1>
        <p className="text-slate-500 text-sm font-ubuntu-mono">Manage and moderate all event schedules</p>
      </div>

      <div className="flex gap-2 items-center relative">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#011638] text-white font-bold text-sm hover:bg-[#0b1763] transition-all shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
          <span>Filters</span>
        </button>

        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#011638] outline-none text-sm font-ubuntu-mono"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {/* MODAL POPUP */}
        {showFilters && (
          <div 
            ref={filterRef}
            className="absolute top-14 left-0 z-[100] w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[#011638]">Filter Events</h2>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-[#011638] mb-3">Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['UPCOMING', 'RSVP OPEN', 'COMPLETED'].map(status => (
                    <div 
                      key={status} 
                      onClick={() => toggleStatus(status)}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${selectedStatuses.includes(status) ? 'bg-[#011638] border-[#011638]' : 'border-slate-300'}`}>
                        {selectedStatuses.includes(status) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                      </div>
                      <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-600">{status}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-[#011638] mb-2">Location</h3>
                <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="w-full p-2 border rounded-lg text-sm">
                  <option value="ALL">All Locations</option>
                  {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </section>

              <section>
                <h3 className="text-sm font-bold text-[#011638] mb-3">Publication Years</h3>
                <div className="border border-[#011638] rounded-xl p-3 max-h-32 overflow-y-auto space-y-2">
                  {uniqueYears.map(year => (
                    <div key={year} onClick={() => toggleYear(year)} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${selectedYears.includes(year) ? 'bg-[#011638] border-[#011638]' : 'border-slate-300'}`}>
                        {selectedYears.includes(year) && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                      </div>
                      <span className="text-sm font-medium text-slate-600">{year}</span>
                    </div>
                  ))}
                </div>
              </section>

              <button onClick={resetFilters} className="w-full bg-[#2546ad] text-white py-2.5 rounded-lg font-bold hover:bg-[#1a3480] transition-colors">Reset Filter</button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[#011638] uppercase text-[10px] font-black tracking-widest">
              <th className="p-4">Event</th>
              <th className="p-4">Time & Place</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-ubuntu-mono">
            {filteredEvents.map((event) => (
              <tr key={event.id} className="border-b border-slate-50 hover:bg-slate-50/80">
                <td className="p-4">
                  <span className="font-bold text-[#011638] block">{event.title}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{event.short_title}</span>
                </td>
                <td className="p-4">
                  <span className="text-slate-600 block font-bold">{event.date}</span>
                  <span className="text-slate-400 text-xs">📍 {event.location}</span>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black ${event.status === 'COMPLETED' ? 'bg-slate-100 text-slate-500' : 'bg-[#fef9c3] text-[#854d0e]'}`}>
                    {event.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <Link href={`/dashboard/edit/event/${event.id}`} className="text-[#011638] hover:scale-125 transition-transform">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                    <button onClick={() => handleDelete(event.id, event.title)} className="text-red-500 hover:scale-125 transition-transform">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}