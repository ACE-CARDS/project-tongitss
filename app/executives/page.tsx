"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/backButton";

export default function Executives() {
  const [executives, setExecutives] = useState([]);
  const [selectedAY, setSelectedAY] = useState("AY 2025-2026"); // default latest AY

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
        .select(
          `
          mem_fname,
          mem_lname,
          mem_email,
          acadyear,
          fblink,
          position,
          pics
        `,
        )
        .eq("acadyear", selectedAY);

      if (execError || !execData) return;

      const formatted = execData.map((item) => ({
        name: `${item.mem_fname} ${item.mem_lname}`,
        email: item.mem_email,
        acadyear: item.acadyear,
        fblink: item.fblink,
        position: item.position || "Member",
        image: item.pics || "/assets/logos/executives/default.png",
      }));

      setExecutives(
        formatted.sort((a, b) => roleOrder.indexOf(a.position) - roleOrder.indexOf(b.position))
      );
    };

    fetchExecutives();
  }, [selectedAY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavBar />

      <main className="px-6 sm:px-10 lg:px-20 py-8"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', //dotted
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed" 
      }}>
      <div className=" justify mb-4">
                            <BackButton />
                  </div>
        {/* title */}
        <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-5xl text-[#eec643]">♠</span>
          <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent mb-3">
            Our Executives
          </h1>
          <span className="text-5xl text-[#eec643]">♠</span>
        </div>
          
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Meet the visionary leaders shaping our organization across academic years
          </p>
        </div>

        {/* fltre */}
        <div className="flex justify-center mb-8">
        <div className="relative">
          <select
            className="appearance-none bg-white/80 backdrop-blur-xl px-6 py-3 border-2 border-black/20 rounded-xl text-lg font-semibold text-slate-800 focus:outline-none focus:border-black/50 hover:shadow-lg transition pr-10"
            value={selectedAY}
            onChange={(e) => setSelectedAY(e.target.value)}
          >
            <option value="AY 2025-2026">AY 2025-2026</option>
            <option value="AY 2024-2025">AY 2024-2025</option>
            <option value="AY 2023-2024">AY 2023-2024</option>
            <option value="AY 2022-2023">AY 2022-2023</option>
          </select>

          {/* arrow sa tabi */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
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
          <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
  {executives.map((exec, index) => (
    <div
      key={index}
      className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center p-8"
      style={{ width: "280px", height: "350px" }} // uniform size
    >
              {/* logo bg */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'url("/assets/logos/ACE CARDS logo.png")',
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            
              <div className="relative z-10 flex flex-col items-center justify-start h-full">
                {/* img */}
                <div className="w-30 h-30 mb-2 overflow-hidden rounded-full border-3 border-white shadow-md bg-white">
                  <img
                    src={exec.image}
                    alt={exec.name}
                    className="w-full h-full object-cover"
                  />
                </div>
            
                {/* name */}
                <h2 className="text-lg font-bold text-slate-900 mb-0.5 text-center truncate max-w-full">
                  {exec.name}
                </h2>
            
                {/* position */}
                <p className="text-xs text-indigo-600 font-medium mb-1 text-center truncate max-w-full px-2 py-0.5 bg-blue-100 rounded-full">
                  {exec.position}
                </p>
            
                {/* ay */}
                <p className="text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full mb-2 text-center">
                  {exec.acadyear}
                </p>
            
                {/* icons */}
                <div className="flex justify-center gap-3 mt-auto">
                  <a
                    href={`mailto:${exec.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:scale-105 hover:bg-indigo-50 transition-transform duration-300"
                  >
                    <img src="/assets/logos/gmail.jpg" alt="Email" className="w-6 h-6 object-cover" />
                  </a>
                  {exec.fblink && (
                    <a
                      href={exec.fblink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:scale-105 hover:bg-indigo-50 transition-transform duration-300"
                    >
                      <img src="/assets/logos/facebook1.jpg" alt="Facebook" className="w-6 h-6 object-cover" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
