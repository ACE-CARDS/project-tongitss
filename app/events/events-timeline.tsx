"use client";

import { useRef, useState, useEffect } from "react";

export default function EventsTimeline() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const events = [
    { id: 1, date: "AUG 31-SEP 4, 2022", shortTitle: "SLC 2022", title: "Leadership Boot Camp", location: "📍 Laoag City", year: "2022", status: "COMPLETED", description: "DOST-SEI Scholars Leadership Boot Camp helping scholars step out of their comfort zones and return with a deeper sense of patriotism." },
    { id: 2, date: "APR 11-18, 2023", shortTitle: "Bontoc Drive", title: "Bontoc Relief Drive", location: "📍 Drop-off Centers", year: "2023", status: "COMPLETED", description: "Partnership with KAInDS and others to spearhead a relief drive for fire incident victims, providing food, clothing, and school supplies." },
    { id: 3, date: "JUL 8, 2023", shortTitle: "GA 2023", title: "2023 General Assembly", location: "📍 Zoom", year: "2023", status: "COMPLETED", description: "Inaugural General Assembly officially welcoming the newest members to ACE CARDS and setting the tone for collaborative endeavors." },
    { id: 4, date: "JUL 21, 2023", shortTitle: "JLSS '23", title: "JLSS Virtual Campaign", location: "📍 Zoom", year: "2023", status: "COMPLETED", description: "Interactive virtual campaign dedicated to the Junior Level Science Scholarships to inspire the region's youth." },
    { id: 5, date: "DEC 21, 2023", shortTitle: "UGE Drive", title: "Undergrad Info Drive", location: "📍 Online", year: "2023", status: "COMPLETED", description: "Comprehensive online information drive demystifying FAQs for aspiring 2024 undergraduate scholars." },
    { id: 6, date: "MAR 11, 2024", shortTitle: "Test Prep", title: "Test-Taking Strategies", location: "📍 Online", year: "2024", status: "COMPLETED", description: "Released a comprehensive online guide featuring essential test-taking strategies to boost confidence and exam readiness." },
    { id: 7, date: "MAR 22, 2024", shortTitle: "JLSS '24", title: "JLSS Info Campaign", location: "📍 Online", year: "2024", status: "COMPLETED", description: "Digital initiative educating junior-level college students about S&T human resources and scholarship privileges." },
    { id: 8, date: "APR 6-7, 2024", shortTitle: "Exam Support", title: "2024 DOST Exam Support", location: "📍 BSU & Baguio High", year: "2024", status: "COMPLETED", description: "Mobilized on-ground volunteer efforts to support examinees with free snacks, test supplies, and morale-boosting installations." },
    { id: 9, date: "JUN 14-16, 2024", shortTitle: "Inadalan", title: "Inadalan Immersion", location: "📍 Sagada, Mt. Province", year: "2024", status: "COMPLETED", description: "A cultural and community immersion fostering a deeper understanding of indigenous culture, environmental preservation, and regional solidarity." },
    { id: 10, date: "OCT 2024", shortTitle: "Kristine Drive", title: "Storm Kristine Relief", location: "📍 Digital Channels", year: "2024", status: "COMPLETED", description: "Monetary donation drive in partnership with Mr. and Ms. Benguet to assist communities devastated by Severe Tropical Storm Kristine." },
    { id: 11, date: "DEC 2024", shortTitle: "Year-End", title: "Year-End Gathering", location: "📍 Baguio City", year: "2024", status: "COMPLETED", description: "Heartfelt year-end gathering bringing scholars together to reconnect, share a meal, and find strength in the spirit of 'Kaibigan'." },
    { id: 12, date: "FEB 22-23, 2025", shortTitle: "Caramay", title: "Caramay Science Reviews", location: "📍 Online", year: "2025", status: "COMPLETED", description: "Intensive online Science review sessions breaking down complex topics across Physics, Chemistry, Biology, and Earth Science." },
    { id: 13, date: "APR 5-6, 2025", shortTitle: "Proj REACH", title: "Project REACH", location: "📍 Online & On-Ground", year: "2025", status: "COMPLETED", description: "National initiative offering comprehensive review sessions in English, Science, Math, and Logic to bridge learning gaps for aspiring scholars." },
    { id: 14, date: "APR 24-25, 2025", shortTitle: "UPB Fair", title: "UP Baguio Fair Booth", location: "📍 UP Baguio", year: "2025", status: "COMPLETED", description: "Operated a food stall selling popular street foods to boost visibility, recruit new members, and support fundraising efforts." },
    { id: 15, date: "MAY 21, 2025", shortTitle: "JLSS Stories", title: "JLSS Testimonials", location: "📍 Online", year: "2025", status: "COMPLETED", description: "Inspiring series of testimonials featuring current JLSS awardees sharing their diverse experiences, hurdles, and triumphs." },
    { id: 16, date: "JUL 23, 2025", shortTitle: "Crising Drive", title: "Crising & Dante Drive", location: "📍 Online", year: "2025", status: "COMPLETED", description: "Urgent donation drive gathering funds for critical necessities in response to widespread devastation caused by Tropical Storms." },
    { id: 17, date: "AUG 10, 2025", shortTitle: "JLSS Exams", title: "JLSS Exam Support", location: "📍 Luzon Test Centers", year: "2025", status: "COMPLETED", description: "Celebrated the dedication of nearly 8,000 aspiring scholars participating in the JLSS Qualifying Examination across 30 centers." },
    { id: 18, date: "SEP 28, 2025", shortTitle: "Blood Drive", title: "Mobile Blood Donation", location: "📍 Marcoville Hall", year: "2025", status: "COMPLETED", description: "A life-saving initiative gathering generous donors and dedicated volunteers to provide critical medical support to those in need." },
    { id: 19, date: "OCT 5, 2025", shortTitle: "GA 2025", title: "2025 General Assembly", location: "📍 Camp John Hay", year: "2025", status: "COMPLETED", description: "Gathering of working committees for strategic planning and camaraderie under the theme 'Shuffle, Deal, Serve'." },
    { id: 20, date: "NOV 12, 2025", shortTitle: "Uwan Drive", title: "Typhoon Uwan Relief", location: "📍 KSU Student Center", year: "2025", status: "COMPLETED", description: "Donation drive to deliver immediate relief to displaced communities, gathering essential in-kind contributions." },
    { id: 21, date: "NOV 17, 2025", shortTitle: "Orientation", title: "Scholarship Orientation", location: "📍 Benguet National High", year: "2025", status: "COMPLETED", description: "Outreach initiative bringing scholar-volunteers directly into classrooms to share their journeys and the impact of the DOST-SEI program." },
    { id: 22, date: "JAN 17-25, 2026", shortTitle: "ALAB", title: "ALAB Review Sessions", location: "📍 Online", year: "2026", status: "COMPLETED", description: "Intensive review series equipping aspiring DOST-SEI scholars with knowledge across STEM subjects to hone problem-solving skills." },
    { id: 23, date: "FEB 21-22, 2026", shortTitle: "2026 Exams", title: "2026 Exam Support", location: "📍 BSU & Baguio High", year: "2026", status: "COMPLETED", description: "Culmination of preparatory initiatives, mobilizing members to provide essential on-ground support and encouragement during the Exams." },
    { id: 24, date: "MAY 15-16, 2026", shortTitle: "Mid-Year GA", title: "Mid-Year Assembly", location: "📍 TBA", year: "2026", status: "RSVP OPEN", description: "A gathering for all scholars to evaluate the first half of the year and plan for upcoming community projects." },
    { id: 25, date: "AUG 12-16, 2026", shortTitle: "SLC 2026", title: "Leadership Boot Camp", location: "📍 TBA", year: "2026", status: "UPCOMING", description: "The annual DOST-SEI Scholars Leadership Boot Camp to develop the next generation of S&T leaders in the Cordilleras." },
    { id: 26, date: "SEP 10-12, 2026", shortTitle: "Sci Fair", title: "Regional Science Fair", location: "📍 Benguet State Univ", year: "2026", status: "UPCOMING", description: "ACE CARDS volunteers will be serving as assistant judges and marshals for the annual regional high school science fair." },
    { id: 27, date: "OCT 24, 2026", shortTitle: "Anniversary", title: "ACE CARDS Gala", location: "📍 Baguio Convention", year: "2026", status: "TBA", description: "A formal gala celebrating the foundation and history of the organization, welcoming alumni and current scholars alike." },
    { id: 28, date: "NOV 20, 2026", shortTitle: "2027 Orient", title: "2027 Orientations", location: "📍 Multiple Schools", year: "2026", status: "UPCOMING", description: "Kick-off for the 2027 scholarship campaign, visiting top high schools across the Cordilleras to encourage applications." },
    { id: 29, date: "JAN 15-24, 2027", shortTitle: "ALAB '27", title: "ALAB 2027 Kickoff", location: "📍 Online", year: "2027", status: "TBA", description: "The return of our intensive review series for the new batch of aspiring DOST-SEI scholars, featuring updated modules." },
    { id: 30, date: "MAR 05, 2027", shortTitle: "NSTW", title: "National S&T Week", location: "📍 Manila & CAR", year: "2027", status: "TBA", description: "ACE CARDS delegates will represent the Cordilleras in the National Science and Technology Week exhibits." }
  ];

  const filteredEvents = events.filter(event => {
    let matchesFilter = true;
    if (activeFilter !== "ALL") {
      if (activeFilter === "COMPLETED") matchesFilter = event.status === "COMPLETED";
      else if (activeFilter === "UPCOMING") matchesFilter = ["RSVP OPEN", "UPCOMING", "TBA"].includes(event.status);
      else matchesFilter = event.year === activeFilter;
    }

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.date.toLowerCase().includes(query);
    }

    return matchesFilter && matchesSearch;
  });

  const currentEvent = filteredEvents[activeIndex] || filteredEvents[0];
  const isUpcoming = currentEvent && ["RSVP OPEN", "UPCOMING", "TBA"].includes(currentEvent.status);
  const sectionTitle = isUpcoming ? "Upcoming Events" : "Accomplished Activities";

  useEffect(() => {
    setActiveIndex(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    if (timelineRef.current && filteredEvents.length > 0) {
      const activeNode = timelineRef.current.children[activeIndex] as HTMLElement;
      if (activeNode) {
        activeNode.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex, filteredEvents.length]);

  const CARD_SLOT_WIDTH = 352;

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cards = Array.from(container.children) as HTMLElement[];
      
      if (filteredEvents.length > 0 && index < filteredEvents.length) {
        const targetCard = cards[index];
        const paddingLeft = cards[0].offsetLeft;
        
        container.scrollTo({
          left: targetCard.offsetLeft - paddingLeft,
          behavior: "smooth",
        });
      }
    }
  };

  const scroll = (direction: "left" | "right") => {
    let newIndex = activeIndex;
    if (direction === "left") {
      newIndex = Math.max(0, activeIndex - 1);
    } else {
      newIndex = Math.min(filteredEvents.length - 1, activeIndex + 1);
    }
    scrollToCard(newIndex);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && filteredEvents.length > 0) {
      const container = scrollContainerRef.current;
      const cards = Array.from(container.children) as HTMLElement[];
      const paddingLeft = cards[0].offsetLeft;
      
      let closestIndex = activeIndex;
      let minDistance = Infinity;

      for (let i = 0; i < filteredEvents.length; i++) {
        const targetScrollPosition = cards[i].offsetLeft - paddingLeft;
        const distance = Math.abs(container.scrollLeft - targetScrollPosition);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    }
  };

  const EventCard = ({ event, isActive }: { event: typeof events[0], isActive: boolean }) => {
    let buttonStyles = "";
    let buttonText = "";
    
    if (event.status === 'RSVP OPEN') {
      buttonStyles = "bg-[#011638] text-white border-transparent hover:bg-white hover:text-[#011638] hover:border-[#011638] shadow-[4px_4px_0px_0px_rgba(185,47,63,1)] hover:shadow-none";
      buttonText = "BOOK TICKET";
    } else if (event.status === 'COMPLETED') {
      buttonStyles = "bg-transparent text-[#011638] border-[#011638] hover:bg-[#011638] hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(1,22,56,1)] focus:shadow-[4px_4px_0px_0px_rgba(1,22,56,1)]";
      buttonText = "VIEW RECAP";
    } else {
      buttonStyles = "bg-gray-200 text-gray-500 border-transparent cursor-not-allowed";
      buttonText = "COMING SOON";
    }

    return (
      <div 
        className={`w-full max-w-[320px] w-[320px] min-h-[420px] border-4 border-[#011638] rounded-2xl bg-white p-6 md:p-8 relative overflow-hidden flex-shrink-0 flex flex-col snap-start group transition-transform duration-300 cursor-pointer ${isActive ? '-translate-y-3 shadow-[12px_12px_0px_0px_rgba(1,22,56,1)]' : 'hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(1,22,56,1)]'}`}
      >
        <div className="absolute -bottom-16 -right-16 transition-transform duration-500 z-0 text-[#eff0f2] opacity-60 group-hover:scale-110">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.1C12 2.1 4 9 4 14.5C4 17.5 6.5 20 9.5 20C11 20 12 19 12 19C12 19 13 20 14.5 20C17.5 20 20 17.5 20 14.5C20 9 12 2.1 12 2.1ZM10 23L12 18L14 23H10Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className={`font-black text-xl border-b-4 border-[#011638] pb-3 mb-5 flex justify-between items-center transition-colors duration-300 ${isActive ? 'text-[#b52f3f]' : 'text-[#011638]'}`}>
            <span>{event.date}</span>
            <span className={`text-2xl -mt-1 ${isActive ? 'text-[#b52f3f]' : 'text-[#011638]'}`}>♠</span>
          </div>
          
          <h3 className="text-2xl font-extrabold text-[#011638] uppercase mb-2 leading-tight">
            {event.title}
          </h3>
          <p className="text-sm font-bold text-gray-400 mb-4 tracking-wide uppercase">
            {event.location}
          </p>
          <p className="text-base font-medium text-gray-700 mb-8 flex-grow">
            {event.description}
          </p>
          
          <div className="mt-auto flex flex-col gap-3 relative">
            <span className={`text-xs font-black tracking-widest uppercase text-center ${isUpcoming ? 'text-[#b52f3f]' : 'text-gray-500'}`}>
              STATUS: {event.status}
            </span>
            <button 
              disabled={event.status === 'TBA' || event.status === 'UPCOMING'}
              className={`w-full font-extrabold text-lg py-3 rounded-xl border-4 transition-transform duration-300 focus:outline-none focus:-translate-y-1 ${buttonStyles}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative min-h-screen pb-24 bg-[#fbfaf8] border-b-8 border-[#011638] overflow-x-hidden pt-12">
      
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#011638 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10">
        
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row justify-between items-center gap-4 mb-16 lg:pr-12">
          
          <div className="relative group w-full sm:w-[300px] md:w-[400px]">
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-[3px] border-[#011638] rounded-full px-5 py-2 pl-12 text-base md:text-lg font-bold text-[#011638] bg-white outline-none transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(1,22,56,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-[2px_2px_0px_0px_rgba(1,22,56,1)] placeholder:text-gray-400"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#011638] transition-colors duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="relative group w-full sm:w-auto">
            <select 
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none border-[3px] border-[#011638] rounded-full px-6 py-2 pr-12 text-lg font-black text-[#011638] bg-white outline-none cursor-pointer transition-transform duration-300 hover:shadow-[4px_4px_0px_0px_rgba(1,22,56,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-[2px_2px_0px_0px_rgba(1,22,56,1)] tracking-widest uppercase"
            >
              <option value="ALL">ALL EVENTS</option>
              <optgroup label="By Status">
                <option value="UPCOMING">UPCOMING</option>
                <option value="COMPLETED">ACCOMPLISHED</option>
              </optgroup>
              <optgroup label="By Year">
                <option value="2027">2027</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </optgroup>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#011638] text-xl flex items-center justify-center">
              <span className="block transition-transform duration-300 group-hover:rotate-180 leading-none">
                ♠
              </span>
            </div>
          </div>
        </div>

        <div className="relative w-full mb-24 mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4">
          <div className="min-w-max mx-auto px-5 lg:px-20 relative flex items-center justify-center">
            <div className="absolute left-0 right-0 h-2 bg-[#011638] z-0"></div>
            
            <div 
              ref={timelineRef}
              className="relative z-10 grid place-items-center w-full"
              style={{ gridTemplateColumns: `repeat(${filteredEvents.length}, minmax(130px, 1fr))` }}
            >
              {filteredEvents.map((node, index) => {
                const isActive = index === activeIndex;
                return (
                  <div 
                    key={node.id} 
                    onClick={() => scrollToCard(index)}
                    className="flex flex-col items-center group cursor-pointer w-full px-2"
                  >
                    <div className={`mb-4 bg-[#fbfaf8] px-2 py-1 text-center transition-transform duration-300 ${isActive ? '-translate-y-2' : 'group-hover:-translate-y-1'}`}>
                      <span className={`font-extrabold text-[10px] sm:text-xs md:text-sm uppercase tracking-wider block leading-tight transition-colors duration-300 ${isActive ? 'text-[#b52f3f]' : 'text-[#011638]'}`}>
                        - {node.shortTitle} -
                      </span>
                    </div>
                    
                    <div className={`w-5 h-5 sm:w-8 sm:h-8 rounded-full border-[4px] sm:border-[6px] border-[#fbfaf8] ring-2 ring-transparent transition-all duration-300 relative z-10 shadow-sm flex-shrink-0 
                      ${isActive ? 'bg-[#b52f3f] ring-[#b52f3f] scale-125' : 'bg-[#011638] group-hover:ring-[#b52f3f] group-hover:bg-[#b52f3f]'}`}>
                    </div>
                    
                    <div className={`mt-4 bg-[#fbfaf8] px-2 py-1 text-center transition-transform duration-300 ${isActive ? 'translate-y-2' : 'group-hover:translate-y-1'}`}>
                      <span className={`font-bold text-xs sm:text-sm md:text-base tracking-widest block transition-colors duration-300 ${isActive ? 'text-[#b52f3f]' : 'text-[#011638]'}`}>
                        {node.year}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full relative mt-16">
          
          <div className="max-w-7xl mx-auto px-5 flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-6">
            <div className="overflow-hidden">
              <h2 key={sectionTitle} className="text-4xl lg:text-5xl font-extrabold text-[#011638] uppercase tracking-widest mb-2">
                {sectionTitle}
              </h2>
              <div className="h-2 w-32 bg-[#b52f3f]"></div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => scroll("left")} className="w-14 h-14 flex items-center justify-center border-4 border-[#011638] bg-white rounded-full text-[#011638] font-black text-2xl transition-transform duration-300 hover:bg-[#011638] hover:text-white shadow-[4px_4px_0px_0px_rgba(1,22,56,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:outline-none">
                ←
              </button>
              <button onClick={() => scroll("right")} className="w-14 h-14 flex items-center justify-center border-4 border-[#011638] bg-white rounded-full text-[#011638] font-black text-2xl transition-transform duration-300 hover:bg-[#011638] hover:text-white shadow-[4px_4px_0px_0px_rgba(1,22,56,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 focus:outline-none">
                →
              </button>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-8 overflow-x-auto snap-x snap-mandatory py-6 px-5 sm:px-10 md:px-16 lg:px-24 xl:px-32 2xl:px-48 scroll-pl-5 sm:scroll-pl-10 md:scroll-pl-16 lg:scroll-pl-24 xl:scroll-pl-32 2xl:scroll-pl-48 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full"
          >
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} isActive={index === activeIndex} />
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="w-full text-center py-12 text-[#011638] flex flex-col items-center justify-center">
                <span className="text-5xl mb-4">♠</span>
                <h3 className="font-extrabold text-2xl uppercase tracking-widest">No events found</h3>
                <p className="font-bold text-gray-500 mt-2">Try adjusting your search or filter.</p>
              </div>
            )}
            
            <div className="min-w-[80vw] flex-shrink-0"></div>
          </div>

        </div>

      </div>
    </section>
  );
}