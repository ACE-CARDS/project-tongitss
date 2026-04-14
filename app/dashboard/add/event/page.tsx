"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AddEventForm from "./addEventForm";
import { useUser } from "@/components/context/userContext";
import { createClient } from "@/lib/supabase/client";

export default function AddEventPage() {
  const { user } = useUser();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from("member")
          .select("role")
          .eq("mem_email", user.email)
          .single();

        if (data && !error) {
          setUserRole(data.role);
        }
      }
      setIsLoading(false);
    };

    fetchRole();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fbfaf8]">
        <p className="font-ubuntu-mono text-xl font-bold animate-pulse text-[#011638]">Verifying permissions...</p>
      </div>
    );
  }

  if (userRole !== "admin" && userRole !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fbfaf8]">
        <p className="font-ubuntu-mono text-xl font-bold text-red-600">You are not authorized to add events.</p>
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
      <AddEventForm />
      <Footer />
    </div>
  );
}