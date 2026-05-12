"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/utils/supabase/client";
import BackButton from "@/components/ui/backButton";
import LoadingState from "@/components/ui/loading/mainLoadingState";

import ApplicationHero from "./application-hero";
import ApplicationInfo from "./application-info";
import ApplicationTestimony from "./application-testimony";

function MembershipApplicationContent() {
  const supabase = createClient();
  const [pageContent, setPageContent] = useState({
    reminders: [] as string[],
    instructions: [] as string[],
    videoUrl: "",
    deadline: "To Be Announced",
    signupLink: "https://docs.google.com/forms/d/e/1FAIpQLSe62P_W6Z3hW7UFqDQjFIqrN1K015lX7ECl75B9psF2yC0IXA/viewform?pli=1" // Default Fallback
  });
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("announce_memapp")
        .select("*")
        .order("order_index", { ascending: true })
        .order("id", { ascending: true });

      if (data && !error) {
        const fetchedDeadline = data.find((row) => row.type?.toLowerCase().trim() === "deadline")?.description;
        
        // Grab Custom Signup Link if provided
        const customLink = data.find((row) => row.type?.toLowerCase().trim() === "signup_link")?.description;
        
        const fetchedReminders = data
          .filter((row) => row.type?.toLowerCase().trim() === "reminder")
          .map((row) => row.description);
          
        const fetchedInstructions = data
          .filter((row) => row.type?.toLowerCase().trim() === "instruction")
          .map((row) => row.description);
          
        // Active Video Logic: Look for order_index === 1. If none, grab the latest video as fallback.
        const allVideos = data.filter((row) => row.type?.toLowerCase().trim() === "video");
        const activeVideoRow = allVideos.find((v) => v.order_index === 1) || allVideos[allVideos.length - 1];
        const fetchedVideo = activeVideoRow?.description;

        let finalVideoUrl = "";
        if (fetchedVideo) {
          const match = fetchedVideo.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
          if (match && match[1]) {
            finalVideoUrl = `https://www.youtube.com/embed/${match[1]}`;
          } else {
            finalVideoUrl = fetchedVideo;
          }
        }

        setPageContent({
          deadline: fetchedDeadline || "To Be Announced",
          reminders: fetchedReminders,
          instructions: fetchedInstructions,
          videoUrl: finalVideoUrl,
          signupLink: customLink || "https://docs.google.com/forms/d/e/1FAIpQLSe62P_W6Z3hW7UFqDQjFIqrN1K015lX7ECl75B9psF2yC0IXA/viewform?pli=1"
        });
      }

      setTimeout(() => {
        setIsLoadingContent(false);
      }, 1000);
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
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <BackButton />
          </div>

          <ApplicationHero 
            deadline={pageContent.deadline} 
            signupLink={pageContent.signupLink} 
          />
          
          <ApplicationInfo 
            reminders={pageContent.reminders} 
            instructions={pageContent.instructions} 
          />
          
          {pageContent.videoUrl && (
            <ApplicationTestimony videoUrl={pageContent.videoUrl} />
          )}
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