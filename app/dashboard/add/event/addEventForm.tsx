"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function AddEventForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const formTopRef = useRef<HTMLDivElement>(null);
  
  const [isSuccess, setIsSuccess] = useState(false);

  // Standard class without dynamic border colors
  const inputClass = "text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]";

  const clearInlineErrors = () => {
    const errorIds = ['title-error', 'short-title-error', 'date-error', 'location-error', 'status-error', 'description-error'];
    errorIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    clearInlineErrors();

    const formData = new FormData(e.currentTarget);
    const title = (formData.get("title") as string).trim();
    const shortTitle = (formData.get("short_title") as string).trim();
    const start = formData.get("start_date") as string;
    const end = formData.get("end_date") as string;
    const location = (formData.get("location") as string).trim();
    const status = formData.get("status") as string;
    const description = (formData.get("description") as string).trim();
    const imageFile = formData.get("image") as File | null;

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const today = new Date();
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    let hasError = false;

    // Validation Logic using the requested spans
    if (!title) {
      document.getElementById('title-error')!.textContent = "Full title is required.";
      hasError = true;
    }
    if (!shortTitle) {
      document.getElementById('short-title-error')!.textContent = "Short title is required.";
      hasError = true;
    }
    if (!location) {
      document.getElementById('location-error')!.textContent = "Location is required.";
      hasError = true;
    }
    if (!description) {
      document.getElementById('description-error')!.textContent = "Description is required.";
      hasError = true;
    }
    if (endDateObj < startDateObj) {
      document.getElementById('date-error')!.textContent = "End date cannot be earlier than start date.";
      hasError = true;
    }
    if (status === "Completed" && endDateObj >= today) {
      document.getElementById('status-error')!.textContent = "End date must be in the past for 'Completed'.";
      hasError = true;
    }
    if (status === "Upcoming" && startDateObj <= today) {
      document.getElementById('status-error')!.textContent = "Start date must be in the future for 'Upcoming'.";
      hasError = true;
    }
    if (status === "Ongoing" && (startDateObj > today || endDateObj < today)) {
      document.getElementById('status-error')!.textContent = "Today must be within the event range for 'Ongoing'.";
      hasError = true;
    }

    if (hasError) {
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('events').upload(fileName, imageFile);
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("events").insert({
        title,
        short_title: shortTitle,
        year: startDateObj.getFullYear().toString(),
        start_date: start,
        end_date: end,
        location,
        status,
        description,
        image_url: imageUrl,
      });

      if (error) throw new Error(error.message);
      setIsSuccess(true);
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center">
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">Event Posted!</h1>
          <div className="flex gap-4 justify-center mt-6">
            <button onClick={() => router.push("/dashboard?tab=manage")} className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg font-oswald">Dashboard</button>
            <button onClick={() => setIsSuccess(false)} className="px-6 py-2 text-[#011638] bg-white border border-[#011638] rounded-lg font-oswald">Add Another</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl flex-1 w-full flex flex-col">
      <div ref={formTopRef} className="mb-6">
        <Link href="/dashboard?tab=manage" className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono">← Back to Dashboard</Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Create New Event</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 mb-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-ubuntu-mono text-sm font-bold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="">
          <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
            <h2 className="text-lg font-oswald font-semibold">Event Details</h2>
          </div>
          
          <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Full Title <span className="text-[#eec643]">*</span></label>
                <input type="text" name="title" className={inputClass} />
                <span id="title-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Short Title <span className="text-[#eec643]">*</span></label>
                <input type="text" name="short_title" className={inputClass} />
                <span id="short-title-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Start Date <span className="text-[#eec643]">*</span></label>
                  <input type="date" name="start_date" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">End Date <span className="text-[#eec643]">*</span></label>
                  <input type="date" name="end_date" className={inputClass} />
                </div>
              </div>
              <span id="date-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Location <span className="text-[#eec643]">*</span></label>
                <input type="text" name="location" className={inputClass} />
                <span id="location-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Event Status <span className="text-[#eec643]">*</span></label>
                <select name="status" className={inputClass}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
                <span id="status-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Description <span className="text-[#eec643]">*</span></label>
              <textarea name="description" rows={4} className={inputClass} />
              <span id="description-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
            </div>
            
            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Cover Image (Optional)</label>
              <input type="file" name="image" accept="image/*" className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-[#011638] text-[#fbfaf8] font-oswald px-8 py-2 rounded-md hover:bg-[#1a2a4f] transition-colors disabled:opacity-50">
              {isSubmitting ? "Posting..." : "Post Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}