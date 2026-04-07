"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutOrg from "./about-org";
import AboutMission from "./about-mission";
import AboutMascot from "./about-mascot";

export default function AboutUs() {
  const router = useRouter();

  return (
    <div className="bg-[#f8f9fa] text-[#141414] min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-[-10%] w-[600px] h-[600px] bg-[#eec643] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10 fixed"></div>
      <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] bg-[#0d21a1] rounded-full blur-[150px] opacity-10 pointer-events-none -z-10 fixed"></div>
      <div className="absolute bottom-0 left-[20%] w-[700px] h-[700px] bg-[#011638] rounded-full blur-[150px] opacity-5 pointer-events-none -z-10 fixed"></div>

      <NavBar />

      <main className="flex-grow relative z-10">
        
        <div className="absolute top-24 left-4 sm:left-6 lg:left-12 z-50">
          <button 
            onClick={() => router.back()}
            className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-white hover:scale-105 hover:shadow-md transition-all text-[#011638] flex items-center justify-center backdrop-blur-md"
            aria-label="Go back"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <line x1="19" y1="12" x2="5" y2="12" />
               <polyline points="12 19 5 12 12 5" />
             </svg>
          </button>
        </div>

        <AboutOrg />
        <AboutMission />
        <AboutMascot />
      </main>

      <Footer />
    </div>
  );
}