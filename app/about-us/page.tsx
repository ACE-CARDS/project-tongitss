"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutOrg from "./about-org";
import AboutMission from "./about-mission";
import AboutMascot from "./about-mascot";
import BackButton from "@/components/backButton";

export default function AboutUs() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      
      <NavBar />

      <main 
        className="px-6 sm:px-10 lg:px-20 py-8"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed" 
        }}
      >
        <div className="justify mb-4">
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