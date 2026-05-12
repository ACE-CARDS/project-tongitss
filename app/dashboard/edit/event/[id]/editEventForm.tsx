"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import Footer from "@/components/layout/footer";

function EditEventContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]); 

  const [initialData, setInitialData] = useState({
    title: "",
    short_title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    short_title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    status: "",
  });

  const isUnchanged = useMemo(() => {
    return JSON.stringify(initialData) === JSON.stringify(formData);
  }, [initialData, formData]);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    } else {
      router.push("/dashboard?tab=events");
    }
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;

      if (data) {
        const fetchedData = {
          title: data.title || "",
          short_title: data.short_title || "",
          description: data.description || "",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          location: data.location || "",
          status: data.status || "",
        };
        setFormData(fetchedData);
        setInitialData(fetchedData);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      setErrorMsg("Failed to load event data.");
    } finally {
      setLoading(false);
    }
  };

  const getFieldClass = (fieldName: string) => {
    const baseClass = "text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none bg-[#fbfaf8]";
    const borderClass = invalidFields.includes(fieldName) 
      ? "border-red-500 ring-1 ring-red-500" 
      : "border-[#94a3b8] focus:border-[#011638]";
    return `${baseClass} ${borderClass}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
    if (invalidFields.includes(name)) {
      setInvalidFields(prev => prev.filter(f => f !== name));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setInvalidFields([]);

    const startDateObj = new Date(formData.start_date);
    const endDateObj = new Date(formData.end_date);
    const today = new Date();
    
    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);


    if (endDateObj < startDateObj) {
      setInvalidFields(["end_date", "start_date"]);
      setErrorMsg("End date cannot be earlier than the start date.");
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (formData.status === "Completed" && endDateObj >= today) {
      setInvalidFields(["status", "end_date"]);
      setErrorMsg("Cannot mark as 'Completed'. The end date must be strictly in the past.");
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (formData.status === "Upcoming" && startDateObj <= today) {
      setInvalidFields(["status", "start_date"]);
      setErrorMsg("Cannot mark as 'Upcoming'. The start date must be strictly in the future.");
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (formData.status === "Ongoing" && (startDateObj > today || endDateObj < today)) {
      setInvalidFields(["status", "start_date", "end_date"]);
      setErrorMsg("Cannot mark as 'Ongoing'. Today's date must fall between the start and end dates.");
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        year: startDateObj.getFullYear().toString(),
      };

      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", eventId);

      if (error) throw error;

      router.push("/dashboard/edit/success?type=event");
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMsg(errorMessage);
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div
      className="min-h-screen bg-[#fbfaf8]"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <main className="container mx-auto py-8 px-4 max-w-3xl">
        <div ref={formTopRef} className="mb-6">
          <Link
            href="/dashboard?tab=events"
            className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-oswald font-bold text-[#011638]">
            Edit Event
          </h1>
        </div>

        <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
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
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                <h2 className="text-lg font-oswald font-semibold">Event Details</h2>
              </div>

              <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4 space-y-4">
                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Full Title <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className={getFieldClass("title")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Short Title
                    </label>
                    <input
                      type="text"
                      name="short_title"
                      value={formData.short_title}
                      onChange={handleChange}
                      className={getFieldClass("short_title")}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={getFieldClass("description")}
                  />
                </div>

                {/* Location & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={getFieldClass("location")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Status <span className="text-[#eec643]">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={getFieldClass("status")}
                    >
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
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
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      className={getFieldClass("start_date")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      End Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      className={getFieldClass("end_date")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
              <Link
                href="/dashboard?tab=events"
                className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUnchanged}
                className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Event"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function EditEventForm({ eventId }: { eventId: string }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <EditEventContent eventId={eventId} />
    </Suspense>
  );
}