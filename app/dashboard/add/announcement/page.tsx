// Specific for announcements
"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AddAnnouncementForm from "../addAnnouncementForm";
import { useUser } from "@/components/context/userContext";
import LoadingState from "@/components/ui/loading/mainLoadingState";

function AddAnnouncementContent() {
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
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8]"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      <AddAnnouncementForm />
      <Footer />
    </div>
  );
}

export default function AddAnnouncementPage() {
  const { user } = useUser();
  
  // Show loading while user is being fetched
  if (!user) {
    return <LoadingState />;
  }
  
  // Check authorization after user is loaded
  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to add announcements.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <AddAnnouncementContent />
    </Suspense>
  );
}