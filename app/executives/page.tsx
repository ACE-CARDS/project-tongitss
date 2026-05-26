"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/utils/supabase/client";
import BackButton from "@/components/ui/backButton";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { BsSuitSpadeFill } from "react-icons/bs";
import AnimatedTitle from "@/components/ui/animatedTitle";
import FilterDropdown from "@/components/ui/filterDropdown";

const STORAGE_URL =
  "https://lnxkspjvyiceoiibdjow.supabase.co/storage/v1/object/public/member-photos";

interface Member {
  fname: string;
  lname: string;
  email: string;
  acadyear: string;
  fblink?: string;
  position: string;
}

function ExecutivesContent() {
  const [executives, setExecutives] = useState<Member[]>([]);
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

  const ayOptions = [
    { label: "AY 2025-2026", value: "AY 2025-2026" },
    { label: "AY 2024-2025", value: "AY 2024-2025" },
    { label: "AY 2023-2024", value: "AY 2023-2024" },
    { label: "AY 2022-2023", value: "AY 2022-2023" },
  ];

  const normalizeName = (str: string = "") => {
    if (!str) return "";
    return str
      .trim()
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    const fetchExecutives = async () => {
      setIsLoading(true);
      const supabase = createClient();

      const { data: execData, error: execError } = await supabase
        .from("member")
        .select(`
          mem_fname,
          mem_lname,
          mem_email,
          acadyear,
          fblink,
          committee!inner (comm_name)
        `)
        .eq("acadyear", selectedAY)
        .in("committee.comm_name", roleOrder);

      if (execError) {
        console.error("Fetch error:", execError);
        setIsLoading(false);
        return;
      }

      if (execData) {
        const formatted: Member[] = execData.map((person: any) => ({
          fname: person.mem_fname,
          lname: person.mem_lname,
          email: person.mem_email,
          acadyear: person.acadyear,
          fblink: person.fblink,
          position: person.committee?.comm_name || "Member",
        }));

        const sorted = formatted.sort((a, b) => {
          return roleOrder.indexOf(a.position) - roleOrder.indexOf(b.position);
        });

        setExecutives(sorted);
      }

      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };

    fetchExecutives();
  }, [selectedAY]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <NavBar />
      <div
        className="min-h-screen max-w-[1920px] mx-auto flex flex-col bg-[#fbfaf8]"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="container mx-auto pt-8 px-4 max-w-7xl">
          <BackButton />
        </div>
        <main className="px-6 sm:px-10 lg:px-28 pb-8">
          <div className="text-center mb-8">
            <AnimatedTitle title="Our EXECUTIVES" />
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Meet the visionary leaders shaping our organization across academic years
            </p>
          </div>

          {/* Reusable Filter Dropdown */}
          <div className="flex justify-center mb-10">
            <FilterDropdown 
              value={selectedAY} 
              options={ayOptions} 
              onChange={setSelectedAY} 
            />
          </div>

          {executives.length === 0 ? (
            <p className="text-center text-slate-500 text-lg">
              No executives found for this academic year.
            </p>
          ) : (
            <div className="w-full flex justify-center">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-7 max-w-7xl mx-auto">
                {executives.map((exec, index) => {
                  const firstNameClean = exec.fname.toLowerCase().trim().replace(/\s+/g, "");
                  const lastNameClean = exec.lname.toLowerCase().trim().replace(/\s+/g, "");
                  const baseFileName = `${firstNameClean}_${lastNameClean}`;
                  
                  const timestamp = new Date().getTime();
                  const photoUrlJpg = `${STORAGE_URL}/${baseFileName}.jpg?t=${timestamp}`;
                  const photoUrlPng = `${STORAGE_URL}/${baseFileName}.png?t=${timestamp}`;
                  const fallbackUrl = `https://ui-avatars.com/api/?name=${exec.fname}+${exec.lname}&background=f1f5f9&color=64748b&bold=true`;

                  return (
                    <div
                      key={`${exec.email}-${index}`}
                      className="group relative rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-slate-200 shadow-md
                      transition-all duration-300 ease-out
                      hover:-translate-y-3 hover:shadow-2xl hover:border-indigo-200 hover:bg-white
                      w-[260px] min-h-[260px] flex flex-col justify-between"
                    >
                      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
                        <BsSuitSpadeFill className="size-8 md:size-10 text-[#141414] absolute top-5 left-5" />
                        <BsSuitSpadeFill className="size-8 md:size-10 text-[#141414] absolute bottom-5 right-5 rotate-180" />
                      </div>

                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-indigo-100/40 to-transparent pointer-events-none" />

                      <div className="relative flex justify-center mt-1">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:scale-105 transition">
                          <img
                            src={photoUrlJpg}
                            className="w-full h-full object-cover"
                            alt={`${exec.fname} ${exec.lname}`}
                            onError={(e) => {
                              const img = e.currentTarget;
                              if (img.src === photoUrlJpg) {
                                img.src = photoUrlPng;
                              } else if (img.src === photoUrlPng) {
                                img.src = fallbackUrl;
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex-grow flex flex-col items-center">
                        <h2 className="mt-2 sm:mt-4 text-center font-bold text-sm sm:text-lg text-[#011638] line-clamp-2 min-h-[2.5rem]">
                          {normalizeName(exec.fname)} {normalizeName(exec.lname)}
                        </h2>
                        <span className="mt-1 text-[10px] sm:text-xs text-[#0d21a1] px-2 py-1 rounded-lg bg-[#0d21a1]/10 font-bold uppercase text-center line-clamp-2">
                          {exec.position}
                        </span>
                      </div>

                      <div className="flex justify-center gap-3 mt-4 pb-2">
                        {exec.fblink && (
                          <a
                            href={exec.fblink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:scale-110 transition shadow-sm hover:shadow-lg shadow-black/20 rounded-full px-1 py-1"
                          >
                            <img
                              src="/assets/logos/facebook1.jpg"
                              alt="FB"
                              className="w-6 h-6 rounded-full"
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
      </div>
      <Footer />
    </>
  );
}

export default function Executives() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ExecutivesContent />
    </Suspense>
  );
}