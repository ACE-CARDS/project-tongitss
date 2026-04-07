"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/backButton";

export default function MembershipApplication() {
  const supabase = createClient();
  const router = useRouter();

  const [pageContent, setPageContent] = useState({
    reminders: [] as string[],
    instructions: [
      "Click the application link provided on our official Facebook page.",
      "Fill out the form completely and honestly.",
      "Upload all necessary attachments in PDF format.",
      "Wait for an email confirmation regarding your interview schedule.",
    ],
    videoUrl: "https://www.youtube.com/embed/Z1UWsBJ5HgU",
  });
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("id", { ascending: true });

      if (data && !error) {
        const fetchedReminders = data
          .filter((row) => [1, 2, 3, 4].includes(row.id))
          .map((row) => row.content);

        setPageContent((prev) => ({
          ...prev,
          reminders:
            fetchedReminders.length > 0 ? fetchedReminders : prev.reminders,
        }));
      } else {
        console.error("Failed to fetch content from Supabase:", error);
      }
      setIsLoadingContent(false);
    };

    fetchContent();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative text-[#011638]">
      
      <NavBar />

      <main 
        className="flex-grow px-6 sm:px-10 lg:px-20 py-8"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed" 
        }}
      >
        {/* BACK BUTTON */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* CONSISTENT TITLE SECTION */}
        <div className="text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
              Application
            </h1>
            <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
          </div>
          
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-green-100 border border-green-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-black text-green-700 tracking-widest uppercase">
              Status: Open
            </span>
          </div>
        </div>

        {/* REMINDERS & INSTRUCTIONS */}
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch justify-center mb-16">
          
          {/* General Reminders Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 w-full bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#011638] flex items-center justify-center mb-6 text-white shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-[#011638] mb-6 uppercase tracking-wide">
              General Reminders
            </h3>

            {isLoadingContent ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ) : (
              <ul className="space-y-4 text-slate-700 font-medium">
                {pageContent.reminders.length > 0 ? (
                  pageContent.reminders.map((reminder, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#eec643] text-xl mt-[-2px]">✦</span>
                      <span>{reminder}</span>
                    </li>
                  ))
                ) : (
                  <p className="italic text-slate-500">No reminders posted.</p>
                )}
              </ul>
            )}
          </motion.div>

          {/* Instructions Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] p-8 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-[#eec643] flex items-center justify-center mb-6 text-[#011638] shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl font-black text-[#011638] mb-6 uppercase tracking-wide">
              Instructions
            </h3>

            <ol className="space-y-4 text-slate-700 font-medium list-decimal list-inside marker:text-[#eec643] marker:font-black">
              {pageContent.instructions.map((instruction, idx) => (
                <li key={idx}>{instruction}</li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* VIDEO TESTIMONY SECTION */}
        <div className="max-w-4xl mx-auto mb-16 text-center relative">
          <h2 className="text-3xl font-black text-[#011638] uppercase tracking-widest mb-8">
            Hear From Our Scholars
          </h2>
          
          <div className="relative w-full aspect-video bg-white/50 backdrop-blur-md border-4 border-white shadow-xl rounded-[2rem] overflow-hidden z-10">
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src={pageContent.videoUrl}
              title="Scholar Testimony"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="absolute -bottom-8 -right-8 w-40 h-40 drop-shadow-xl z-20 pointer-events-none hidden md:block">
            <img src="/assets/logos/mascot.png" alt="Ace Cards Mascot" className="w-full h-full object-contain" />
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}