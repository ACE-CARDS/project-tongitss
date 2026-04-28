"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/backButton";
import LoadingState from "@/components/mainLoadingState";

function MembershipApplicationContent() {
  const supabase = createClient();
  const [pageContent, setPageContent] = useState({
    reminders: [] as string[],
    instructions: [
      "Click the application link provided on our official Facebook page.",
      "Fill out the form completely and honestly.",
      "Upload all necessary attachments in PDF format.",
      "Wait for an email confirmation regarding your interview schedule.",
    ],
    videoUrl: "https://www.youtube.com/embed/Z1UWsBJ5HgU",
    deadline: "To Be Announced",
  });
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("id", { ascending: true });
      if (data && !error) {
        const fetchedDeadline = data.find((row) => row.id === 5)?.content;
        const fetchedReminders = data
          .filter((row) => [1, 2, 3, 4].includes(row.id))
          .map((row) => row.content);

        setPageContent((prev) => ({
          ...prev,
          deadline: fetchedDeadline || prev.deadline,
          reminders:
            fetchedReminders.length > 0 ? fetchedReminders : prev.reminders,
        }));
      }
      setTimeout(() => {
      setIsLoadingContent(false);
    }, 1500);
  };
    fetchContent();
  }, [supabase]);
  
  if (isLoadingContent) {
  return <LoadingState />;
}

  return (
    <div
      className="min-h-screen bg-[#fbfaf8] flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />

      <main className="flex-grow px-6 sm:px-10 lg:px-20 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="max-w-7xl mx-auto w-full">
          {/* 1. HORIZONTAL HEADER BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 lg:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 mb-8"
          >
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
                <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
                  Application
                </h1>
                <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
              </div>
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-green-100 border border-green-200 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm font-black text-green-700 tracking-widest uppercase">
                  Status: Open
                </span>
              </div>
            </div>

            <div className="bg-[#011638] text-white px-10 py-6 rounded-[1.5rem] shadow-xl text-center min-w-[280px]">
              <h3 className="text-xs font-bold text-[#eec643] uppercase tracking-widest mb-2">
                Application Deadline
              </h3>
              <p className="text-2xl font-black leading-tight">
                {pageContent.deadline}
              </p>
            </div>
          </motion.div>

          {/* 2. Reminders & Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Reminders Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border-slate-200 border rounded-[2rem] p-8 lg:p-10 shadow-lg flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shadow-sm shrink-0">
                  <img
                    src="/assets/logos/reminders.png"
                    alt="Reminders Icon"
                    className="w-7 h-7 object-contain opacity-80"
                  />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
                  Reminders
                </h3>
              </div>

                <ul className="space-y-4 text-slate-700 font-medium list-disc ml-6 marker:text-red-500 text-lg">
                  {pageContent.reminders.length > 0 ? (
                    pageContent.reminders.map((reminder, idx) => (
                      <li key={idx} className="pl-2 leading-relaxed">
                        {reminder}
                      </li>
                    ))
                  ) : (
                    <p className="italic text-slate-500 list-none -ml-6">
                      No reminders posted.
                    </p>
                  )}
                </ul>

            </motion.div>

            {/* Instructions Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#011638] border border-slate-800 rounded-[2rem] p-8 lg:p-10 shadow-xl text-white flex flex-col h-full relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center gap-4 mb-6 pb-5 border-b border-slate-700">
                <div className="w-12 h-12 rounded-xl bg-[#eec643] flex items-center justify-center shadow-sm shrink-0">
                  <img
                    src="/assets/logos/instructions.png"
                    alt="Instructions Icon"
                    className="w-7 h-7 object-contain opacity-90"
                  />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wide">
                  Instructions
                </h3>
              </div>

              <ol className="relative z-10 space-y-4 text-slate-300 font-medium list-decimal ml-6 marker:text-[#eec643] marker:font-black text-lg marker:text-xl">
                {pageContent.instructions.map((instruction, idx) => (
                  <li key={idx} className="pl-2 leading-relaxed">
                    {instruction}
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>

          {/* 3. TESTIMONIES */}
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center relative">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight text-center drop-shadow-sm">
                Hear From Our Scholars
              </h2>
              <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
            </div>

            <div className="relative w-full aspect-video bg-white/50 backdrop-blur-md border-4 border-white shadow-2xl rounded-[2.5rem] overflow-hidden z-10">
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={pageContent.videoUrl}
                title="Scholar Testimony"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* MASCOT */}
            <div className="absolute -bottom-10 -right-8 w-44 h-44 lg:w-48 lg:h-48 drop-shadow-2xl z-20 pointer-events-none hidden md:block">
              <img
                src="/assets/logos/mascot.png"
                alt="Ace Cards Mascot"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MembershipApplication() { 
  return (
    <Suspense fallback={<LoadingState />}>
      <MembershipApplicationContent />
    </Suspense>
  );
}