"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/backButton";

export default function Executives() {
  const [executives, setExecutives] = useState([]);
  const [selectedAY, setSelectedAY] = useState("AY 2025-2026");

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
    "Member"
  ];

  useEffect(() => {
    const fetchExecutives = async () => {
      const supabase = createClient();

      const { data: execData, error: execError } = await supabase
        .from("executives")
        .select(`
          mem_fname,
          mem_lname,
          mem_email,
          acadyear,
          fblink,
          position,
          pics
        `)
        .eq("acadyear", selectedAY);

      if (execError || !execData) return;

      const positionOrder = {
        "Regional Director": 1,
        "Director for Internal Affairs": 2,
        "Deputy Director for Internal Affairs": 3,
        "Director for External Affairs": 4,
        "Deputy Director for External Affairs": 5,
        "Secretary": 6,
        "Assistant Secretary": 6,
        "Finance and Business Committee Head": 7,
        "Finance and Business Committee Deputy": 8,
        "Publicity and Media Committee Head": 9,
        "Publicity and Media Committee Deputy": 10,
        "Education and Research Committee Head": 11,
        "Education and Research Committee Deputy": 12,
        "Events and Logistics Committee Head": 13,
        "Events and Logistics Committee Deputy": 14,
      };

      const formatted = execData
        .map((item) => ({
          name: `${item.mem_fname} ${item.mem_lname}`,
          email: item.mem_email,
          acadyear: item.acadyear,
          fblink: item.fblink,
          position: item.position || "Member",
          image: item.pics || "/assets/logos/executives/default.png",
        }))
        .sort((a, b) => {
          const orderA = positionOrder[a.position] ?? 999;
          const orderB = positionOrder[b.position] ?? 999;
          return orderA - orderB;
        });

      setExecutives(
        formatted.sort((a, b) => roleOrder.indexOf(a.position) - roleOrder.indexOf(b.position))
      );
    };

    fetchExecutives();
  }, [selectedAY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed"
      }}
    >
      <NavBar />

      <main className="px-6 sm:px-10 lg:px-20 py-24">
      <BackButton />

        {/* title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl text-[#eec643]">♠</span>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent mb-3 uppercase tracking-tight">
              OUR EXECUTIVES
            </h1>
            <span className="text-5xl text-[#eec643]">♠</span>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Meet the visionary leaders shaping our organization across academic years
          </p>
        </div>

        {/* fltre */}
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
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" > 
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /> 
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

              {executives.map((exec, index) => (
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
                  <div className="absolute inset-0 opacity-10" 
                      style={{ backgroundImage: 'url("/assets/logos/ACE CARDS logo.png")', 
                      backgroundSize: "cover", 
                      backgroundPosition: "center", 
                      backgroundRepeat: "no-repeat", }} 
                  />

                  {/* glow effect */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-br from-indigo-100/40 to-transparent" />

                  {/* img */}
                  <div className="relative flex justify-center mt-2">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden group-hover:scale-105 transition">
                      <img
                        src={exec.image}
                        className="w-full h-full object-cover"
                        alt={exec.name}
                      />
                    </div>
                  </div>

                  {/* name */}
                  <h2 className="mt-4 text-center font-bold text-lg text-slate-900">
                    {exec.name}
                  </h2>

                  {/* position */}
                  <div className="flex justify-center mt-1">
                    <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-center">
                      {exec.position}
                    </span>
                  </div>

                  {/* ay */}
                  <p className="text-center text-xs text-slate-400 mt-2">
                    {exec.acadyear}
                  </p>

                  {/* icons */}
                  <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-4">
                    {/* gmail */}
                    <a
                      href={`mailto:${exec.email}`}
                      className="w-10 h-10 rounded-full bg-white shadow hover:scale-110 transition flex items-center justify-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src="/assets/logos/gmail.jpg" alt="Email" className="w-6 h-6 object-cover" />
                    </a>
                    {/* fb */}
                    {exec.fblink && (
                      <a
                        href={exec.fblink}
                        className="w-10 h-10 rounded-full bg-white shadow hover:scale-110 transition flex items-center justify-center"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img src="/assets/logos/facebook1.jpg" alt="Facebook" className="w-6 h-6 object-cover" />
                      </a>
                    )}
                  </div>

                </div>
              ))}

            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}