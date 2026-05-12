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
  const [invalidFields, setInvalidFields] = useState<string[]>([]); 
  const formTopRef = useRef<HTMLDivElement>(null);
  
  const [isSuccess, setIsSuccess] = useState(false);

  const getFieldClass = (fieldName: string) => {
    const baseClass = "text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none bg-[#fbfaf8]";
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
      const imageFile = formData.get("image") as File | null;

      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const today = new Date();
      
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);


      if (endDateObj < startDateObj) {
        setInvalidFields(["end_date", "start_date"]);
        throw new Error("End date cannot be earlier than the start date.");
      }

      if (status === "Completed" && endDateObj >= today) {
        setInvalidFields(["status", "end_date"]);
        throw new Error("Cannot mark as 'Completed'. The end date must be strictly in the past.");
      }

      if (status === "Upcoming" && startDateObj <= today) {
        setInvalidFields(["status", "start_date"]);
        throw new Error("Cannot mark as 'Upcoming'. The start date must be strictly in the future.");
      }

      if (status === "Ongoing" && (startDateObj > today || endDateObj < today)) {
        setInvalidFields(["status", "start_date", "end_date"]);
        throw new Error("Cannot mark as 'Ongoing'. Today's date must fall between the start and end dates.");
      }

      let imageUrl = null;
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage.from('events').upload(filePath, imageFile);
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from('events').getPublicUrl(filePath);
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
      router.refresh();
      setIsSuccess(true);
      
    } catch (error: any) {
      setErrorMsg(error.message);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center flex flex-col justify-center">
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] overflow-hidden">
          <div className="h-2 bg-[#011638]" />
          <div className="p-10">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">Event Posted!</h1>
            <p className="text-[#475569] font-ubuntu-mono mb-6">Your event has been successfully saved to the database and is now live.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => router.push("/dashboard?tab=manage")} className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald">Go back to Dashboard</button>
              <button onClick={() => { setIsSuccess(false); setInvalidFields([]); }} className="px-6 py-2 text-[#011638] bg-white border border-[#011638] rounded-lg hover:bg-slate-50 transition-colors font-oswald">Create Another Event</button>
            </div>
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
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-ubuntu-mono font-bold">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md"><h2 className="text-lg font-oswald font-semibold">Event Details</h2></div>
          <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Full Title <span className="text-[#eec643]">*</span></label>
                <input type="text" name="title" required className={getFieldClass("title")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'title'))} />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Short Title <span className="text-[#eec643]">*</span></label>
                <input type="text" name="short_title" required className={getFieldClass("short_title")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'short_title'))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Start Date <span className="text-[#eec643]">*</span></label>
                <input type="date" name="start_date" required className={getFieldClass("start_date")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'start_date'))} />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">End Date <span className="text-[#eec643]">*</span></label>
                <input type="date" name="end_date" required className={getFieldClass("end_date")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'end_date'))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Location <span className="text-[#eec643]">*</span></label>
                <input type="text" name="location" required className={getFieldClass("location")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'location'))} />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Event Status <span className="text-[#eec643]">*</span></label>
                <select name="status" required className={getFieldClass("status")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'status'))}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Description <span className="text-[#eec643]">*</span></label>
              <textarea name="description" required rows={4} className={getFieldClass("description")} onChange={() => setInvalidFields(prev => prev.filter(f => f !== 'description'))} />
            </div>
            
            <div>
               <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Cover Image (Optional)</label>
               <input type="file" name="image" accept="image/*" className={getFieldClass("image")} />
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