"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LoadingState from "@/components/mainLoadingState";
import Footer from "@/components/footer";

function EditEventContent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const errorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

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
    setSubmitError("");
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
      setSubmitError("Failed to load event data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    // Validations
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setSubmitError("End date cannot be earlier than the start date.");
      return;
    }

    if (formData.status === "Completed") {
      const endDateObj = new Date(formData.end_date);
      const today = new Date();
      endDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (endDateObj > today) {
        setSubmitError(
          "Cannot mark as 'Completed' if end date is in the future.",
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        year: new Date(formData.start_date).getFullYear().toString(),
      };

      const { error } = await supabase
        .from("events")
        .update(payload)
        .eq("id", eventId);

      if (error) throw error;

      router.push("/dashboard/edit/success?type=event");
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      setTimeout(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
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
        <div className="mb-6">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div
                ref={errorRef}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"
              >
                <p className="font-ubuntu-mono text-sm">{submitError}</p>
              </div>
            )}

            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                <h2 className="text-lg font-oswald font-semibold">
                  Event Details
                </h2>
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
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
