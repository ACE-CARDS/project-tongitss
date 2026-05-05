"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/client";
import BackButton from "@/components/backButton";
import LoadingState from "@/components/mainLoadingState";

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
        const fetchedDeadline = data.find((row) => row.type === "deadline")?.description;
        
        const fetchedReminders = data
          .filter((row) => row.type === "reminder")
          .map((row) => row.description);
          
        const fetchedInstructions = data
          .filter((row) => row.type === "instruction")
          .map((row) => row.description);
          
        const fetchedVideo = data.find((row) => row.type === "video")?.description;

        let finalVideoUrl = "";
        if (fetchedVideo) {
          if (fetchedVideo.includes("watch?v=")) {
            const videoId = fetchedVideo.split("watch?v=")[1].split("&")[0];
            finalVideoUrl = `https://www.youtube.com/embed/${videoId}`;
          } else if (fetchedVideo.includes("youtu.be/")) {
            const videoId = fetchedVideo.split("youtu.be/")[1].split("?")[0];
            finalVideoUrl = `https://www.youtube.com/embed/${videoId}`;
          } else {
            finalVideoUrl = fetchedVideo;
          }
        }

        setPageContent({
          deadline: fetchedDeadline || "To Be Announced",
          reminders: fetchedReminders,
          instructions: fetchedInstructions,
          videoUrl: finalVideoUrl,
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

          <ApplicationHero deadline={pageContent.deadline} />
          
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