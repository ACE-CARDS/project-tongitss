"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import LoadingState from "@/components/mainLoadingState";
import Footer from "@/components/footer";
import NavBar from "@/components/navbar";

function EditAnnouncementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Get ID and Type (landing vs dashboard) from URL
  const announcementId = searchParams.get("id");
  const type = searchParams.get("type") as "landing" | "dashboard";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    if (announcementId && type) {
      fetchAnnouncement();
    } else {
      router.push("/dashboard");
    }
  }, [announcementId, type]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const tableName = type === "landing" ? "announce_landing" : "announce_dash";
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", announcementId)
        .single();

      if (error) throw error;

      if (data) {
        // Map table-specific columns to local state
        setFormData({
          title: type === "landing" ? data.announce_landing_title : data.announce_dash_title,
          description: type === "landing" ? data.announce_landing_desc : data.announce_dash_desc,
          start_date: type === "landing" ? data.announce_landing_start : data.announce_dash_start,
          end_date: type === "landing" ? data.announce_landing_end : data.announce_dash_end,
        });
      }
    } catch (err) {
      console.error("Error fetching announcement:", err);
      alert("Failed to load announcement data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        throw new Error("End date cannot be earlier than the start date.");
      }

      const tableName = type === "landing" ? "announce_landing" : "announce_dash";
      
      // Map local state back to table-specific columns
      const payload = type === "landing" 
        ? {
            announce_landing_title: formData.title,
            announce_landing_desc: formData.description,
            announce_landing_start: formData.start_date,
            announce_landing_end: formData.end_date,
          }
        : {
            announce_dash_title: formData.title,
            announce_dash_desc: formData.description,
            announce_dash_start: formData.start_date,
            announce_dash_end: formData.end_date,
          };

      const { error } = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", announcementId);

      if (error) throw error;

      router.push("/dashboard/edit/success?type=announcement");
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      alert(error instanceof Error ? error.message : "Failed to update announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      <NavBar/>
      <main className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-oswald font-bold text-[#011638]">
            Edit {type === "landing" ? "Landing" : "Dashboard"} Announcement
          </h1>
        </div>

        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Announcement Details</h2>
              </div>
              
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Title <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Description <span className="text-[#eec643]">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={4}
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
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

            <div className="flex justify-end gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono flex items-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Update Announcement"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function EditAnnouncementForm() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EditAnnouncementContent />
    </Suspense>
  );
}