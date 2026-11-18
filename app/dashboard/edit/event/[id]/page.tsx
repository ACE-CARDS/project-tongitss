"use client";

import { useUser } from "@/components/context/userContext";
import Footer from "@/components/layout/footer";
import NavBar from "@/components/layout/navbar";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { createClient } from "@/utils/db/client";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import EditEventForm from "./editEventForm";

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
    <>
      <NavBar />
      <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <EditEventForm eventId={id as string} />
      </div>
      <Footer />
    </>
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