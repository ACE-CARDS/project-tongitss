"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/backButton";
import LoadingState from "@/components/mainLoadingState";
import { BsSuitSpadeFill } from "react-icons/bs";

const STORAGE_URL =
  "https://lnxkspjvyiceoiibdjow.supabase.co/storage/v1/object/public/member-photos";

function ExecutivesContent() {
  const [executives, setExecutives] = useState([]);
  const [selectedAY, setSelectedAY] = useState("AY 2025-2026");
  const [isLoading, setIsLoading] = useState(true);

  const roleOrder = [
    "Regional Director",
    "Director for Internal Affairs",
    "Deputy Director for Internal Affairs",
    "Director for External Affairs",
    "Deputy Director for External Affairs",
    "Secretary",
    "Assistant Secretary",
    "Finance and Business Committee Head",
    "Finance and Business Committee Deputy",
    "Publicity and Media Committee Head",
    "Publicity and Media Committee Deputy",
    "Education and Research Committee Head",
    "Education and Research Committee Deputy",
    "Events and Logistics Committee Head",
    "Events and Logistics Committee Deputy",
  ];

  useEffect(() => {
    const fetchExecutives = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data: execData, error: execError } = await supabase
        .from("member")
        .select(
          `
          mem_fname,
          mem_lname,
          mem_email,
          acadyear,
          fblink,
          committee!inner (comm_name)
        `,
        )
        .eq("acadyear", selectedAY)
        .eq("is_active", true)
        .in("committee.comm_name", roleOrder);

      if (execError) {
        console.error("Fetch error:", execError);
        setIsLoading(false);
        return;
      }

      if (execData) {
        const formatted = execData.map((person) => {
          const fileName = `${person.mem_fname}_${person.mem_lname}`.replace(
            /\s+/g,
            "",
          );
          const photoUrl = `${STORAGE_URL}/${fileName}.jpg`;

          return {
            name: `${person.mem_fname} ${person.mem_lname}`,
            email: person.mem_email,
            acadyear: person.acadyear,
            fblink: person.fblink,
            position: person.committee?.comm_name,
            image: photoUrl,
          };
        });

        const sorted = formatted.sort((a, b) => {
          return roleOrder.indexOf(a.position) - roleOrder.indexOf(b.position);
        });

        setExecutives(sorted);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };

    fetchExecutives();
  }, [selectedAY]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8]"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      <main className="px-6 sm:px-10 lg:px-28 py-8">
        <BackButton />

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl text-[#eec643]">♠</span>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent mb-3 uppercase tracking-tight">
              OUR EXECUTIVES
            </h1>
            <span className="text-5xl text-[#eec643]">♠</span>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Meet the visionary leaders shaping our organization across academic
            years
          </p>
        </div>

        {/* Filter Dropdown etc */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <select
              className="appearance-none bg-white/70 backdrop-blur-xl px-6 py-3 pr-12 border border-slate-300 rounded-2xl text-slate-800 font-medium shadow-sm hover:shadow-md transition focus:outline-none"
              value={selectedAY}
              onChange={(e) => setSelectedAY(e.target.value)}
            >
              <option>AY 2025-2026</option>
              <option>AY 2024-2025</option>
              <option>AY 2023-2024</option>
              <option>AY 2022-2023</option>
            </select>

            {/* dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* execs proper */}
        {executives.length === 0 ? (
          <p className="text-center text-slate-500 text-lg">
            No executives found 👀
          </p>
        ) : (
          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-7 max-w-7xl">
              {executives.map((exec, index) => {
                const fallbackUrl = `https://ui-avatars.com/api/?name=${exec.name}&background=f1f5f9&color=64748b&bold=true`;

                return (
                  <div
                    key={index}
                    className="group relative rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-md
                transition-all duration-300 ease-out
                hover:-translate-y-3 hover:shadow-2xl hover:border-indigo-200 hover:bg-white
                aspect-[3/4]
                w-[42%] sm:w-[42%] md:w-[28%] lg:w-[20%]
                min-h-[180px] sm:min-h-[240px]"
                  >
                    {/* logo bg */}
                    <div className="absolute inset-0 opacity-18 overflow-hidden ">
                      <BsSuitSpadeFill className="size-10 md:size-10 text-[#141414] absolute top-5 left-5" />
                      <BsSuitSpadeFill className="size-10 md:size-10 text-[#141414] absolute bottom-5 right-5 rotate-180" />
                      <BsSuitSpadeFill className="size-50 md:size-50 text-[#eec643] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* glow effect */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-indigo-100/40 to-transparent" />

                    <div className="relative flex justify-center mt-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:scale-105 transition">
                        {/* img */}
                        <img
                          src={exec.image}
                          className="w-full h-full object-cover"
                          alt={exec.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackUrl;
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col items-center">
                      <h2 className="mt-2 sm:mt-4 text-center font-bold text-sm sm:text-lg text-[#011638] line-clamp-2 min-h-[2.5rem]">
                        {exec.name}
                      </h2>
                      <span className="mt-1 text-[10px] sm:text-xs text-[#0d21a1] px-2 py-1 rounded-lg bg-[#0d21a1]/10 font-bold uppercase text-center line-clamp-2">
                        {exec.position}
                      </span>
                    </div>

                    <div className="flex justify-center gap-3 mt-4 pb-2">
                      <a
                        href={`mailto:${exec.email}`}
                        className="hover:scale-110 transition"
                      >
                        <img
                          src="/assets/logos/gmail.jpg"
                          alt="Email"
                          className="w-5 h-5 rounded-full"
                        />
                      </a>
                      {exec.fblink && (
                        <a
                          href={exec.fblink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:scale-110 transition"
                        >
                          <img
                            src="/assets/logos/facebook1.jpg"
                            alt="FB"
                            className="w-5 h-5 rounded-full"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function Executives() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ExecutivesContent />
    </Suspense>
  );
}
