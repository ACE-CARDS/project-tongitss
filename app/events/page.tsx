"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import EventsTimeline from "./events-timeline";

export default function EventsPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f8f9fa] text-[#141414] min-h-screen flex flex-col relative overflow-hidden">
      {/* GLOBAL BACKGROUND ACCENTS (Ambient Glows) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#eec643] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10"></div>
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-[#0d21a1] rounded-full blur-[120px] opacity-10 pointer-events-none -z-10"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-[#011638] rounded-full blur-[150px] opacity-5 pointer-events-none -z-10"></div>

      <NavBar />

      <main className="flex-grow relative z-10 pb-8">
        {/* HERO SECTION */}
        <section className="pt-32 pb-16 px-6 lg:px-20 relative">
          {/* Glassmorphism backing for the hero */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10 border-b border-white/60"></div>

          {/* ABSOLUTE TOP-LEFT BACK BUTTON */}
          <div className="absolute top-24 left-4 sm:left-6 lg:left-12 z-50">
            <button
              onClick={() => router.back()}
              className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-white hover:scale-105 hover:shadow-md transition-all text-[#011638] flex items-center justify-center backdrop-blur-md"
              aria-label="Go back"
            >
              <svg
                width="24"
                height="24"
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
          </div>

          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative mt-12 lg:mt-4">
            {/* TITLE & DESCRIPTION */}
            <div className="text-center lg:text-left flex-1 relative z-10">
              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black bg-gradient-to-r from-[#eec643] via-[#0d21a1] to-[#011638] bg-clip-text text-transparent leading-none drop-shadow-sm uppercase tracking-tight">
                Events
              </h1>
              <div className="w-24 h-1.5 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-6 mx-auto lg:mx-0 rounded-full shadow-sm"></div>

              <p className="mt-8 text-[#141414]/80 text-lg sm:text-xl leading-relaxed backdrop-blur-md bg-white/60 px-8 py-6 rounded-3xl shadow-lg max-w-2xl mx-auto lg:mx-0 border border-white">
                Tracking our journey through the Cordilleras. From community
                immersions to academic empowerment, explore the milestones of
                ACE CARDS.
              </p>
            </div>

            {/* HERO GRAPHIC */}
            <div className="flex-1 relative hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-square">
                {/* Decorative spinning background ring */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#eec643]/30 to-[#0d21a1]/30 rounded-full animate-[spin_15s_linear_infinite]"></div>

                {/* Main Glass Circle */}
                <div className="absolute inset-6 bg-white/50 backdrop-blur-xl rounded-full border-2 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/logos/ACE CARDS logo.png"
                    alt="ACE CARDS"
                    className="w-1/2 h-1/2 object-contain opacity-90 drop-shadow-2xl hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE TIMELINE & CAROUSEL */}
        <EventsTimeline />
      </main>

      <Footer />
    </div>
  );
}
