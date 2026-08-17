"use client";

import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import EventsTimeline from "./events-timeline";
import BackButton from "@/components/ui/backButton";
import AnimatedTitle from "@/components/ui/animatedTitle";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { useState, useEffect } from "react";

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <main className="flex-grow px-4 sm:px-10 lg:px-20 py-8">
          <div className="max-w-7xl mx-auto w-full">
            <BackButton />

            {/* INTRO PARAGRAPH SECTION */}
            <section className="relative pb-12 px-2 sm:px-5 flex flex-col items-center justify-center text-center overflow-hidden">
              
              <AnimatedTitle title="INITIATIVES" />
              
              <p className="max-w-3xl text-lg text-slate-600 font-ubuntu-mono leading-relaxed font-medium">
              </p>
            </section>

            <EventsTimeline />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}