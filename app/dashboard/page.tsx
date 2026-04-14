"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { useUser } from "@/components/context/userContext";
import Announcements from "@/components/announcements";
import SurveyAdminWrapper from "@/app/survey/admin/survey_admin_wrapper";
import MemdirSuper from "@/components/memdirsuper";
import MemdirAdmin from "@/components/memdiradmin";
import { createClient } from "@/lib/supabase/client";
import ThesisAdminWrapper from "../thesis/admin/thesis_admin_wrapper";
import CommitteeDirectory from "@/components/committeeDirectory";
import CrudButton from "@/components/crudButton";
import EventsAdmin from "@/components/eventsAdmin";

// Internal component to handle search params
function DashboardContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("announcements");
  const [userRole, setUserRole] = useState("user");
  const supabase = createClient();

  const fetchUserRole = async (email: string) => {
    const { data, error } = await supabase
      .from("member")
      .select("role")
      .eq("mem_email", email)
      .single();

    if (error) {
      console.error(error);
      return "user";
    }
    return data.role;
  };

  // Check for URL parameters first, then fall back to session storage
  useEffect(() => {
    if (user?.email) {
      const urlTab = searchParams.get("tab");
      const savedTab = sessionStorage.getItem(`tab_${user.email}`);
      
      if (urlTab) {
        setActiveTab(urlTab);
      } else if (savedTab) {
        setActiveTab(savedTab);
      }
    }
  }, [user?.email, searchParams]);

  // Save current tab for user
  useEffect(() => {
    if (user?.email && activeTab) {
      sessionStorage.setItem(`tab_${user.email}`, activeTab);
    }
  }, [activeTab, user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchUserRole(user.email).then(setUserRole);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  const mainTabs = [
    { label: "ANNOUNCEMENTS", key: "announcements" },
    { label: "EVENTS", key: "events" },
    { label: "COMMITTEE", key: "committee" },
    { label: "MEMBERS", key: "members" },
    { label: "THESIS", key: "thesis" },
    { label: "SURVEY", key: "survey" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "announcements":
        return <Announcements />;
      case "committee":
        return (
          <div className="flex h-full w-full items-center justify-center">
            <CommitteeDirectory />
          </div>
        );
      case "events":
        if (userRole === "admin" || userRole === "superadmin") {
          return <EventsAdmin />;
        }
        return <p className="text-center py-10 italic text-gray-500">Not authorized.</p>;
      case "members":
        if (userRole === "superadmin") return <MemdirSuper />;
        if (userRole === "admin") return <MemdirAdmin />;
        return <p className="text-center py-10 italic text-gray-500">Testing</p>;
      case "thesis":
        if (userRole === "admin" || userRole === "superadmin") return <ThesisAdminWrapper />;
        return <p className="text-center py-10 italic text-gray-500">Thesis archive coming soon...</p>;
      case "survey":
        if (userRole === "admin" || userRole === "superadmin") return <SurveyAdminWrapper />;
        return <p className="text-center py-10 italic text-gray-500">Survey archive coming soon...</p>;
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      <div className="pt-10">
        <div className="w-full h-1 bg-[#0b1763] my-4"></div>
        <div className="w-full h-0.5 bg-[#eec643] my-4"></div>

        <div className="rounded-xl flex flex-col items-center justify-between md:flex-row mx-auto mt-8 mb-8 max-w-[1400px] px-4">
          <div className="m-3">
            <h2 className="text-lg font-bold text-center md:text-left md:text-5xl uppercase font-oswald">
              {user.user_metadata.name || "User"}
            </h2>
            <p className="text-xs text-center md:text-left md:text-2xl md:mt-3 text-[#475569] font-ubuntu-mono">
              Internals Committee
            </p>
            <div className="flex w-full justify-center md:justify-start md:w-auto md:text-lg text-[#475569]">
              <p>University of the Philippines Baguio</p>
            </div>
          </div>
        </div>

        <div className="w-full h-0.5 bg-[#eec643] my-4"></div>
        <div className="w-full h-1 bg-[#0b1763] my-4"></div>

        <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
          <div className="w-full">
            <div className="flex gap-1 mb-0 overflow-x-auto scrollbar-hide">
              {mainTabs
                .filter((tab) => {
                  if (userRole === "superadmin" || userRole === "admin") return true;
                  return tab.key === "announcements" || tab.key === "committee";
                })
                .map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                        setActiveTab(tab.key);
                        // Update URL without reloading to keep it clean
                        router.push(`/dashboard?tab=${tab.key}`, { scroll: false });
                    }}
                    className={`flex-1 py-3 px-4 rounded-t-xl font-bold text-sm md:text-base transition-all whitespace-nowrap uppercase ${
                      activeTab === tab.key
                        ? "bg-[#011638] text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>

            <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-md min-h-[500px]">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
      {(userRole === "admin" || userRole === "superadmin") && <CrudButton />}
      <Footer />
    </div>
  );
}

// Next.js requires Suspense when using useSearchParams in client components
export default function Dashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold uppercase">Loading Dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    );
}