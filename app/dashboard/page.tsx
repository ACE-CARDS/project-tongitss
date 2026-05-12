"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/components/context/userContext";
import Announcements from "@/components/features/dashboard/announcements/announcements";
import SurveyAdminWrapper from "@/app/survey/admin/survey_admin_wrapper";
import MemdirSuper from "@/components/features/dashboard/member_directory/memdirsuper";
import MemdirAdmin from "@/components/features/dashboard/member_directory/memdiradmin";
import { createClient } from "@/utils/supabase/client";
import ThesisAdminWrapper from "../thesis/admin/thesis_admin_wrapper";
import CommitteeDirectory from "@/components/features/dashboard/committee_directory/committeeDirectory";
import MemberSurveyView from "@/components/features/dashboard/survey/memberSurveyView";
import MemberThesisView from "@/components/features/dashboard/thesis/memberThesisView";
import ManagePage from "./manage/page";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import TabLoadingState from "@/components/ui/loading/tabLoadingState";
import { BsSuitSpadeFill } from "react-icons/bs";

// Internal component to handle search params
function DashboardContent() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<string | null>(null); //default null

  // Get user role
  //const userRole = user?.user_metadata?.role || user?.role || "user";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const supabase = createClient();
  const [memberData, setMemberData] = useState<{
    fname: string;
    lname: string;
    comm: string;
    school: string;
    role?: string;
  } | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true); // Track loading state
  const [isTabLoading, setIsTabLoading] = useState(false);

  const handleTabChange = async (tabKey: string) => {
    setIsTabLoading(true);
    setActiveTab(tabKey);

    setTimeout(() => {
      setIsTabLoading(false);
    }, 1500);
  };

  const fetchMemberData = async (email: string) => {
    setIsLoadingRole(true);
    const { data, error } = await supabase
      .from("member")
      .select(
        "role, mem_fname, mem_lname, committee:committee (comm_name), school:school (school_name), mem_email, mem_schol_year, mem_schol_type",
      )
      .eq("mem_email", email)
      .single();

    if (error) {
      console.error(error);
      setUserRole("user");
      setIsLoadingRole(false);
      return "user";
    }
    //it works trust me
    setMemberData({
      fname: data.mem_fname,
      lname: data.mem_lname,
      comm: data.committee?.comm_name || "Member",
      school: data.school?.school_name || "No School",
      role: data.role,
      email: data.mem_email,
      year: data.mem_schol_year,
      schol: data.mem_schol_type,
    });
    setUserRole(data.role);
    setIsLoadingRole(false);
    return data.role;
  };

  // Get tab from URL
  const getInitialTab = () => {
    // Check URL parameter
    const urlTab = searchParams.get("tab");
    if (urlTab && isValidTab(urlTab)) {
      return urlTab;
    }

    // Check saved
    if (user?.email) {
      const savedTab = localStorage.getItem(`dashboard_tab_${user.email}`);
      if (savedTab && isValidTab(savedTab)) {
        return savedTab;
      }
    }

    // Default tab: announcements
    return "announcements";
  };

  // If tab is valid
  const isValidTab = (tab: string): boolean => {
    const validTabs = [
      "announcements",
      "manage",
      "committee",
      "members",
      "thesis",
      "survey",
    ];
    return validTabs.includes(tab);
  };

  // Save tab
  const saveTab = (tab: string) => {
    if (user?.email) {
      localStorage.setItem(`dashboard_tab_${user.email}`, tab);
    }
  };

  // Fetch data
  useEffect(() => {
    if (user?.email) {
      setIsDataLoading(true);
      fetchMemberData(user.email).then(() => {
        // Minimum delay: 1.5s for ellipsis
        setTimeout(() => {
          setIsDataLoading(false);
        }, 1500);
      });
    } else if (user === null) {
      // If not logged in, stop loading
      setIsDataLoading(false);
    }
  }, [user]);

  // Check for URL parameters first, then fall back to session storage
  useEffect(() => {
    if (user === undefined) return;
    if (isDataLoading) return; // Wait for data to load before setting up tabs

    const initialTab = getInitialTab();
    setActiveTab(initialTab);

    if (!searchParams.get("tab")) {
      router.push(`/dashboard?tab=${initialTab}`, { scroll: false });
    }
  }, [user?.email, searchParams, isDataLoading]);

  // Save current tab for user
  useEffect(() => {
    if (user?.email && activeTab && !isDataLoading) {
      saveTab(activeTab);

      // Update URL
      const currentUrlTab = searchParams.get("tab");
      if (currentUrlTab !== activeTab) {
        router.push(`/dashboard?tab=${activeTab}`, { scroll: false });
      }
    }
  }, [activeTab, user?.email, searchParams, isDataLoading]);

  // Show loading state while fetching
  if (isDataLoading || activeTab === null) {
    return <LoadingState />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  const mainTabs = [
    { label: "ANNOUNCEMENTS", key: "announcements" },
    { label: "POSTINGS", key: "manage" },
    { label: "COMMITTEE", key: "committee" },
    { label: "MEMBERS", key: "members" },
    { label: "THESIS", key: "thesis" },
    { label: "SURVEY", key: "survey" },
  ];

  const renderTabContent = () => {
    if (isTabLoading) {
      return <TabLoadingState />;
    }

    switch (activeTab) {
      case "announcements":
        return <Announcements />;
      case "committee":
        return (
          <div className="flex h-full w-full items-center justify-center">
            <CommitteeDirectory />
          </div>
        );
      case "manage":
        return (
          <div className="flex h-full w-full items-center justify-center">
            <ManagePage />
          </div>
        );
      case "members":
        if (userRole === "superadmin") return <MemdirSuper />;
        if (userRole === "admin") return <MemdirAdmin />;
        return (
          <p className="text-center py-10 italic text-gray-500">
            You do not have access to this page.
          </p>
        );
      case "thesis":
        // if admin or super admin
        if (userRole === "admin" || userRole === "superadmin") {
          return <ThesisAdminWrapper />; //show the RUD for thesis
        } else {
          return <MemberThesisView />;
        }
      case "survey":
        // if admin or super admin
        if (userRole === "admin" || userRole === "superadmin") {
          return <SurveyAdminWrapper />;
        } else {
          // if member
          return <MemberSurveyView />;
        }
      default:
        return null;
    }
  };

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
        <div className="pt-10">
          <div className="bg-white/70">
            <div className="w-full h-1 bg-[#0b1763] my-2"></div>
            <div className="w-full h-0.5 bg-[#eec643] my-2"></div>

            <div className="mt-8 mb-8 mx-auto w-[80%] lg:w-[90%] max-w-[1400px] overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                {/*User Name*/}
                <div className="w-full md:w-auto">
                  <h2 className="text-2xl md:text-4xl font-bold uppercase font-oswald text-[#011638] text-center md:text-left">
                    {memberData
                      ? `${memberData.fname} ${memberData.lname}`
                      : user.user_metadata.name || "User"}
                  </h2>
                </div>

                <div className="flex flex-col items-center md:items-end gap-y-2 mb-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1">
                    {/*Committee Name*/}
                    <p className="text-sm md:text-lg font-medium text-[#475569] font-ubuntu-mono">
                      {memberData?.comm || "Member"}
                    </p>

                    <span className="hidden md:block h-4 w-px bg-gray-300"></span>
                    {/*University*/}
                    <p className="text-sm md:text-lg text-[#475569] font-ubuntu-mono">
                      {memberData?.school || "No School"}
                    </p>
                    <span className="hidden md:block h-4 w-px bg-gray-300"></span>
                    {/*Scholarship*/}
                    <p className="text-sm md:text-lg text-[#475569] font-ubuntu-mono">
                      {memberData
                        ? `${memberData.year} ${memberData.schol}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 opacity-70">
                    {/*Role*/}
                    <p className="text-xs md:text-sm text-[#64748b] font-ubuntu-mono uppercase tracking-wider">
                      {memberData?.role || "Member"}
                    </p>
                    <span className="hidden md:block h-3 w-px bg-gray-300"></span>
                    {/*email*/}
                    <p className="text-xs md:text-sm text-[#64748b] font-ubuntu-mono italic">
                      {memberData?.email || " "}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full h-0.5 bg-[#eec643] my-2"></div>
            <div className="w-full h-1 bg-[#0b1763] my-2"></div>
          </div>

          <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
            <div className="w-full">
              <div className="flex gap-1 mb-0 overflow-x-auto scrollbar-hide">
                {mainTabs
                  .filter((tab) => {
                    if (userRole === "superadmin" || userRole === "admin")
                      return true;
                    return (
                      tab.key !== "members" &&
                      tab.key !== "events" &&
                      tab.key !== "manage"
                    );
                  })
                  .map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
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

              <div className="bg-white rounded-b-xl border border-gray-200 p-6 shadow-md min-h-[500px] mb-6">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}
