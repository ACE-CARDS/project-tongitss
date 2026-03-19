"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventsTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const events = [
    {
      id: 1,
      date: "AUG 31-SEP 4, 2022",
      shortTitle: "SLC 2022",
      title: "Leadership Boot Camp",
      location: "📍 Laoag City",
      year: "2022",
      status: "COMPLETED",
      description:
        "DOST-SEI Scholars Leadership Boot Camp helping scholars step out of their comfort zones and return with a deeper sense of patriotism.",
    },
    {
      id: 2,
      date: "APR 11-18, 2023",
      shortTitle: "Bontoc Drive",
      title: "Bontoc Relief Drive",
      location: "📍 Drop-off Centers",
      year: "2023",
      status: "COMPLETED",
      description:
        "Partnership with KAInDS to spearhead a relief drive for fire incident victims, providing food, clothing, and school supplies.",
    },
    {
      id: 3,
      date: "JUL 8, 2023",
      shortTitle: "GA 2023",
      title: "2023 General Assembly",
      location: "📍 Zoom",
      year: "2023",
      status: "COMPLETED",
      description:
        "Inaugural General Assembly officially welcoming the newest members to ACE CARDS and setting the tone for collaborative endeavors.",
    },
    {
      id: 8,
      date: "APR 6-7, 2024",
      shortTitle: "Exam Support",
      title: "2024 DOST Exam Support",
      location: "📍 BSU & Baguio High",
      year: "2024",
      status: "COMPLETED",
      description:
        "Mobilized on-ground volunteer efforts to support examinees with free snacks, test supplies, and morale-boosting installations.",
    },
    {
      id: 9,
      date: "JUN 14-16, 2024",
      shortTitle: "Inadalan",
      title: "Inadalan Immersion",
      location: "📍 Sagada, Mt. Province",
      year: "2024",
      status: "COMPLETED",
      description:
        "A cultural and community immersion fostering a deeper understanding of indigenous culture and regional solidarity.",
    },
    {
      id: 24,
      date: "MAY 15-16, 2026",
      shortTitle: "Mid-Year GA",
      title: "Mid-Year Assembly",
      location: "📍 TBA",
      year: "2026",
      status: "RSVP OPEN",
      description:
        "A gathering for all scholars to evaluate the first half of the year and plan for upcoming community projects.",
    },
    {
      id: 25,
      date: "AUG 12-16, 2026",
      shortTitle: "SLC 2026",
      title: "Leadership Boot Camp",
      location: "📍 TBA",
      year: "2026",
      status: "UPCOMING",
      description:
        "The annual DOST-SEI Scholars Leadership Boot Camp to develop the next generation of S&T leaders in the Cordilleras.",
    },
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
  const sectionTitle =
    currentEvent?.status === "COMPLETED" ? "Accomplished" : "Upcoming";

  const CARD_SLOT_WIDTH = 352;

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: index * CARD_SLOT_WIDTH,
        behavior: "smooth",
      });
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

  const EventCard = ({
    event,
    isActive,
    index,
  }: {
    event: any;
    isActive: boolean;
    index: number;
  }) => (
    <div
      onClick={() => {
        if (isActive) {
          router.push(`/events/${event.id}`);
        } else {
          scrollToCard(index);
        }
      }}
      className={`w-[300px] h-[480px] rounded-[2.5rem] p-8 flex flex-col snap-start transition-all duration-500 shrink-0 cursor-pointer relative overflow-hidden ${isActive ? "bg-white border-2 border-[#eec643] shadow-xl z-10 hover:-translate-y-2 hover:shadow-2xl" : "bg-white/50 border border-gray-300/70 blur-[0.5px] scale-90 opacity-80 hover:opacity-100 hover:blur-none"}`}
    >
      <div
        className={`absolute -bottom-16 -right-16 transition-all duration-500 z-0 pointer-events-none ${isActive ? "text-[#f8f9fa] scale-110 opacity-100" : "text-transparent"}`}
      >
        <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.1C12 2.1 4 9 4 14.5C4 17.5 6.5 20 9.5 20C11 20 12 19 12 19C12 19 13 20 14.5 20C17.5 20 20 17.5 20 14.5C20 9 12 2.1 12 2.1ZM10 23L12 18L14 23H10Z" />
        </svg>
      </div>

      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <span
            className={`font-black text-[10px] uppercase tracking-widest ${isActive ? "text-[#eec643]" : "text-gray-400"}`}
          >
            Date
          </span>
          <span
            className={`font-black text-lg leading-tight ${isActive ? "text-[#0d21a1]" : "text-gray-400"}`}
          >
            {event.date}
          </span>
        </div>
        <span
          className={`text-3xl leading-none transition-colors ${isActive ? "text-[#0d21a1]" : "text-gray-300"}`}
        >
          ♠
        </span>
      </div>

      <h3 className="relative z-10 text-2xl font-black text-[#011638] uppercase leading-tight mb-2 line-clamp-3">
        {event.title}
      </h3>
      <p className="relative z-10 text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-4">
        {event.location}
      </p>

      <p className="relative z-10 text-[#141414]/70 text-sm font-medium leading-relaxed flex-grow line-clamp-6">
        {event.description}
      </p>

      <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
        <div
          className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all text-center uppercase ${event.status === "RSVP OPEN" ? "bg-[#011638] text-white hover:bg-[#0d21a1]" : "border border-[#011638] text-[#011638] hover:bg-gray-50"}`}
        >
          {event.status === "COMPLETED"
            ? "VIEW RECAP"
            : event.status === "RSVP OPEN"
              ? "LEARN MORE"
              : "COMING SOON"}
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex-grow flex flex-col md:flex-row gap-4 w-full bg-white/30 backdrop-blur-md p-3 rounded-[2rem] border border-white/40 shadow-sm">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-3 rounded-xl border-none bg-white/60 font-bold text-[#011638] placeholder:text-gray-400 focus:ring-0"
            />
          </div>
          <div className="relative flex items-center">
            <img
              src="/assets/logos/ACE CARDS logo.png"
              className="absolute left-4 w-5 h-5 object-contain z-10 pointer-events-none"
              alt="ace"
            />
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-xl bg-white/60 font-black text-[#011638] border-none cursor-pointer appearance-none text-xs tracking-widest"
            >
              <option value="ALL">ALL EVENTS</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="COMPLETED">ACCOMPLISHED</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full relative mb-16 py-8 overflow-x-auto hide-scrollbar border-y border-gray-100/50 bg-white/10">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#011638]/20 to-transparent -translate-y-1/2"></div>
        <div
          ref={timelineRef}
          className="relative flex justify-between min-w-max px-[20vw] gap-20"
        >
          {filteredEvents.map((node, index) => (
            <button
              key={node.id}
              onClick={() => scrollToCard(index)}
              className="flex flex-col items-center group relative z-10"
            >
              <div
                className={`w-3 h-3 rounded-full border-[1.5px] mb-3 transition-all duration-500 ${index === activeIndex ? "bg-[#eec643] border-[#011638] scale-150" : "bg-white border-gray-300"}`}
              ></div>
              <span
                className={`font-black text-[9px] uppercase tracking-tighter ${index === activeIndex ? "text-[#0d21a1]" : "text-gray-400"}`}
              >
                {node.shortTitle}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl md:text-6xl font-black text-[#011638] uppercase">
            {sectionTitle} <span className="text-[#eec643]">Events</span>
          </h2>

          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 flex items-center justify-center rounded-full border-[1.5px] border-[#011638] text-[#011638] hover:bg-[#011638] hover:text-white transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 flex items-center justify-center rounded-full border-[1.5px] border-[#011638] text-[#011638] hover:bg-[#011638] hover:text-white transition-all"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory py-10 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth items-center"
        >
          {filteredEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              isActive={index === activeIndex}
              index={index}
            />
          ))}
          <div className="min-w-[60vw] shrink-0"></div>
        </div>
      </div>
    </section>
  );
}
