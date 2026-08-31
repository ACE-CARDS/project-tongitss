"use client";

import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/components/context/userContext";

export default function AddPage() {
  const { user } = useUser();
  
  // If not admin or superadmin
  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to add content.</p>
      </div>
    );
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
      <Footer />
    </div>
  );
}