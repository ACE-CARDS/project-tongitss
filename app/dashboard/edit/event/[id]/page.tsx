"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import EditEventForm from "./editEventForm";
import { useUser } from "@/components/context/userContext";
import { createClient } from "@/lib/supabase/client";
import LoadingState from "@/components/mainLoadingState";

function EditEventContent() {
  const { user } = useUser();
  const { id } = useParams();
  const supabase = createClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (user?.email) {
        const { data } = await supabase.from("member").select("role").eq("mem_email", user.email).single();
        if (data) setUserRole(data.role);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };
    fetchRole();
  }, [user]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (userRole !== "admin" && userRole !== "superadmin") {
    return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Unauthorized.</div>;
  }

  return (
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      <EditEventForm eventId={id as string} />
      <Footer />
    </div>
  );
}

export default function EditEventPage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <EditEventContent />
    </Suspense>
  );
}