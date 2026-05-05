"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/components/context/userContext";
import AnnouncementsAdmin from "@/components/announcementsAdmin";
import EventsAdmin from "@/components/eventsAdmin";
import NewsAdmin from "@/components/newsAdmin";
import MemAppAdmin from "@/components/memappadmin"; 
import SpotlightCard from "@/components/SpotlightCard";
import { motion } from "framer-motion";

export default function ManagePage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const section = searchParams.get('section');
    if (section && ['announcements', 'news', 'events', 'memapp'].includes(section)) {
      setActiveSection(section);
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Redirect if not logged in
  if (!user) {
    router.push("/dashboard");
    return null;
  }
  
  // Card options
  const manageOptions = [
    { 
      label: "Announcements", 
      key: "announcements", 
      description: "Create and manage announcements for members",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      color: "from-[#011638] to-[#011638]",
      bgColor: "bg-blue-50"
    },
    { 
      label: "News", 
      key: "news", 
      description: "Post and edit news articles for the community",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: "from-[#011638] to-[#011638]",
      bgColor: "bg-purple-50"
    },
    { 
      label: "Events", 
      key: "events", 
      description: "Schedule and manage upcoming events",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-[#011638] to-[#011638]",
      bgColor: "bg-green-50"
    },
    { 
      label: "Membership App", 
      key: "memapp", 
      description: "Manage instructions, deadlines, and videos for applicants",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-[#011638] to-[#011638]",
      bgColor: "bg-yellow-50"
    },
  ];

  // Content
  const renderContent = () => {
    switch (activeSection) {
      case "announcements":
        return <AnnouncementsAdmin />;
      case "news":
        return <NewsAdmin />;
      case "events":
        return <EventsAdmin />;
      case "memapp":
        return <MemAppAdmin />;
      default:
        return null;
    }
  };

  const handleBack = () => {
    setActiveSection(null);
  };

  if (activeSection) {
    const currentOption = manageOptions.find(opt => opt.key === activeSection);
    return (
      <div className="min-h-screen w-full">
          <div className="pt-8 pb-12 px-4 md:px-8">
            <main className="w-full max-w-[1400px] mx-auto">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-xl shadow-md hover:shadow transition-all duration-200 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#011638] to-[#012a5a] text-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10">
                  {currentOption?.icon}
                </span>
                <div>
                  <h3 className="text-2xl font-bold">{currentOption?.label}</h3>
                  <p className="text-sm opacity-90 mt-1">{currentOption?.description}</p>
                </div>
              </div>
            </div>
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-oswald font-bold text-[#011638]">
          Edit Management
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-2">
          Manage your content and keep your community updated with the latest news, events, and announcements
        </p>
      </div>

    <div className="flex justify-center">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.3,
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full"
      >
        {manageOptions.map((option, index) => (
          <motion.div
            key={option.key}
            variants={{
              hidden: { 
                opacity: 0, 
                y: 50,
                scale: 0.9
              },
              visible: { 
                opacity: 1, 
                y: 0,
                scale: 1,
                transition: {
                  type: "spring",
                  damping: 12,
                  stiffness: 100,
                  duration: 0.5
                }
              }
            }}
          >
            <SpotlightCard
              className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm relative cursor-pointer"
              spotlightColor="rgba(239, 240, 242, 0.16)"
            >
              <div onClick={() => setActiveSection(option.key)} className="flex flex-col h-full">
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${option.color} p-6 text-white`}>
                  <div className="flex items-center justify-start gap-4">
                    <span className="text-white shrink-0">{option.icon}</span>
                    <h3 className="text-xl font-bold text-white my-auto text-left leading-tight">{option.label}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <p className="text-gray-600 text-sm mb-5 text-left leading-relaxed">{option.description}</p>

                  {/* Action Button */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-[#011638] font-medium">
                    <span className="text-sm">Manage</span>
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
    </div>
  );
}