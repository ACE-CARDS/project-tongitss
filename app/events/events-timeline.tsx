"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function EventsTimeline() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeYear, setActiveYear] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_deleted", false)
      .order("start_date", { ascending: true });

    if (data && !error) {
      setEvents(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedEvent]);

  const availableYears = Array.from(
    new Set(
      events.map((event) => 
        event.year || new Date(event.start_date).getFullYear().toString()
      )
    )
  ).sort((a, b) => Number(a) - Number(b));

  const filteredEvents = events.filter((event) => {
    const statusUpper = event.status?.toUpperCase() || "UPCOMING";
    const eventYear = event.year || new Date(event.start_date).getFullYear().toString();
    
    const matchesStatus =
      activeFilter === "ALL" ||
      (activeFilter === "COMPLETED" ? statusUpper === "COMPLETED" : statusUpper !== "COMPLETED");

    const matchesYear = activeYear === "ALL" || eventYear === activeYear;

    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesYear && matchesSearch;
  });

  const formatEventDateRange = (start: string, end: string) => {
    if (!start) return "";
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : d1;
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    if (!end || start === end) {
      return `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()}`;
    } else if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
      return `${months[d1.getMonth()]} ${d1.getDate()}-${d2.getDate()}, ${d1.getFullYear()}`;
    } else if (d1.getFullYear() === d2.getFullYear()) {
      return `${months[d1.getMonth()]} ${d1.getDate()}-${months[d2.getMonth()]} ${d2.getDate()}, ${d1.getFullYear()}`;
    } else {
      return `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()} - ${months[d2.getMonth()]} ${d2.getDate()}, ${d2.getFullYear()}`;
    }
  };

  const isEventCompleted = (event: any) => {
    if (event.status?.toUpperCase() === "COMPLETED") return true;
    
    const eventEndDate = new Date(event.end_date || event.start_date);
    const currentDate = new Date();
    eventEndDate.setHours(0,0,0,0);
    currentDate.setHours(0,0,0,0);
    
    return currentDate > eventEndDate;
  };

  return (
    <div className="w-full flex flex-col">
      
      {/* SEARCH AND STATUS DROPDOWN */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl mx-auto mb-8">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3.5 rounded-xl bg-white border-2 border-slate-200 font-ubuntu-mono font-bold text-slate-800 placeholder:text-slate-400 focus:border-[#011638] focus:ring-0 outline-none shadow-sm transition-all"
          />
          <svg className="absolute right-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="relative w-full sm:w-1/2">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full appearance-none px-5 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-bold font-ubuntu-mono cursor-pointer tracking-widest text-sm uppercase outline-none focus:border-[#011638] transition-colors shadow-sm pr-10"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="COMPLETED">ACCOMPLISHED</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* TIMELINE AS YEAR FILTER */}
      {!isLoading && events.length > 0 && (
        <div className="relative w-full max-w-6xl mx-auto mb-14">
          <div className="overflow-x-auto pb-8 pt-12 px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="relative min-w-max flex justify-between items-center gap-24 md:gap-40 lg:gap-56 px-8 md:px-16 mx-auto">
              
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full"></div>
              
              {["ALL", ...availableYears].map((year) => (
                <div 
                  key={year} 
                  onClick={() => setActiveYear(year)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group"
                >
                  <span className={`absolute -top-10 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                    activeYear === year ? 'text-[#011638]' : 'text-slate-400 group-hover:text-[#0d21a1]'
                  }`}>
                    {year === "ALL" ? "All Years" : year}
                  </span>
                  
                  <div className={`w-6 h-6 rounded-full border-[4px] transition-all duration-300 flex items-center justify-center ${
                    activeYear === year 
                      ? 'bg-[#eec643] border-[#011638] scale-[1.3] shadow-md' 
                      : 'bg-white border-slate-300 group-hover:border-[#0d21a1]'
                  }`}>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <div className="flex flex-col items-center gap-4 animate-pulse text-[#011638]">
            <span className="text-4xl">♠</span>
            <p className="font-bold tracking-widest uppercase text-sm">Loading Events...</p>
          </div>
        </div>
      ) : (
        <>
          {filteredEvents.length === 0 ? (
            <div className="w-full text-center py-20 text-slate-500 font-bold text-xl font-ubuntu-mono">
              No events found for the selected filters.
            </div>
          ) : (
            /* GRID DISPLAY */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => {
                const completed = isEventCompleted(event);
                const statusUpper = event.status?.toUpperCase() || "UPCOMING";
                const hasValidImage = Boolean(event.image_url && typeof event.image_url === 'string' && event.image_url.trim() !== "");

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white rounded-3xl flex flex-col transition-all duration-300 cursor-pointer overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 border border-slate-100 h-full w-full"
                  >
                    {hasValidImage ? (
                      <div className="w-full h-56 shrink-0 relative overflow-hidden bg-slate-100 border-b border-slate-100">
                        <img 
                          src={event.image_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      </div>
                    ) : (
                      <div className="w-full h-4 bg-[#011638] shrink-0"></div>
                    )}

                    <div className="flex flex-col flex-grow p-6 sm:p-8 w-full overflow-hidden">
                      <div className="flex flex-col mb-4 w-full">
                        <span className="font-black text-[10px] uppercase tracking-widest text-[#eec643] mb-1">
                          Date
                        </span>
                        <span className="font-black text-lg leading-tight text-[#0d21a1] break-words line-clamp-2">
                          {formatEventDateRange(event.start_date, event.end_date)}
                        </span>
                      </div>
                      
                      <h3 
                        title={event.title}
                        className="text-2xl font-black text-[#011638] font-oswald uppercase leading-tight mb-2 line-clamp-2 break-all sm:break-words w-full"
                      >
                        {event.title}
                      </h3>
                      
                      <p 
                        title={event.location}
                        className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 line-clamp-1 break-all sm:break-words w-full"
                      >
                        📍 {event.location}
                      </p>
                      
                      <p 
                        title={event.description}
                        className="text-slate-600 font-ubuntu-mono text-sm leading-relaxed flex-grow line-clamp-3 break-words w-full"
                      >
                        {event.description}
                      </p>
                      
                      {/* CARD FOOTER */}
                      <div className="mt-6 pt-5 border-t border-slate-100 text-center shrink-0 w-full" onClick={() => setSelectedEvent(event)}>
                        {completed ? (
                          <span className="inline-block w-full py-2.5 rounded-xl font-black text-xs tracking-widest uppercase bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors">
                            VIEW RECAP
                          </span>
                        ) : statusUpper === "ONGOING" ? (
                          <span className="inline-block px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase text-green-700 bg-green-100 border border-green-200">
                            ● ONGOING
                          </span>
                        ) : (
                          <span className="inline-block px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase text-[#854d0e] bg-[#fef9c3] border border-[#fde047]">
                            COMING SOON
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL POPUP FOR EVENT DETAILS */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#011638]/60 backdrop-blur-sm p-4 sm:p-6 w-full"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header/Image */}
            <div className="relative w-full shrink-0 overflow-hidden">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-sm transition-colors"
              >
                ✕
              </button>
              
              {selectedEvent.image_url ? (
                <div className="w-full h-64 sm:h-80 bg-slate-100 relative">
                  <img 
                    src={selectedEvent.image_url} 
                    alt={selectedEvent.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 w-[calc(100%-3rem)]">
                    <span 
                      title={selectedEvent.short_title}
                      className="inline-block px-3 py-1 mb-3 rounded-md font-black text-[10px] tracking-widest uppercase bg-[#eec643] text-[#011638] line-clamp-1"
                    >
                      {selectedEvent.short_title}
                    </span>
                    <h2 
                      title={selectedEvent.title}
                      className="text-3xl sm:text-4xl font-black text-white font-oswald uppercase leading-tight drop-shadow-md break-all sm:break-words w-full line-clamp-3"
                    >
                      {selectedEvent.title}
                    </h2>
                  </div>
                </div>
              ) : (
                <div className="w-full pt-16 pb-6 px-6 sm:px-10 bg-[#011638] overflow-hidden">
                  <span 
                    title={selectedEvent.short_title}
                    className="inline-block px-3 py-1 mb-3 rounded-md font-black text-[10px] tracking-widest uppercase bg-[#eec643] text-[#011638] line-clamp-1"
                  >
                    {selectedEvent.short_title}
                  </span>
                  <h2 
                    title={selectedEvent.title}
                    className="text-3xl sm:text-4xl font-black text-white font-oswald uppercase leading-tight break-all sm:break-words w-full line-clamp-3"
                  >
                    {selectedEvent.title}
                  </h2>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 flex flex-col gap-6 w-full">
              
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 pb-6 border-b border-slate-100 w-full items-start">
                <div className="w-full sm:w-1/3 min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Date</p>
                  <p className="font-bold text-[#0d21a1] text-lg font-ubuntu-mono break-words w-full line-clamp-2">
                    {formatEventDateRange(selectedEvent.start_date, selectedEvent.end_date)}
                  </p>
                </div>
                <div className="w-full sm:w-1/3 min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Location</p>
                  <p 
                    title={selectedEvent.location}
                    className="font-bold text-slate-700 text-lg font-ubuntu-mono break-words w-full line-clamp-3"
                  >
                    {selectedEvent.location}
                  </p>
                </div>
                <div className="w-full sm:w-1/3 min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Status</p>
                  <p 
                    title={selectedEvent.status}
                    className="font-bold text-slate-700 text-lg font-ubuntu-mono uppercase break-words w-full line-clamp-2"
                  >
                    {selectedEvent.status}
                  </p>
                </div>
              </div>

              <div className="w-full min-w-0">
                <p className="text-slate-700 font-ubuntu-mono text-base leading-relaxed whitespace-pre-wrap break-words w-full">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Action Button inside modal */}
              {isEventCompleted(selectedEvent) && (
                <div className="mt-4 pt-6 border-t border-slate-100 flex justify-center w-full">
                  <button className="px-8 py-3 bg-[#011638] text-white font-oswald font-bold tracking-widest uppercase rounded-xl hover:bg-[#eec643] hover:text-[#011638] transition-colors shadow-md">
                    View Recap Gallery
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}