"use client";

import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutOrg from "./about-org";
import AboutMission from "./about-mission";
import AboutMascot from "./about-mascot";
import BackButton from "@/components/backButton";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative text-slate-900">
      
      <div className="sticky top-0 z-[100] w-full">
        <NavBar />
      </div>

      <main 
        className="flex-grow relative z-10"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed" 
        }}
      >
        <div className="pt-8 px-6 sm:px-10 lg:px-20 w-full">
          <BackButton />
        </div>

        <AboutOrg />
        <AboutMission />
        <AboutMascot />
      </main>

      <Footer />
    </div>
  );
}