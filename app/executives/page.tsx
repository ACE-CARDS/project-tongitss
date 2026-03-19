"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";

export default function Executives() {
  const [executives, setExecutives] = useState([]);
  const [selectedAY, setSelectedAY] = useState("AY 2025-2026"); // default latest AY

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

      setExecutives(formatted);
    };

    fetchExecutives();
  }, [selectedAY]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavBar />

      <main className="px-6 sm:px-10 lg:px-20 py-20">
        {/* title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-gray-900 via-black to-slate-900 bg-clip-text text-transparent mb-2">
            Our Executives
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Meet the visionary leaders shaping our organization across academic
            years
          </p>
        </div>

        {/* fltre */}
        <div className="flex justify-center mb-16">
          <select
            className="appearance-none bg-white/80 backdrop-blur-xl px-6 py-3 border-2 border-black/20 rounded-xl text-lg font-semibold text-slate-800 focus:outline-none focus:border-black/50 hover:shadow-lg transition"
            value={selectedAY}
            onChange={(e) => setSelectedAY(e.target.value)}
          >
            <option value="AY 2025-2026">AY 2025-2026</option>
            <option value="AY 2024-2025">AY 2024-2025</option>
            <option value="AY 2023-2024">AY 2023-2024</option>
            <option value="AY 2022-2023">AY 2022-2023</option>
          </select>
        </div>

        {/* execs proper */}
        {executives.length === 0 ? (
          <p className="text-center text-slate-500 text-lg">
            No executives found 👀
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {executives.map((exec, index) => (
              <div
                key={index}
                className="relative bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200 shadow-md flex flex-col items-center p-6"
                style={{ aspectRatio: "3/4" }}
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
                  <div className="w-40 h-40 mb-3 overflow-hidden rounded-full border-4 border-white shadow-lg bg-white">
                    <img
                      src={exec.image}
                      alt={exec.name}
                      className="w-full h-full object-cover opacity-100 transition-opacity duration-700"
                    />
                  </div>

                  {/* name */}
                  <h2 className="text-xl font-bold text-slate-900 mb-0.5 text-center truncate max-w-full">
                    {exec.name}
                  </h2>

                  {/* position */}
                  <p className="text-sm text-indigo-700 font-semibold mb-1 text-center truncate max-w-full">
                    {exec.position}
                  </p>

                  {/* ay */}
                  <p className="text-sm text-slate-400 mb-2 text-center">
                    {exec.acadyear}
                  </p>

                  {/* icons */}
                  <div className="flex justify-center gap-4 mt-auto">
                    {/* gmail */}
                    <a
                      href={`mailto:${exec.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:bg-slate-200 transition-colors"
                    >
                      <img
                        src="/assets/logos/gmail.jpg"
                        alt="Email"
                        className="w-7 h-7 object-cover"
                      />
                    </a>
                    {/* fb */}
                    {exec.fblink && (
                      <a
                        href={exec.fblink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:bg-blue-100 transition-colors"
                      >
                        <img
                          src="/assets/logos/facebook1.jpg"
                          alt="Facebook"
                          className="w-7 h-7 object-cover"
                        />
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
