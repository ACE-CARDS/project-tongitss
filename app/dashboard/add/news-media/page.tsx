// Specific for news & media
"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AddNewsMediaForm from "../addNewsMediaForm";
import { useUser } from "@/components/context/userContext";
import LoadingState from "@/components/ui/loading/mainLoadingState";

function AddNewsMediaContent() {
  const { user } = useUser();
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

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to add news & media.</p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <AddNewsMediaForm />
    </div>
      <Footer />
    </>
  );
}

export default function AddNewsMediaPage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <AddNewsMediaContent />
    </Suspense>
  );
}