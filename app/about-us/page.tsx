"use client";

import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutOrg from "./about-org";
import AboutMission from "./about-mission";
import AboutMascot from "./about-mascot";
import BackButton from "@/components/backButton";

export default function AboutUs() {
  return (
    <div
      className="min-h-screen bg-[#fbfaf8]"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />

      <main className="px-6 sm:px-10 lg:px-20 py-8">
        <div className="mb-4">
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
