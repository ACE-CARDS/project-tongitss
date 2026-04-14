"use client";

import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import EventsTimeline from "./events-timeline";
import BackButton from "@/components/backButton";

export default function EventsPage() {
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed"
      }}
    >
      <NavBar />

      <main className="px-6 sm:px-10 lg:px-20 py-8">
        <div className="mb-4">
          <BackButton />
        </div>

        <EventsTimeline />
      </main>

      <Footer />
    </div>
  );
}