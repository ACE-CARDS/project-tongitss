"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (data && !error) {
        const fields = ["title", "short_title", "start_date", "end_date", "location", "status", "description"];
        fields.forEach(field => {
          const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
          if (input) {
            input.value = data[field] || "";
          }
        });
      }
      setInitialLoading(false);
    };
    fetchEvent();
  }, [eventId, supabase]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const start = formData.get("start_date") as string;
      const end = formData.get("end_date") as string;

      const d1 = new Date(start);
      const d2 = new Date(end);
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

      let formattedDate = "";

      if (start === end) {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()}`;
      } 
      else if (d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()) {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}-${d2.getDate()}, ${d1.getFullYear()}`;
      } 
      else if (d1.getFullYear() === d2.getFullYear()) {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}-${months[d2.getMonth()]} ${d2.getDate()}, ${d1.getFullYear()}`;
      } 
      else {
        formattedDate = `${months[d1.getMonth()]} ${d1.getDate()}, ${d1.getFullYear()} - ${months[d2.getMonth()]} ${d2.getDate()}, ${d2.getFullYear()}`;
      }

      const payload = {
        title: formData.get("title"),
        short_title: formData.get("short_title"),
        date: formattedDate,
        year: d1.getFullYear().toString(),
        start_date: start,
        end_date: end,
        location: formData.get("location"),
        status: formData.get("status"),
        description: formData.get("description"),
      };

      const { error } = await supabase.from("events").update(payload).eq("id", eventId);

      if (error) throw error;
      
      router.push("/dashboard?tab=events"); 
      router.refresh();
    } catch (error: any) {
      console.error("Update error:", error);
      alert(error.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <p className="text-[#011638] font-oswald font-bold tracking-widest uppercase">Loading event data...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link href="/dashboard?tab=events" className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono font-bold">
          ← Cancel Edit
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          Edit Event
        </h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
            <h2 className="text-lg font-oswald font-semibold">Update Event Details</h2>
          </div>
          
          <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Full Title</label>
                <input type="text" name="title" required className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Short Title</label>
                <input type="text" name="short_title" required className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Start Date</label>
                <input type="date" name="start_date" required className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">End Date</label>
                <input type="date" name="end_date" required className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Location</label>
              <input type="text" name="location" required className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono" />
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Status</label>
              <select name="status" className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono">
                <option value="UPCOMING">UPCOMING</option>
                <option value="RSVP OPEN">RSVP OPEN</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Description</label>
              <textarea name="description" rows={4} className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"></textarea>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-[#011638] text-[#fbfaf8] font-oswald px-8 py-2 rounded-md hover:bg-[#1a2a4f] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}