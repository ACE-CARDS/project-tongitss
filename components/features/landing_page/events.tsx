import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Events({id}: {id?: string}) {
  const supabase = createClient();
  const [displayCount, setDisplayCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const hasEventsAnimated = useRef(false);
  const sectionRef = useRef(null);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: eventTotal } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);

      setEventCount(eventTotal || 0);
    };

    fetchCounts();
  }, []);

  // count animation for events
  useEffect(() => {
    // If data hasn't loaded yet, don't even start the observer
    if (eventCount === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (hasEventsAnimated.current) return;
        
        //  Double check eventCount is valid before locking the animation
        if (eventCount > 0) {
          hasEventsAnimated.current = true;

          let start = 0;
          const target = eventCount;
          const duration = 500;
          const increment = target / (duration / 16);

          const interval = setInterval(() => {
            start += increment;

            if (start >= target) {
              setDisplayCount(target);
              clearInterval(interval);
            } else {
              setDisplayCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [eventCount]);

  return (
    <section
      id={id}
      ref={sectionRef}
      className="pt-8 pb-0 xl:py-8 px-6 xl:px-24 relative w-full mx-auto bg-gradient-to-br from-[#0a1a3a] to-[#011638] overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(#eec643 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="absolute top-0 left-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />

      <div className="w-full mx-auto mb-10 relative z-10">
        <div className="text-center mb-20 flex flex-col items-center">
          <h1 className="text-9xl sm:text-8xl xl:text-[200px] font-black text-white drop-shadow-2xl leading-none">
            {displayCount}
          </h1>
          <h3 className="text-xl sm:text-6xl xl:text-7xl font-bold text-white/90 mt-4">
            TOTAL
          </h3>
          <span className="text-4xl sm:text-6xl xl:text-8xl font-oswald font-extrabold text-white/90 mt-1">
            EVENTS
          </span>
          <p className="text-white/60 tracking-widest uppercase text-sm leading-tight mt-3">
            since establishment
          </p>

          <Link
            href="/events"
            onClick={() =>
              sessionStorage.setItem(
                "returnToHomeSection",
                "events-section",
              )
            }
            className="btn-yellow mt-8"
          >
            View Events→
          </Link>
        </div>
      </div>

      {/* Mobile */}
      <div className="[@media(min-width:1100px)]:hidden relative min-h-[45vh] flex items-start justify-center overflow-visible -mt-3 item-center pb-16 sm:pb-20">
        {/* UP Baguio Fair */}
        <div className="absolute top-0 rotate-[-10deg] translate-x-[-80px] z-10">
          <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
            <img
              src="/assets/logos/upbfair.jpg"
              alt="UP Baguio Fair"
              className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white text-xs font-semibold">
                  UP Baguio Fair
                </h3>
                <p className="text-white/80 text-[10px]">2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* UGE */}
        <div className="absolute top-[-10px] rotate-[-4deg] translate-x-[-25px] z-20">
          <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
            <img
              src="/assets/logos/uge26.jpeg"
              alt="UGE 26"
              className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white text-xs font-semibold">
                  Undergraduate Examination
                </h3>
                <p className="text-white/80 text-[10px]">2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inadalan */}
        <div className="absolute top-[-10px] rotate-[6deg] translate-x-[30px] z-30">
          <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
            <img
              src="/assets/logos/inadalan.jpg"
              alt="Inadalan"
              className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white text-xs font-semibold">
                  Inadalan
                </h3>
                <p className="text-white/80 text-[10px]">2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Donation */}
        <div className="absolute top-0 rotate-[12deg] translate-x-[85px] z-40">
          <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
            <img
              src="/assets/logos/blooddonation.jpg"
              alt="Blood Donation Drive"
              className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white text-xs font-semibold">
                  Blood Donation Drive
                </h3>
                <p className="text-white/80 text-[10px]">2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden [@media(min-width:1100px)]:block">
        {/* UP Baguio Fair */}
        <div className="absolute top-20 left-24 rotate-12 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
          <div className="relative">
            <img
              src="/assets/logos/upbfair.jpg"
              className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white font-bold text-sm">
                  UP Baguio Fair
                </h3>
                <p className="text-white/80 text-xs">2025</p>
              </div>
            </div>
          </div>
        </div>

        {/* UGE 26 */}
        <div className="absolute top-20 right-24 -rotate-6 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
          <div className="relative">
            <img
              src="/assets/logos/uge26.jpeg"
              className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white font-bold text-sm">
                  Undergraduate Examination
                </h3>
                <p className="text-white/80 text-xs">2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inadalan */}
        <div className="absolute bottom-20 left-45 rotate-3 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
          <div className="relative">
            <img
              src="/assets/logos/inadalan.jpg"
              className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white font-bold text-sm">Inadalan</h3>
                <p className="text-white/80 text-xs">2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blood Donation */}
        <div className="absolute bottom-20 right-45 -rotate-12 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
          <div className="relative">
            <img
              src="/assets/logos/blooddonation.jpg"
              className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                <h3 className="text-white font-bold text-sm">
                  Blood Donation Drive
                </h3>
                <p className="text-white/80 text-xs">2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};