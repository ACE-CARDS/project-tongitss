"use client";

import { useState, useEffect, Suspense } from "react";
import AddEventForm from "./addEventForm";
import { createClient } from "@/lib/supabase/client";
import LoadingState from "@/components/mainLoadingState";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

import { useUser } from "@/components/context/userContext";

function AddEventContent() {
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
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    fetchRole();
  }, [user, supabase]);

  if (isLoading) {
    return <LoadingState />;
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
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      
      <div className="flex-1 flex flex-col">
        <AddEventForm />
      </div>

      <Footer />
    </div>
  );
}

export default function AddEventPage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <AddEventContent />
    </Suspense>
  );
}