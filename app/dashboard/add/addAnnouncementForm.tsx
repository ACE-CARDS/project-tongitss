"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AddAnnouncementForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  
  const errorRef = useRef<HTMLDivElement>(null);
  const [announcementType, setAnnouncementType] = useState<"landing" | "dashboard">("landing");

  // Load draft from session storage
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("announcementDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setAnnouncementType(draft.type || "landing");

        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
        const descInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
        const startInput = document.querySelector('input[name="start_date"]') as HTMLInputElement | null;
        const endInput = document.querySelector('input[name="end_date"]') as HTMLInputElement | null;

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
      title: (document.querySelector('input[name="title"]') as HTMLInputElement)?.value,
      description: (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement)?.value,
      start_date: (document.querySelector('input[name="start_date"]') as HTMLInputElement)?.value,
      end_date: (document.querySelector('input[name="end_date"]') as HTMLInputElement)?.value,
    };
    sessionStorage.setItem("announcementDraft", JSON.stringify(draft));
  };

  // Helper to clear inline errors
  const clearInlineErrors = () => {
    ['title-error', 'desc-error', 'date-error'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    clearInlineErrors();
    
    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string).trim();
    const desc = (formData.get("description") as string).trim();
    const start = formData.get("start_date") as string;
    const end = formData.get("end_date") as string;

    // Inline Validation matching the requested UI
    let hasError = false;

    if (!title) {
      const el = document.getElementById('title-error');
      if (el) el.textContent = "Title is required.";
      hasError = true;
    }

    if (!desc) {
      const el = document.getElementById('desc-error');
      if (el) el.textContent = "Description is required.";
      hasError = true;
    }

    if (!start || !end) {
      const el = document.getElementById('date-error');
      if (el) el.textContent = "Both start and end dates are required.";
      hasError = true;
    } else if (new Date(end) < new Date(start)) {
      const el = document.getElementById('date-error');
      if (el) el.textContent = "End date cannot be earlier than start date.";
      hasError = true;
    }

    if (hasError) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      const tableName = announcementType === "landing" ? "announce_landing" : "announce_dash";
      const payload = announcementType === "landing"
          ? {
              announce_landing_title: title,
              announce_landing_desc: desc,
              announce_landing_start: start,
              announce_landing_end: end,
            }
          : {
              announce_dash_title: title,
              announce_dash_desc: desc,
              announce_dash_start: start,
              announce_dash_end: end,
            };

      const { error } = await supabase.from(tableName).insert(payload);
      if (error) throw new Error(error.message);

      sessionStorage.removeItem("announcementDraft");
      router.push("/dashboard/add/success?type=announcement");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

      <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
        <form onSubmit={handleSubmit} onChange={saveDraft} className="space-y-6">
          
          <div ref={errorRef}>
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-ubuntu-mono text-sm">{submitError}</p>
              </div>
            )}
          </div>

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
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">
                {announcementType === "landing" ? "Public Landing" : "Internal Dashboard"} Details
              </h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Title <span className="text-[#eec643]">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  maxLength={100}
                  placeholder={announcementType === "landing" ? "Public heading..." : "Internal notice..."}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                />
                <span id="title-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Description <span className="text-[#eec643]">*</span>
                </label>
                <textarea
                  name="description"
                  maxLength={500}
                  rows={4}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                />
                <span id="desc-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>

              {/* Dates */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Start Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
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
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    />
                  </div>
                </div>
                <span id="date-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
              onClick={() => sessionStorage.removeItem("announcementDraft")}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : `Post to ${announcementType === "landing" ? "Landing" : "Dashboard"}`}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}