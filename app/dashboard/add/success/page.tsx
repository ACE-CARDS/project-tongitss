"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { useUser } from "@/components/context/userContext";

export default function AddSuccessPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // Content type from query parameters

  // If not admin or superadmin, show unauthorized message
  if (user?.role !== "admin" && user?.role !== "superadmin"){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to add content.</p>
      </div>
    );
  }

  // Redirect if no valid type is provided
  useEffect(() => {
    if (!type || (type !== "announcement" && type !== "news-media" && type !== "events")) {
      router.push("/dashboard");
    }
  }, [type, router]);

  // Success page content based on type
  const getContentDetails = () => {
    if (type === "announcement") {
      return {
        title: "Announcement Posted!",
        message: "Your announcement has been successfully saved to the database and is now live based on your scheduled dates.",
        buttonText: "Create Another Announcement",
        buttonLink: "/dashboard/add/announcement"
      };
    }

    if (type === "news-media") {
      return {
        title: "News & Media Posted!",
        message: "Your news post has been successfully saved.",
        buttonText: "Add Another News",
        buttonLink: "/dashboard/add/news-media"
      };
    }
    
    if (type === "events") {
      return {
        title: "Event Posted!",
        message: "Your event has been successfully saved.",
        buttonText: "Add Another Event",
        buttonLink: "/dashboard/add/events"
      };
    }
    return null;

  };

  const content = getContentDetails();

  // Don't render if no type
  if (!content) {
    return null;
  }

  return (
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <NavBar />

      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center">
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] overflow-hidden">
          <div className="h-2 bg-[#011638]" />

          <div className="p-10">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-oswald font-bold text-[#011638] mb-3 uppercase tracking-tight">
              {content.title}
            </h1>

            <p className="text-[#475569] font-ubuntu-mono mb-8 max-w-md mx-auto">
              {content.message}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3 text-[#fbfaf8] bg-[#011638] rounded-md hover:bg-[#1a2a4f] transition-all font-oswald text-lg shadow-md"
              >
                Go back to Dashboard
              </Link>

              <Link
                href={content.buttonLink}
                className="px-8 py-3 text-[#011638] border-2 border-[#011638] rounded-md hover:bg-[#011638] hover:text-[#fbfaf8] transition-all font-oswald text-lg"
              >
                {content.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}