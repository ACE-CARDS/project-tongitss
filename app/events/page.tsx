"use client";

import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import EventsTimeline from "./events-timeline";
import BackButton from "@/components/backButton";

export default function EventsPage() {
  return (
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />

      <main className="flex-grow px-6 sm:px-10 lg:px-20 py-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-4">
            <BackButton />
          </div>

          {/* INTRO PARAGRAPH SECTION */}
          <section className="relative pt-6 pb-12 px-5 flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl md:text-4xl text-[#eec643]">♠</span>
              <h1 className="text-4xl md:text-6xl font-black font-oswald bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
                Events & Activities
              </h1>
              <span className="text-3xl md:text-4xl text-[#eec643]">♠</span>
            </div>
            
            <p className="max-w-3xl text-lg text-slate-600 font-ubuntu-mono leading-relaxed font-medium">
            </p>
          </section>

          <EventsTimeline />
        </div>
      </main>

      <Footer />
    </div>
  );
}