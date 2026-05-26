"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";

export default function EditEventForm({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single();

        if (error) throw error;
        setEventData(data);
      } catch (error: any) {
        setErrorMsg("Failed to load event data. It may have been deleted.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, supabase]);

  const getFieldClass = (fieldName: string) => {
    const baseClass =
      "text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none bg-[#fbfaf8]";

    const borderClass = invalidFields.includes(fieldName)
      ? "border-red-500 ring-1 ring-red-500"
      : "border-[#94a3b8] focus:border-[#011638]";

    return `${baseClass} ${borderClass}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMsg(null);
    setInvalidFields([]);

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

    if (!title) { setInvalidFields(["title"]); setErrorMsg("Full title is required."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (!shortTitle) { setInvalidFields(["short_title"]); setErrorMsg("Short title is required."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (!location) { setInvalidFields(["location"]); setErrorMsg("Location is required."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (!description) { setInvalidFields(["description"]); setErrorMsg("Description is required."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (endDateObj < startDateObj) { setInvalidFields(["start_date", "end_date"]); setErrorMsg("End date cannot be earlier than start date."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (status === "Completed" && endDateObj >= today) { setInvalidFields(["status", "end_date"]); setErrorMsg("Cannot mark as 'Completed'. End date must be in the past."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (status === "Upcoming" && startDateObj <= today) { setInvalidFields(["status", "start_date"]); setErrorMsg("Cannot mark as 'Upcoming'. Start date must be in the future."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (status === "Ongoing" && (startDateObj > today || endDateObj < today)) { setInvalidFields(["status", "start_date", "end_date"]); setErrorMsg("Cannot mark as 'Ongoing'. Today's date must fall within the event dates."); formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }

    setIsSubmitting(true);

    try {
      let imageUrl = eventData.image_url;

      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage.from("events").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const { error } = await supabase.from("events").update({
        title,
        short_title: shortTitle,
        year: startDateObj.getFullYear().toString(),
        start_date: start,
        end_date: end,
        location,
        status,
        description,
        image_url: imageUrl,
      }).eq("id", eventId);

      if (error) throw new Error(error.message);

      await logUpdateAudit(shortTitle);

      setIsSuccess(true);
      router.refresh();
    } catch (error: any) {
      setErrorMsg(error.message);
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadCurrentUser = async (email: string) => {
      const { data } = await supabase
        .from("member")
        .select("mem_fname, mem_lname, mem_email")
        .eq("mem_email", email)
        .single();

      const fullName = data ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim() : email;
      setCurrentUserName(fullName || email);
      setCurrentUserEmail(data?.mem_email || email);
    };

    if (user?.email) loadCurrentUser(user.email);
  }, [user?.email, supabase]);

  const logUpdateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const detailedMessage = `Updated event titled "${itemTitle}"`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "events",
    };

    await supabase.from("audit_log").insert([logEntry]);
  };

  if (!eventId) {
    return <main className="container mx-auto py-16 text-center font-ubuntu-mono text-red-600">Missing Event ID parameter.</main>;
  }

  if (isLoading) {
    return <main className="container mx-auto py-16 text-center font-ubuntu-mono text-[#011638] animate-pulse">Loading event data...</main>;
  }

  if (isSuccess) {
    return (
      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center">
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">Event Updated!</h1>
          <div className="flex gap-4 justify-center mt-6">
            <button onClick={() => router.push("/dashboard?tab=manage")} className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg font-oswald">
              Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl flex-1 w-full flex flex-col">
      <div ref={formTopRef} className="mb-6">
        <Link href="/dashboard?tab=manage" className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Edit Event</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 mb-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
            <div className="flex items-center">
              <p className="text-sm text-red-700 font-ubuntu-mono font-bold ml-2">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
            <h2 className="text-lg font-oswald font-semibold">Event Details</h2>
          </div>

          <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Full Title <span className="text-[#eec643]">*</span></label>
                <input type="text" name="title" defaultValue={eventData?.title} className={getFieldClass("title")} />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Short Title <span className="text-[#eec643]">*</span></label>
                <input type="text" name="short_title" defaultValue={eventData?.short_title} className={getFieldClass("short_title")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Start Date <span className="text-[#eec643]">*</span></label>
                <input type="date" name="start_date" defaultValue={eventData?.start_date} className={getFieldClass("start_date")} />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">End Date <span className="text-[#eec643]">*</span></label>
                <input type="date" name="end_date" defaultValue={eventData?.end_date} className={getFieldClass("end_date")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Location <span className="text-[#eec643]">*</span></label>
                <input type="text" name="location" defaultValue={eventData?.location} className={getFieldClass("location")} />
              </div>
              <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Event Status <span className="text-[#eec643]">*</span></label>
                <select name="status" defaultValue={eventData?.status} className={getFieldClass("status")}>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Description <span className="text-[#eec643]">*</span></label>
              <textarea name="description" rows={4} defaultValue={eventData?.description} className={getFieldClass("description")} />
            </div>

            <div>
              <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Change Cover Image (Optional)</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className={`${getFieldClass("image")} file:mr-4 file:px-6 file:py-2 file:rounded-md file:border-0 file:bg-[#011638] file:text-[#fbfaf8] file:font-oswald file:text-sm file:font-medium file:cursor-pointer hover:file:bg-[#1a2a4f] cursor-pointer`}
              />
              {eventData?.image_url && (
                <p className="mt-2 text-xs font-ubuntu-mono text-[#475569]">Leave empty to keep the existing image.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#011638] text-[#fbfaf8] font-oswald font-medium px-8 py-2 rounded-md hover:bg-[#1a2a4f] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}