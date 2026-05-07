"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const formTopRef = useRef<HTMLDivElement>(null);

  const getFieldClass = (fieldName: string) => {
    const baseClass = "w-full px-3 py-2 border rounded focus:outline-none bg-[#fbfaf8] text-[#475569] font-ubuntu-mono";
    const borderClass = invalidFields.includes(fieldName) 
      ? "border-red-500 ring-1 ring-red-500" 
      : "border-[#94a3b8] focus:border-[#011638]";
    return `${baseClass} ${borderClass}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setInvalidFields([]);

    try {
      const formData = new FormData(e.currentTarget);
      const start = formData.get("start_date") as string;
      const end = formData.get("end_date") as string;
      const status = formData.get("status") as string;

      if (new Date(end) < new Date(start)) {
        setInvalidFields(["end_date", "start_date"]);
        throw new Error("End date cannot be earlier than the start date.");
      }

      if (status === "Completed") {
        const endDateObj = new Date(end);
        const today = new Date();
        endDateObj.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (endDateObj > today) {
          setInvalidFields(["status", "end_date"]);
          throw new Error("Cannot mark as 'Completed' if end date is in the future.");
        }
      }

      const payload = {
        title: formData.get("title"),
        short_title: formData.get("short_title"),
        year: new Date(start).getFullYear().toString(),
        start_date: start,
        end_date: end,
        location: formData.get("location"),
        status: status,
        description: formData.get("description"),
      };

      const { error } = await supabase.from("events").update(payload).eq("id", eventId);
      if (error) throw new Error(error.message);
      
      router.push("/dashboard?tab=events"); 
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div ref={formTopRef} className="mb-6">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Edit Event</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-ubuntu-mono font-bold">{errorMsg}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
           <input type="text" name="title" required className={getFieldClass("title")} />
        </form>
      </div>
    </main>
  );
}