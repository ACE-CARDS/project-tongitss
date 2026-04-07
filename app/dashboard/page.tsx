"use client";

import { useState, useEffect } from "react";
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

export default function Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("announcements");
  
  // Get user role
  //const userRole = user?.user_metadata?.role || user?.role || "user";
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

  const [userRole, setUserRole] = useState("user");

  // para sa tab
  useEffect(() => {
    if (user?.email) {
      // load saved tab for user
      const savedTab = sessionStorage.getItem(`tab_${user.email}`);
      if (savedTab) {
        setActiveTab(savedTab);
      } else {
        // new user, reset to announcements
        setActiveTab("announcements");
      }
    } else {
      // user log out, reset to announcements
      setActiveTab("announcements");
    }
  }, [user?.email]);

  // save current tab for user
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

  if(!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  const mainTabs = [
    { label: "ANNOUNCEMENTS", key: "announcements" },
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
          <div className="">
            <div className="flex h-full w-full items-center justify-center">
              <CommitteeDirectory />
            </div>
          </div>
        );
        case "members":
          if (userRole === "superadmin") {
            return <MemdirSuper />;
          } else if (userRole === "admin") {
            return <MemdirAdmin />;
          } else {
            return (
              <div className="h-[400px] overflow-y-auto">
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-gray-500 italic">
                    testing
                  </p>
                </div>
              </div>
            );
          }

      case "thesis":
        // if admin or super admin
        if (userRole === "admin" || userRole === "superadmin") {
          return <ThesisAdminWrapper />; //show the RUD for thesis
        } else {
          // if member
          return (
            <div className="h-[400px] overflow-y-auto">
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-gray-500 italic">Thesis archive coming soon...</p>
              </div>
            </div>
          );
        }
      case "survey":
        // if admin or super admin
        if (userRole === "admin" || userRole === "superadmin") {
          return <SurveyAdminWrapper />; //show the RUD for survey
        } else {
          // if member
          return (
            <div className="h-[400px] overflow-y-auto">
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-gray-500 italic">Survey archive coming soon...</p>
              </div>
            </div>
          );
        }
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}
    >
      <NavBar />

      <div className="pt-10">
        <div className="w-full h-1 bg-[#0b1763] my-4"></div>
        <div className="w-full h-0.5 bg-[#eec643] my-4"></div>

        <div className="rounded-xl bg-[#f9f9f9] flex flex-col items-center justify-between md:flex-row mx-auto mt-8 mb-8 max-w-[1400px] px-4">
          <div className="m-3">
            <h2 className="text-lg font-bold text-center md:text-left md:text-5xl">
              {user ? `${user.user_metadata.name}` : "Welcome, Guest"}
            </h2>
            <p className="text-xs text-center md:text-left md:text-2xl md:mt-3 text-[#475569]">
              Internals Committee
            </p>
            <div className=" flex w-full justify-center md:justify-start md:w-auto md:text-lg text-[#475569]">
              <p>University of the Philippines Baguio</p>
            </div>
          </div>
        </div>

        <div className="w-full h-0.5 bg-[#eec643] my-4"></div>
        <div className="w-full h-1 bg-[#0b1763] my-4"></div>

        <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
          <div className="w-full">
            <div className="flex gap-1 mb-0 overflow-x-auto">
              {mainTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 rounded-t-lg font-bold text-sm md:text-base transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-[#0b1763] text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-md min-h-[500px]">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>

      {userRole === "admin" || userRole === "superadmin" && <CrudButton />}
      <Footer />
    </div>
  );
}
