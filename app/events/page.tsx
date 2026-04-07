"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import EventsTimeline from "./events-timeline";
import BackButton from "@/components/backButton";

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative">
      
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-[100] w-full">
        <NavBar />
      </div>

      <main 
        className="flex-grow px-6 sm:px-10 lg:px-20 py-8"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed" 
        }}
      >
        <div className="justify mb-4">
          <BackButton />
        </div>

        {/* TITLE SECTION MATCHING EXECUTIVES */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl text-[#eec643]">♠</span>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent mb-3 uppercase tracking-tight">
              Events
            </h1>
            <span className="text-5xl text-[#eec643]">♠</span>
          </div>
          
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Tracking our journey through the Cordilleras. From community immersions to academic empowerment, explore the milestones of ACE CARDS.
          </p>
        </div>

        {/* INTERACTIVE TIMELINE & CAROUSEL */}
        <EventsTimeline />
      </main>

      <Footer />
    </div>
  );
}