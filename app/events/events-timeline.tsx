"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EventsTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
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
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "COMPLETED"
        ? event.status === "COMPLETED"
        : activeFilter === "UPCOMING"
          ? event.status !== "COMPLETED"
          : event.year === activeFilter);

    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const CARD_SLOT_WIDTH = 352;

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * CARD_SLOT_WIDTH,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const scroll = (direction: "left" | "right") => {
    let newIndex =
      direction === "left"
        ? Math.max(0, activeIndex - 1)
        : Math.min(filteredEvents.length - 1, activeIndex + 1);
    scrollToCard(newIndex);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const newIndex = Math.round(
        scrollContainerRef.current.scrollLeft / CARD_SLOT_WIDTH,
      );
      if (
        newIndex !== activeIndex &&
        newIndex >= 0 &&
        newIndex < filteredEvents.length
      ) {
        setActiveIndex(newIndex);
      }
    }
  };

  // Helper to format date into (MMM, YYYY)
  const formatTimelineDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    return `(${months[d.getMonth()]}, ${d.getFullYear()})`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
            Events
          </h1>
          <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-3xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActiveIndex(0);
          }}
          className="w-full sm:w-2/3 px-6 py-3 rounded-xl bg-white/80 border border-slate-300 font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#011638] outline-none shadow-sm transition-all"
        />
        <div className="relative w-full sm:w-1/3">
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setActiveIndex(0);
            }}
            className="w-full appearance-none px-6 py-3 rounded-xl bg-white/80 border border-slate-300 text-slate-800 font-bold cursor-pointer tracking-widest text-sm uppercase outline-none focus:ring-2 focus:ring-[#011638] transition-colors shadow-sm pr-10"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="COMPLETED">ACCOMPLISHED</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-20">
          <div className="flex flex-col items-center gap-4 animate-pulse text-[#011638]">
            <span className="text-4xl">♠</span>
            <p className="font-bold tracking-widest uppercase text-sm">
              Loading Events...
            </p>
          </div>
        </div>
      ) : (
        <>
          {filteredEvents.length > 0 && (
            <div className="relative w-full mb-8 border-b border-gray-300/50">
              
              {/* Horizontal Line centered vertically */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-300/50 -translate-y-1/2"></div>
              
              {/* Timeline Container (Added py-10 so the absolute text isn't clipped) */}
              <div className="relative flex justify-between items-center px-4 py-10 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {filteredEvents.map((node, index) => (
                  <div
                    key={node.id}
                    onClick={() => scrollToCard(index)}
                    className="group relative flex flex-col items-center justify-center cursor-pointer min-w-[80px] shrink-0"
                  >
                    
                    {/* Date Label: Above the dot */}
                    <div className={`absolute bottom-full mb-3 text-[10px] font-black tracking-widest uppercase whitespace-nowrap transition-colors duration-300 ${
                      index === activeIndex ? "text-[#011638]" : "text-slate-400 group-hover:text-[#0d21a1]"
                    }`}>
                      {formatTimelineDate(node.start_date)}
                    </div>

                    {/* Timeline Dot */}
                    <div className="relative flex items-center justify-center h-8 w-8 shrink-0 z-10">
                      {index === activeIndex ? (
                        <div className="w-6 h-6 bg-[#011638] rounded-full flex items-center justify-center transition-all duration-300 shadow-md shadow-[#011638]/40">
                          <div className="w-3 h-3 bg-[#eec643] rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-4 h-4 bg-white border-[3px] border-slate-300 rounded-full group-hover:border-[#0d21a1] transition-all duration-300"></div>
                      )}
                    </div>
                    
                    {/* Short Title Tooltip: Below the dot */}
                    <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 flex flex-col items-center">
                      <div className="w-2 h-2 bg-[#011638] rotate-45 -mb-1.5 z-0"></div>
                      <div className="bg-[#011638] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap relative z-10">
                        {node.short_title}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="w-full flex items-center justify-between gap-4 lg:gap-8 mt-2">
            <button
              onClick={() => scroll("left")}
              disabled={activeIndex === 0}
              className="hidden md:flex shrink-0 z-30 w-14 h-14 items-center justify-center rounded-2xl bg-[#011638] text-white hover:bg-[#0d21a1] hover:scale-110 shadow-lg disabled:opacity-0 transition-all duration-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 flex gap-8 overflow-x-auto snap-x snap-mandatory py-8 px-4 lg:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth items-center"
            >
              {filteredEvents.length === 0 ? (
                <div className="w-full text-center py-20 text-slate-500 font-bold text-xl">
                  No events found.
                </div>
              ) : (
                filteredEvents.map((event, index) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      if (index === activeIndex)
                        router.push(`/events/${event.id}`);
                      else scrollToCard(index);
                    }}
                    className={`w-[320px] h-[460px] rounded-[2.5rem] p-8 flex flex-col snap-center transition-all duration-500 shrink-0 cursor-pointer relative overflow-hidden group ${index === activeIndex ? "bg-white border-2 border-[#eec643] shadow-xl z-10 scale-100" : "bg-white/60 border border-slate-200 scale-90 opacity-60 hover:opacity-100"}`}
                  >
                    <div className="relative z-10 flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className={`font-black text-[10px] uppercase tracking-widest ${index === activeIndex ? "text-[#eec643]" : "text-slate-400"}`}>
                          Date
                        </span>
                        <span className={`font-black text-lg leading-tight ${index === activeIndex ? "text-[#0d21a1]" : "text-slate-500"}`}>
                          {event.date}
                        </span>
                      </div>
                    </div>
                    <h3 className="relative z-10 text-2xl font-black text-[#011638] uppercase leading-tight mb-2">
                      {event.title}
                    </h3>
                    <p className="relative z-10 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                      📍 {event.location}
                    </p>
                    <p className="relative z-10 text-slate-600 text-sm font-medium leading-relaxed flex-grow line-clamp-5">
                      {event.description}
                    </p>
                    <div className="relative z-10 mt-6 pt-6 border-t border-slate-100 text-center">
                      <div className={`w-full py-4 rounded-xl font-black text-xs tracking-widest uppercase ${event.status === "COMPLETED" ? "bg-slate-100 text-slate-600" : "bg-[#011638] text-white shadow-md"}`}>
                        {event.status === "COMPLETED"
                          ? "VIEW RECAP"
                          : event.status === "RSVP OPEN"
                            ? "LEARN MORE"
                            : "COMING SOON"}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div className="min-w-[50vw] shrink-0"></div>
            </div>

            <button
              onClick={() => scroll("right")}
              disabled={
                activeIndex === filteredEvents.length - 1 ||
                filteredEvents.length === 0
              }
              className="hidden md:flex shrink-0 z-30 w-14 h-14 items-center justify-center rounded-2xl bg-[#011638] text-white hover:bg-[#0d21a1] hover:scale-110 shadow-lg disabled:opacity-0 transition-all duration-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}