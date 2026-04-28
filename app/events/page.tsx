"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import EventsTimeline from "./events-timeline";
import BackButton from "@/components/backButton";
import LoadingState from "@/components/mainLoadingState";

function EventsPageContent() {
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

          <EventsTimeline />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EventsPageContent />
    </Suspense>
  );
}