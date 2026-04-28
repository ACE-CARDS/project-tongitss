"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AddEventForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem("eventDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const fields = ["title", "short_title", "start_date", "end_date", "location", "status", "description"];
        fields.forEach(field => {
          const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
          if (input && draft[field]) input.value = draft[field];
        });
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, []);

  const saveDraft = () => {
    if (errorMsg) setErrorMsg(null); 

    const draft = {
      title: (document.querySelector('input[name="title"]') as HTMLInputElement)?.value,
      short_title: (document.querySelector('input[name="short_title"]') as HTMLInputElement)?.value,
      start_date: (document.querySelector('input[name="start_date"]') as HTMLInputElement)?.value,
      end_date: (document.querySelector('input[name="end_date"]') as HTMLInputElement)?.value,
      location: (document.querySelector('input[name="location"]') as HTMLInputElement)?.value,
      status: (document.querySelector('select[name="status"]') as HTMLSelectElement)?.value,
      description: (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement)?.value,
    };
    sessionStorage.setItem("eventDraft", JSON.stringify(draft));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData(e.currentTarget);
      const start = formData.get("start_date") as string;
      const end = formData.get("end_date") as string;
      const status = formData.get("status") as string;
      const imageFile = formData.get("image") as File | null;

      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const today = new Date();
      
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (endDateObj < startDateObj) {
        throw new Error("End date cannot be earlier than the start date.");
      }

      if (status === "Completed" && endDateObj > today) {
        throw new Error("Cannot mark as 'Completed' because the event hasn't ended yet.");
      }

      if (status === "Upcoming" && startDateObj < today) {
        throw new Error("Cannot mark as 'Upcoming' because the start date has already passed.");
      }

      if (status === "Ongoing") {
        if (startDateObj > today) {
          throw new Error("Cannot mark as 'Ongoing' because the event hasn't started yet.");
        }
        if (endDateObj < today) {
          throw new Error("Cannot mark as 'Ongoing' because the event has already ended.");
        }
      }

      let imageUrl = null;

      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('events')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('events')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const payload = {
        title: formData.get("title") as string,
        short_title: formData.get("short_title") as string,
        year: startDateObj.getFullYear().toString(), 
        start_date: start, 
        end_date: end,
        location: formData.get("location") as string,
        status: status,
        description: formData.get("description") as string,
        image_url: imageUrl,
      };

      const { error } = await supabase.from("events").insert(payload);

      if (error) throw new Error(error.message);

      sessionStorage.removeItem("eventDraft");
      router.push("/dashboard"); 
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      setErrorMsg(error instanceof Error ? error.message : "Failed to add event");
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
          onClick={() => sessionStorage.removeItem("eventDraft")}
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          Create New Event
        </h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
        
        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-ubuntu-mono font-bold">
                {errorMsg}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} onChange={saveDraft} className="space-y-6">
          
          <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
            <h2 className="text-lg font-oswald font-semibold">Event Details</h2>
          </div>
          
          <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Full Title <span className="text-[#eec643]">*</span>
                </label>
                <input type="text" name="title" maxLength={100} required placeholder="e.g. Leadership Boot Camp" className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]" />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Short Title <span className="text-[#eec643]">*</span>
                </label>
                <input type="text" name="short_title" maxLength={20} required placeholder="e.g. SLC 2026" className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Start Date <span className="text-[#eec643]">*</span>
                </label>
                <input type="date" name="start_date" required max="9999-12-31" className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]" />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  End Date <span className="text-[#eec643]">*</span>
                </label>
                <input type="date" name="end_date" required max="9999-12-31" className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Location <span className="text-[#eec643]">*</span>
                </label>
                <input type="text" name="location" required placeholder="TBA" className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]" />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Event Status <span className="text-[#eec643]">*</span>
                </label>
                <select name="status" required className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]">
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                Event Image (Optional)
              </label>
              <input 
                type="file" 
                name="image" 
                accept="image/*"
                className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#011638] file:text-white hover:file:bg-[#1a2a4f] cursor-pointer" 
              />
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                Description <span className="text-[#eec643]">*</span>
              </label>
              <textarea name="description" required maxLength={500} rows={4} placeholder="Brief summary of the event..." className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]" />
            </div>

          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#011638] text-[#fbfaf8] font-oswald px-8 py-2 rounded-md hover:bg-[#1a2a4f] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}