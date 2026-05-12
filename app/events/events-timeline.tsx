"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const FilterDropdown = ({ value, options, onChange }: any) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o: any) => o.value === value)?.label || value;

  return (
    <div ref={ref} className="relative w-full z-[50] font-sans">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-5 py-2.5 bg-white border border-[#011638] rounded-xl text-[#011638] font-bold font-ubuntu-mono uppercase tracking-widest text-sm shadow-sm hover:shadow-md transition flex items-center justify-between min-w-[160px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ml-3 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-full min-w-[160px] bg-white border border-[#011638] rounded-xl shadow-lg overflow-hidden">
          <ul className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((o: any) => (
              <li
                key={o.value}
                onClick={() => {
                  if (o.disabled) return;
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`px-5 py-3 transition-colors text-sm font-bold font-ubuntu-mono uppercase tracking-widest ${
                  o.disabled
                    ? "opacity-40 bg-slate-50 text-slate-500 cursor-not-allowed"
                    : o.value === value
                    ? "bg-[#011638] text-white cursor-pointer"
                    : "hover:bg-slate-100 text-[#011638] cursor-pointer"
                }`}
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

export default function EventsTimeline() {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeYear, setActiveYear] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const timelineRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const DEFAULT_IMAGE = "/assets/logos/Ace Cards logo.png"; 

  const fetchEvents = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_deleted", false)
      .order("start_date", { ascending: false });

    if (data && !error) setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [selectedEvent]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, activeYear, searchQuery]);

  const checkScroll = () => {
    if (timelineRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = timelineRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  const scrollTimeline = (direction: "left" | "right") => {
    if (timelineRef.current) {
      const scrollAmount = timelineRef.current.clientWidth / 2;
      timelineRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const currentYear = new Date().getFullYear();
  const isPastYear = activeYear !== "ALL" && Number(activeYear) < currentYear;

  useEffect(() => {
    if (isPastYear && activeFilter === "UPCOMING") {
      setActiveFilter("ALL");
    }
  }, [activeYear, isPastYear, activeFilter]);

  const isEventCompleted = (event: any) => {
    if (event.status?.toUpperCase() === "COMPLETED") return true;
    const eventEndDate = new Date(event.end_date || event.start_date);
    const currentDate = new Date();
    eventEndDate.setHours(23, 59, 59, 999);
    return currentDate > eventEndDate;
  };

  const availableYears = Array.from(
    new Set(
      events.map((event) => event.year || new Date(event.start_date).getFullYear().toString())
    )
  ).sort((a, b) => Number(b) - Number(a));

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [availableYears.length]);

  const filteredEvents = events.filter((event) => {
    const completed = isEventCompleted(event);
    const eventYear = event.year || new Date(event.start_date).getFullYear().toString();
    
    const matchesStatus =
      activeFilter === "ALL" ||
      (activeFilter === "COMPLETED" ? completed : !completed);
      
    const matchesYear = activeYear === "ALL" || eventYear === activeYear;
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesStatus && matchesYear && matchesSearch;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const emptyCardsCount = itemsPerPage - currentEvents.length;

  const formatEventDateRange = (start: string, end: string) => {
    if (!start) return "";
    const d1 = new Date(start);
    const d2 = end ? new Date(end) : d1;
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    if (!end || start === end)
      return `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()}`;
    if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear())
      return `${months[d1.getMonth()]} ${d1.getDate()}-${d2.getDate()}, ${d1.getFullYear()}`;
    if (d1.getFullYear() === d2.getFullYear())
      return `${months[d1.getMonth()]} ${d1.getDate()}-${months[d2.getMonth()]} ${d2.getDate()}, ${d1.getFullYear()}`;
    return `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()} - ${months[d2.getMonth()]} ${d2.getDate()}, ${d2.getFullYear()}`;
  };

  const statusOptions = [
    { label: "ALL EVENTS", value: "ALL" },
    { label: "UPCOMING", value: "UPCOMING", disabled: isPastYear },
    { label: "ACCOMPLISHED", value: "COMPLETED" },
  ];

  return (
    <div className="w-full flex flex-col -mt-6 md:-mt-8">
      {/* TOOLBAR FILTERS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-7xl mx-auto mb-10 px-4">
        <div className="w-full md:w-auto flex justify-center md:justify-start">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2.5 pl-11 border border-[#011638] rounded-xl text-[#011638] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#011638] bg-white shadow-sm transition-all font-ubuntu-mono font-bold"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <div className="w-full sm:w-auto">
            <FilterDropdown value={activeFilter} options={statusOptions} onChange={setActiveFilter} />
          </div>
        </div>
      </div>

      {!isLoading && events.length > 0 && (
        <div className="relative w-full max-w-6xl mx-auto mb-14 px-4 sm:px-12 group">
          {canScrollLeft && (
            <button 
              onClick={() => scrollTimeline("left")} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow border border-slate-200 text-[#011638] hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}

          {canScrollRight && (
            <button 
              onClick={() => scrollTimeline("right")} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow border border-slate-200 text-[#011638] hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

          <div 
            ref={timelineRef}
            onScroll={checkScroll}
            className="overflow-x-auto scroll-smooth py-12 relative [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full" style={{ minWidth: '100%' }}></div>
            <div className="flex justify-between items-center w-full min-w-max px-4">
              {["ALL", ...availableYears].map((year) => (
                <div
                  key={year}
                  onClick={() => setActiveYear(year)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group flex-1 min-w-[80px] md:min-w-[120px] shrink-0"
                >
                  <span
                    className={`absolute -top-10 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                      activeYear === year ? "text-[#011638]" : "text-slate-400 group-hover:text-[#0d21a1]"
                    }`}
                  >
                    {year}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-[4px] transition-all duration-300 flex items-center justify-center ${
                      activeYear === year
                        ? "bg-[#eec643] border-[#011638] scale-[1.3] shadow-md"
                        : "bg-white border-slate-300 group-hover:border-[#0d21a1]"
                    }`}
                  ></div>
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
            <div className="w-full flex flex-col items-center px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto">
                {currentEvents.map((event) => {
                  const completed = isEventCompleted(event);
                  const statusUpper = event.status?.toUpperCase() || "UPCOMING";
                  const hasValidImage = Boolean(event.image_url && typeof event.image_url === "string" && event.image_url.trim() !== "");
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200 
                      shadow-md transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-200 
                      hover:bg-white flex flex-col cursor-pointer overflow-hidden h-[500px] w-full"
                    >
                      {/* Image section */}
                      <div className="w-full h-48 shrink-0 relative overflow-hidden bg-slate-50 border-b border-slate-200/60 flex items-center justify-center">
                        <img
                          src={hasValidImage ? event.image_url : DEFAULT_IMAGE}
                          alt={event.title}
                          onError={(e: any) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                            e.currentTarget.className = "w-full h-full transition-transform duration-500 group-hover:scale-105 object-contain p-8 opacity-40";
                          }}
                          className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${
                            hasValidImage ? 'object-cover' : 'object-contain p-8 opacity-40'
                          }`}
                        />
                      </div>
                        
                      {/* Content wrapper */}
                      <div className="flex flex-col flex-1 p-6 w-full min-w-0 overflow-hidden">
                        
                        {/* Meta Date */}
                        <div className="flex flex-col mb-3 w-full shrink-0">
                          <span className="font-black text-[10px] uppercase tracking-widest text-[#eec643] mb-1">Date</span>
                          <span className="font-black text-sm sm:text-base leading-tight text-[#0d21a1] truncate">
                            {formatEventDateRange(event.start_date, event.end_date)}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl font-black text-[#011638] font-oswald uppercase leading-tight mb-3 line-clamp-2 break-words shrink-0" title={event.title}>
                          {event.title}
                        </h3>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1 mb-3 w-full shrink-0">
                          <span className="shrink-0 text-xs">📍</span>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate flex-1 min-w-0" title={event.location || "TBA"}>
                            {event.location || "TBA"}
                          </p>
                        </div>
                        
                        {/* Description */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <p className="text-slate-600 font-ubuntu-mono text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 break-words w-full">
                            {event.description}
                          </p>
                        </div>

                        {/* Status Footer */}
                        <div className="mt-4 pt-4 border-t border-slate-200/60 text-center w-full shrink-0">
                          {completed ? (
                            <span className="inline-block px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase text-slate-600 bg-slate-100 border border-slate-200 shadow-sm">
                              ● COMPLETED
                            </span>
                          ) : statusUpper === "ONGOING" ? (
                            <span className="inline-block px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase text-blue-700 bg-blue-100 border border-blue-200 shadow-sm">
                              ● ONGOING
                            </span>
                          ) : (
                            <span className="inline-block px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase text-green-700 bg-green-100 border border-green-200 shadow-sm">
                              COMING SOON
                            </span>
                          )}
                        </div>
                        
                      </div>
                    </div>
                  );
                })}

                {emptyCardsCount > 0 && Array.from({ length: emptyCardsCount }).map((_, idx) => (
                  <div key={`ghost-${idx}`} className="hidden md:block w-full h-[500px] invisible pointer-events-none aria-hidden"></div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 mb-8 font-ubuntu-mono w-full">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="p-2 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none custom-scrollbar pb-2 sm:pb-0">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 shrink-0 rounded-xl font-bold transition-colors ${
                          currentPage === i + 1 ? "bg-[#011638] text-white shadow-md" : "text-[#475569] hover:bg-slate-200"
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL POPUP */}
      {selectedEvent && (
        <div
          className="fixed inset-[-10px] z-[99999] flex items-center justify-center p-4 sm:p-6"
          style={{
            backgroundColor: "rgba(1, 22, 56, 0.8)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="pointer-events-auto bg-white border border-[#011638] rounded-3xl w-full max-w-3xl max-h-[85vh] 
            overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col animate-in fade-in 
            zoom-in-95 duration-200 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full shrink-0 overflow-hidden bg-[#011638]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="cursor-pointer absolute top-4 right-4 z-[100] w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 shadow-sm transition-colors"
              >
                ✕
              </button>
              
              <div className="w-full h-64 sm:h-80 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                <img
                  src={selectedEvent.image_url || DEFAULT_IMAGE}
                  alt={selectedEvent.title}
                  onError={(e: any) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                    e.currentTarget.className = "w-full h-full object-contain p-12 opacity-30";
                  }}
                  className={`w-full h-full ${!selectedEvent.image_url ? 'object-contain p-12 opacity-30' : 'object-cover'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 w-[calc(100%-3rem)]">
                  <span className="inline-block px-3 py-1 mb-3 rounded-md font-black text-[10px] tracking-widest uppercase bg-[#eec643] text-[#011638] shadow-sm">
                    {selectedEvent.short_title || "ACE CARDS"}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-oswald uppercase leading-tight drop-shadow-md break-words">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-10 flex flex-col gap-6 w-full">
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 pb-6 border-b border-slate-100 w-full items-start">
                <div className="w-full sm:w-1/3 min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">
                    Date
                  </p>
                  <p className="font-bold text-[#0d21a1] text-lg font-ubuntu-mono break-words">
                    {formatEventDateRange(
                      selectedEvent.start_date,
                      selectedEvent.end_date
                    )}
                  </p>
                </div>
                <div className="w-full sm:w-1/3 min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">
                    Location
                  </p>
                  <p className="font-bold text-slate-700 text-lg font-ubuntu-mono line-clamp-2 break-words" title={selectedEvent.location}>
                    {selectedEvent.location || "TBA"}
                  </p>
                </div>
                <div className="w-full sm:w-1/3 min-w-0">
                  <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">
                    Status
                  </p>
                  <p className="font-bold text-slate-700 text-lg font-ubuntu-mono uppercase break-words">
                    {isEventCompleted(selectedEvent) ? "COMPLETED" : (selectedEvent.status || "UPCOMING")}
                  </p>
                </div>
              </div>
              <div className="w-full min-w-0 pb-4">
                <p className="text-slate-700 font-ubuntu-mono text-base leading-relaxed whitespace-pre-wrap break-words w-full">
                  {selectedEvent.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}