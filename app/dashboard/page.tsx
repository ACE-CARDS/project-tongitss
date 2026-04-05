"use client";

import { useState } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { useUser } from "@/components/context/userContext";
import Announcements from "@/components/announcements";
// import SurveyAdmin from "@/components/surveyAdmin";

export default function Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("announcements");

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
          <div className="h-[400px] overflow-y-auto">
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-gray-500 italic">Committee directory coming soon...</p>
            </div>
          </div>
        );
      case "members":
        return (
          <div className="h-[400px] overflow-y-auto">
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-gray-500 italic">Member directory coming soon...</p>
            </div>
          </div>
        );
      case "thesis":
        return (
          <div className="h-[400px] overflow-y-auto">
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-gray-500 italic">Thesis archive coming soon...</p>
            </div>
          </div>
        );
      case "survey":
        // return <SurveyAdmin searchParams={Promise.resolve({})} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      <NavBar />

      <div className="pt-10">
        <div className="w-full h-1 bg-[#0b1763] my-4"></div>
        <div className="w-full h-0.5 bg-[#eec643] my-4"></div>

        <div className="rounded-xl bg-[#f9f9f9] flex flex-col items-center justify-between md:flex-row mx-auto mt-8 mb-8 max-w-[1400px] px-4">
          <div className="m-3 p-2">
            <h2 className="text-lg font-bold text-center md:text-left md:text-5xl">
              {user ? `${user.user_metadata.name}` : "Welcome, Guest"}
            </h2>
            <p className="text-xs text-center md:text-left md:text-2xl md:mt-3">
              Internals Committee
            </p>
            <div className="mt-3 flex w-full justify-center md:justify-start md:w-auto md:text-xl">
              <p>University of the Philippines Baguio</p>
            </div>
          </div>
        </div>

        <div className="w-full h-0.5 bg-[#eec643] my-4"></div>
        <div className="w-full h-1 bg-[#0b1763] my-4"></div>

        <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
          <div className="w-full">
            <div className="flex gap-1 mb-0">
              {mainTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3 px-4 rounded-t-lg font-bold text-sm md:text-base transition-all ${
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

      <Footer />
    </div>
  );
}