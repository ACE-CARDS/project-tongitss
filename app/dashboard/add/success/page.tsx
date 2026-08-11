"use client";

import { useUser } from "@/components/context/userContext";
import Footer from "@/components/layout/footer";
import NavBar from "@/components/layout/navbar";
import SuccessPageWrapper from "@/components/ui/wrapper/SuccessPageWrapper";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AddSuccessPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type"); // Content type from query parameters
  const from = searchParams.get("from");
  const subtype = searchParams.get("subtype");

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
    if (!type || (type !== "announcement" && type !== "news-media" && type !== "events" && type !== "resource" && type !== "scholarship")) {
      router.push("/dashboard");
    }
  }, [type, router]);

  // Success page content based on type
  const getContentDetails = () => {
    if (type === "announcement") {
      return {
        title: "Announcement Posted!",
        message: "Your announcement has been successfully saved.",
        buttonText: "Add Another",
        buttonLink: "/dashboard/add/announcement",
        buttonBack: "/dashboard?tab=manage&section=announcements"
      };
    }

    if (type === "news-media") {
      return {
        title: "News & Media Posted!",
        message: "Your news post has been successfully saved.",
        buttonText: "Add Another",
        buttonLink: "/dashboard/add/news-media",
        buttonBack: "/dashboard?tab=manage&section=news"
      };
    }
    
    if (type === "events") {
      return {
        title: "Event Posted!",
        message: "Your event has been successfully saved.",
        buttonText: "Add Another",
        buttonLink: "/dashboard/add/events",
        buttonBack: "/dashboard?tab=manage&section=events"
      };
    }

    if (type === "resource") {
      return {
        title: "Resource Added!",
        message: "Your resource has been successfully saved.",
        buttonText: "Add Another",
        buttonLink: "/dashboard/add/resource",
        buttonBack: "/dashboard?tab=manage&section=resources"
      };
    }

    if (type === "scholarship") {
           if (subtype === "faq") {
             return {
               title: "FAQ Added!",
               message: "Your frequently asked question has been successfully saved.",
               buttonText: "Add Another",
               buttonLink: "/dashboard/add/scholarship?type=faq",
               buttonBack: "/dashboard?tab=manage&section=scholarship"
             };
           }
            return {
              title: "School and Course Added!",
              message: "Your school and course has been successfully saved.",
              buttonText: "Add Another",
              buttonLink: "/dashboard/add/scholarship?type=school",
              buttonBack: "/dashboard?tab=manage&section=scholarship"
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
    <SuccessPageWrapper>
      <NavBar />
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >

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

            <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
              {content.title}
            </h1>

            <p className="text-[#475569] font-ubuntu-mono mb-6">
              {content.message}
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                href={content.buttonBack}
                className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald"
              >
                Go back to Dashboard
              </Link>

              <Link
                href={content.buttonLink}
                className="px-6 py-2 text-[#011638] border border-[#011638] rounded-lg hover:bg-[#f0f0f0] transition-colors font-oswald"
              >
                {content.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </main>

    </div>
      <Footer />
    </SuccessPageWrapper>
  );
}