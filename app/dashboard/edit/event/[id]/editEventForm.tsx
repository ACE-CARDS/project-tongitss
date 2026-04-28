"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [shouldRemoveExisting, setShouldRemoveExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
  
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

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
        if (data.image_url) {
          setExistingImageUrl(data.image_url);
        }
      }
      setInitialLoading(false);
    };
    fetchEvent();
  }, [eventId, supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPreviewUrl(URL.createObjectURL(file));
    } else {
      setNewPreviewUrl(null);
    }
  };

  const clearNewImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setNewPreviewUrl(null);
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

      if (new Date(end) < new Date(start)) {
        throw new Error("End date cannot be earlier than the start date.");
      }

      if (status === "Completed") {
        const endDateObj = new Date(end);
        const today = new Date();
        
        endDateObj.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (endDateObj > today) {
          throw new Error("Cannot mark an event as 'Completed' if its end date is still in the future.");
        }
      }

      let finalImageUrl = shouldRemoveExisting ? null : existingImageUrl;

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
        
        finalImageUrl = publicUrl;
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
        image_url: finalImageUrl,
      };

      const { error } = await supabase.from("events").update(payload).eq("id", eventId);

      if (error) throw new Error(error.message);
      
      router.push("/dashboard?tab=events"); 
      router.refresh();
    } catch (error: any) {
      console.error("Update error:", error);
      setErrorMsg(error.message || "Failed to update event");
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
    <>
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

          <form onSubmit={handleSubmit} onChange={() => setErrorMsg(null)} className="space-y-6">
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
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Event Image
                </label>
                
                {/* EXISTING IMAGE PREVIEW */}
                {existingImageUrl && !shouldRemoveExisting && !newPreviewUrl && (
                  <div className="mb-4 p-3 border border-[#94a3b8] rounded-md bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div 
                      className="relative cursor-pointer border border-slate-300 rounded overflow-hidden group"
                      onClick={() => setFullscreenImage(existingImageUrl)}
                      title="Click to enlarge"
                    >
                      <img src={existingImageUrl} alt="Current event" className="h-20 w-24 object-cover group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded">ENLARGE</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShouldRemoveExisting(true)}
                      className="text-xs bg-red-100 text-red-700 font-bold px-3 py-2 rounded border border-red-200 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      ✕ Remove Current Image
                    </button>
                  </div>
                )}

                {/* WARNING STATE FOR EXISTING IMAGE */}
                {shouldRemoveExisting && !newPreviewUrl && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded flex items-center justify-between">
                    <span className="text-xs font-bold font-ubuntu-mono">⚠️ Image will be removed upon update.</span>
                    <button 
                      type="button" 
                      onClick={() => setShouldRemoveExisting(false)}
                      className="text-[10px] font-bold underline hover:text-red-800"
                    >
                      Undo
                    </button>
                  </div>
                )}

                {/* NEW UPLOAD PREVIEW */}
                {newPreviewUrl && (
                  <div className="mb-4 p-3 border border-[#94a3b8] rounded-md bg-white flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div 
                      className="relative cursor-pointer border border-slate-300 rounded overflow-hidden group"
                      onClick={() => setFullscreenImage(newPreviewUrl)}
                      title="Click to enlarge"
                    >
                      <img src={newPreviewUrl} alt="New Upload" className="h-20 w-24 object-cover group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded">ENLARGE</span>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={clearNewImage}
                      className="text-xs bg-red-100 text-red-700 font-bold px-3 py-2 rounded border border-red-200 hover:bg-red-600 hover:text-white transition-colors"
                    >
                      ✕ Clear New Upload
                    </button>
                  </div>
                )}

                <input 
                  type="file" 
                  name="image" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#011638] file:text-white hover:file:bg-[#1a2a4f] cursor-pointer" 
                />
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

      {/* FULLSCREEN LIGHTBOX */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8" 
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-4 right-6 text-white text-4xl hover:text-red-400 transition-colors z-50"
            onClick={() => setFullscreenImage(null)}
          >
            &times;
          </button>
          <img 
            src={fullscreenImage} 
            alt="Enlarged preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
}