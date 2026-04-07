"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/context/userContext";

export default function AddAnnouncementForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State to toggle between 'landing' and 'dashboard'
  const [announcementType, setAnnouncementType] = useState<
    "landing" | "dashboard"
  >("landing");

  // Load draft from session storage
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("announcementDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setAnnouncementType(draft.type || "landing");

        const titleInput = document.querySelector(
          'input[name="title"]',
        ) as HTMLInputElement | null;
        const descInput = document.querySelector(
          'textarea[name="description"]',
        ) as HTMLTextAreaElement | null;
        const startInput = document.querySelector(
          'input[name="start_date"]',
        ) as HTMLInputElement | null;
        const endInput = document.querySelector(
          'input[name="end_date"]',
        ) as HTMLInputElement | null;

        if (titleInput) titleInput.value = draft.title || "";
        if (descInput) descInput.value = draft.description || "";
        if (startInput) startInput.value = draft.start_date || "";
        if (endInput) endInput.value = draft.end_date || "";
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, []);

  const saveDraft = () => {
    const draft = {
      type: announcementType,
      title: (document.querySelector('input[name="title"]') as HTMLInputElement)
        ?.value,
      description: (
        document.querySelector(
          'textarea[name="description"]',
        ) as HTMLTextAreaElement
      )?.value,
      start_date: (
        document.querySelector('input[name="start_date"]') as HTMLInputElement
      )?.value,
      end_date: (
        document.querySelector('input[name="end_date"]') as HTMLInputElement
      )?.value,
    };
    sessionStorage.setItem("announcementDraft", JSON.stringify(draft));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const desc = formData.get("description") as string;
      const start = formData.get("start_date") as string;
      const end = formData.get("end_date") as string;

      if (new Date(end) < new Date(start)) {
        throw new Error("End date cannot be earlier than the start date.");
      }

      // 1. Determine table name
      const tableName =
        announcementType === "landing" ? "announce_landing" : "announce_dash";

      // 2. Determine column mapping based on the table
      // Ensure these match your Supabase column names EXACTLY
      const payload =
        announcementType === "landing"
          ? {
              announce_landing_title: title,
              announce_landing_desc: desc,
              announce_landing_start: start,
              announce_landing_end: end,
            }
          : {
              // Adjust these if your dashboard table columns are named differently
              announce_dash_title: title,
              announce_dash_desc: desc,
              announce_dash_start: start,
              announce_dash_end: end,
            };

      const { error } = await supabase.from(tableName).insert(payload);

      if (error) {
        // Log the full error to the console to see missing columns or RLS issues
        console.error("Supabase Error Details:", error);
        throw new Error(error.message);
      }

      sessionStorage.removeItem("announcementDraft");
      router.push("/dashboard/add/success");
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to add announcement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          onClick={() => sessionStorage.removeItem("announcementDraft")}
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          Create New Announcement
        </h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
        <form
          onSubmit={handleSubmit}
          onChange={saveDraft}
          className="space-y-6"
        >
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
              Display Location <span className="text-[#eec643]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAnnouncementType("landing")}
                className={`py-3 px-4 rounded border-2 font-ubuntu-mono transition-all ${
                  announcementType === "landing"
                    ? "border-[#011638] bg-[#011638] text-white"
                    : "border-[#94a3b8] text-[#475569] hover:border-[#011638]"
                }`}
              >
                Landing Page
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementType("dashboard")}
                className={`py-3 px-4 rounded border-2 font-ubuntu-mono transition-all ${
                  announcementType === "dashboard"
                    ? "border-[#011638] bg-[#011638] text-white"
                    : "border-[#94a3b8] text-[#475569] hover:border-[#011638]"
                }`}
              >
                Member Dashboard
              </button>
            </div>
          </div>

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">
                {announcementType === "landing"
                  ? "Public Landing"
                  : "Internal Dashboard"}{" "}
                Details
              </h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Title <span className="text-[#eec643]">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  maxLength={100}
                  required
                  placeholder={
                    announcementType === "landing"
                      ? "Public heading..."
                      : "Internal notice..."
                  }
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Description <span className="text-[#eec643]">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  maxLength={500}
                  rows={4}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Start Date <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    required
                    max="9999-12-31"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    End Date <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    required
                    max="9999-12-31"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#011638] text-[#fbfaf8] font-oswald px-8 py-2 rounded-md hover:bg-[#1a2a4f] transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? "Posting..."
                : `Post to ${announcementType === "landing" ? "Landing" : "Dashboard"}`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
