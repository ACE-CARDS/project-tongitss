"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function EventsTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const events = [
    { id: 1, date: "AUG 31-SEP 4, 2022", shortTitle: "SLC 2022", title: "Leadership Boot Camp", location: "📍 Laoag City", year: "2022", status: "COMPLETED", description: "DOST-SEI Scholars Leadership Boot Camp helping scholars step out of their comfort zones and return with a deeper sense of patriotism." },
    { id: 2, date: "APR 11-18, 2023", shortTitle: "Bontoc Drive", title: "Bontoc Relief Drive", location: "📍 Drop-off Centers", year: "2023", status: "COMPLETED", description: "Partnership with KAInDS to spearhead a relief drive for fire incident victims, providing food, clothing, and school supplies." },
    { id: 3, date: "JUL 8, 2023", shortTitle: "GA 2023", title: "2023 General Assembly", location: "📍 Zoom", year: "2023", status: "COMPLETED", description: "Inaugural General Assembly officially welcoming the newest members to ACE CARDS and setting the tone for collaborative endeavors." },
    { id: 8, date: "APR 6-7, 2024", shortTitle: "Exam Support", title: "2024 DOST Exam Support", location: "📍 BSU & Baguio High", year: "2024", status: "COMPLETED", description: "Mobilized on-ground volunteer efforts to support examinees with free snacks, test supplies, and morale-boosting installations." },
    { id: 9, date: "JUN 14-16, 2024", shortTitle: "Inadalan", title: "Inadalan Immersion", location: "📍 Sagada, Mt. Province", year: "2024", status: "COMPLETED", description: "A cultural and community immersion fostering a deeper understanding of indigenous culture and regional solidarity." },
    { id: 24, date: "MAY 15-16, 2026", shortTitle: "Mid-Year GA", title: "Mid-Year Assembly", location: "📍 TBA", year: "2026", status: "RSVP OPEN", description: "A gathering for all scholars to evaluate the first half of the year and plan for upcoming community projects." },
    { id: 25, date: "AUG 12-16, 2026", shortTitle: "SLC 2026", title: "Leadership Boot Camp", location: "📍 TBA", year: "2026", status: "UPCOMING", description: "The annual DOST-SEI Scholars Leadership Boot Camp to develop the next generation of S&T leaders in the Cordilleras." },
  ];

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

  const currentEvent = filteredEvents[activeIndex] || filteredEvents[0];
  const sectionTitle = currentEvent?.status === "COMPLETED" ? "Accomplished" : "Upcoming";

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
      const newIndex = Math.round(scrollContainerRef.current.scrollLeft / CARD_SLOT_WIDTH);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < filteredEvents.length) {
        setActiveIndex(newIndex);
      }
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 lg:px-6 flex flex-col">
      
      {/* 1. SEARCH & FILTER BAR (Moved to top, less dead space) */}
      <div className="flex flex-col md:flex-row gap-4 w-full bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white shadow-md mb-8 z-20">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActiveIndex(0);
          }}
          className="flex-grow px-6 py-3 rounded-xl bg-gray-100/50 font-bold text-[#011638] placeholder:text-gray-400 focus:ring-2 focus:ring-[#eec643] outline-none"
        />
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setActiveIndex(0);
          }}
          className="px-6 py-3 rounded-xl bg-[#011638] text-white font-black border-none cursor-pointer tracking-widest text-sm uppercase outline-none hover:bg-[#0d21a1] transition-colors"
        >
          <option value="ALL">ALL EVENTS</option>
          <option value="UPCOMING">UPCOMING</option>
          <option value="COMPLETED">ACCOMPLISHED</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* 2. EVENT COUNTER & TITLE HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-2">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-[#011638] uppercase">
            {sectionTitle} <span className="text-[#eec643]">Events</span>
          </h2>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
            Showing {filteredEvents.length > 0 ? activeIndex + 1 : 0} / {filteredEvents.length} Events
          </p>
        </div>

        {/* HIGHLY OBVIOUS NAVIGATION BUTTONS */}
        <div className="flex gap-4 mt-4 md:mt-0">
          <button
            onClick={() => scroll("left")}
            disabled={activeIndex === 0}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#011638] text-white hover:bg-[#0d21a1] hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={activeIndex === filteredEvents.length - 1 || filteredEvents.length === 0}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#011638] text-white hover:bg-[#0d21a1] hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

  {/* 3. TIMELINE DOTS (Shadows removed for a clean, flat look) */}
      {filteredEvents.length > 0 && (
        <div className="relative w-full py-8 mb-4 border-b border-gray-200/50">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-200 -translate-y-1/2"></div>
          
          <div className="relative flex justify-between items-center px-4 overflow-x-auto hide-scrollbar">
            {filteredEvents.map((node, index) => (
              <div 
                key={node.id} 
                onClick={() => scrollToCard(index)}
                className="group relative flex flex-col items-center justify-center cursor-pointer min-w-[60px] shrink-0"
              >
                
                <div className="relative flex items-center justify-center h-8 w-8 shrink-0 z-10">
                  {index === activeIndex ? (
                    // ACTIVE DOT (Removed shadow-lg)
                    <div className="w-6 h-6 bg-[#011638] rounded-full flex items-center justify-center transition-all duration-300">
                      <div className="w-3 h-3 bg-[#eec643] rounded-full"></div>
                    </div>
                  ) : (
                    // INACTIVE DOT
                    <div className="w-4 h-4 bg-white border-[3px] border-gray-300 rounded-full group-hover:border-[#0d21a1] transition-all duration-300"></div>
                  )}
                </div>
                
                {/* Pop-up Tooltip on Hover (Removed shadow-xl) */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 flex flex-col items-center">
                  <div className="bg-[#011638] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                    {node.shortTitle}
                  </div>
                  {/* Tooltip triangle pointer */}
                  <div className="w-2 h-2 bg-[#011638] rotate-45 -mt-1"></div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
      {/* 4. CAROUSEL */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-8 overflow-x-auto snap-x snap-mandatory py-8 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth items-center"
      >
        {filteredEvents.length === 0 ? (
          <div className="w-full text-center py-20 text-gray-500 font-bold text-xl">
            No events found.
          </div>
        ) : (
          filteredEvents.map((event, index) => (
            <div
              key={event.id}
              onClick={() => {
                if (index === activeIndex) {
                  router.push(`/events/${event.id}`);
                } else {
                  scrollToCard(index);
                }
              }}
              className={`w-[320px] h-[460px] rounded-[2.5rem] p-8 flex flex-col snap-center transition-all duration-500 shrink-0 cursor-pointer relative overflow-hidden group ${
                index === activeIndex 
                  ? "bg-white border-2 border-[#eec643] shadow-[0_20px_50px_-12px_rgba(1,22,56,0.3)] z-10 scale-100" 
                  : "bg-white/60 border border-gray-200 scale-90 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className={`font-black text-[10px] uppercase tracking-widest ${index === activeIndex ? "text-[#eec643]" : "text-gray-400"}`}>Date</span>
                  <span className={`font-black text-lg leading-tight ${index === activeIndex ? "text-[#0d21a1]" : "text-gray-500"}`}>{event.date}</span>
                </div>
              </div>

              <h3 className="relative z-10 text-2xl font-black text-[#011638] uppercase leading-tight mb-2">
                {event.title}
              </h3>
              <p className="relative z-10 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                {event.location}
              </p>

              <p className="relative z-10 text-gray-600 text-sm font-medium leading-relaxed flex-grow line-clamp-5">
                {event.description}
              </p>

              <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
                <div
                  className={`w-full py-4 rounded-xl font-black text-xs tracking-widest transition-all text-center uppercase cursor-pointer ${
                    event.status === "COMPLETED" 
                      ? "bg-gray-100 text-gray-600 group-hover:bg-gray-200" 
                      : "bg-[#011638] text-white shadow-md group-hover:bg-[#0d21a1]"
                  }`}
                >
                  {event.status === "COMPLETED" ? "VIEW RECAP" : event.status === "RSVP OPEN" ? "LEARN MORE" : "COMING SOON"}
                </div>
              </div>
            </div>
          ))
        )}
        {/* Invisible spacer to allow last item to scroll to center */}
        <div className="min-w-[50vw] shrink-0"></div>
      </div>

    </section>
  );
}