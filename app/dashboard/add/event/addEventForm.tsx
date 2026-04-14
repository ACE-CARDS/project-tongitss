"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AddEventForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      const formData = new FormData(e.currentTarget);
      const start = formData.get("start_date") as string;
      const end = formData.get("end_date") as string;

      if (new Date(end) < new Date(start)) {
        throw new Error("End date cannot be earlier than the start date.");
      }

      const d1 = new Date(start);
      const d2 = new Date(end);
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      
      let formattedDate = "";
      
      if (start === end) {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()}`;
      } else if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}-${d2.getDate()}, ${d1.getFullYear()}`;
      } else if (d1.getFullYear() === d2.getFullYear()) {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}-${months[d2.getMonth()]} ${d2.getDate()}, ${d1.getFullYear()}`;
      } else {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()} - ${months[d2.getMonth()]} ${d2.getDate()}, ${d2.getFullYear()}`;
      }

      const payload = {
        title: formData.get("title") as string,
        short_title: formData.get("short_title") as string,
        date: formattedDate, 
        year: d1.getFullYear().toString(), 
        start_date: start, 
        end_date: end,
        location: formData.get("location") as string,
        status: formData.get("status") as string,
        description: formData.get("description") as string,
      };

      const { error } = await supabase.from("events").insert(payload);

      if (error) throw new Error(error.message);

      sessionStorage.removeItem("eventDraft");
      router.push("/dashboard"); 
      router.refresh();
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to add event");
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
                  <option value="UPCOMING">UPCOMING</option>
                  <option value="RSVP OPEN">RSVP OPEN</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
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