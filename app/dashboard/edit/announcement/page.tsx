"use client";

import { useState, useEffect, Suspense, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import Footer from "@/components/layout/footer";
import NavBar from "@/components/layout/navbar";
import { useUser } from "@/components/context/userContext";

function EditAnnouncementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const errorRef = useRef<HTMLDivElement>(null);

  const announcementId = searchParams.get("id");
  const type = searchParams.get("type") as "landing" | "dashboard";

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Track the initial state to compare against current state
  const [initialData, setInitialData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  // Boolean check to see if anything has changed
  const isUnchanged = useMemo(() => {
    return JSON.stringify(initialData) === JSON.stringify(formData);
  }, [initialData, formData]);

  useEffect(() => {
    if (announcementId && type) {
      fetchAnnouncement();
    } else {
      router.push("/dashboard");
    }
  }, [announcementId, type]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    setSubmitError("");
    try {
      const tableName =
        type === "landing" ? "announce_landing" : "announce_dash";

      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", announcementId)
        .single();

      if (error) throw error;

      if (data) {
        const fetchedData = {
          title:
            type === "landing"
              ? data.announce_landing_title
              : data.announce_dash_title,
          description:
            type === "landing"
              ? data.announce_landing_desc
              : data.announce_dash_desc,
          start_date:
            type === "landing"
              ? data.announce_landing_start
              : data.announce_dash_start,
          end_date:
            type === "landing"
              ? data.announce_landing_end
              : data.announce_dash_end,
        };
        setFormData(fetchedData);
        setInitialData(fetchedData); // Set initial baseline
      }
    } catch (err) {
      console.error("Error fetching announcement:", err);
      setSubmitError("Failed to load announcement data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setSubmitError("Title and Description are required.");
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setSubmitError("End date cannot be earlier than the start date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const tableName =
        type === "landing" ? "announce_landing" : "announce_dash";

      const payload =
        type === "landing"
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

      if (announcementId) {
        await logEditAudit(tableName, announcementId);
      }

      router.push("/dashboard/edit/success?type=announcement");
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      console.error("Update error:", err);

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

  //audit log
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const loadCurrentUser = async (email: string) => {
    const { data } = await supabase
      .from("member")
      .select("mem_fname, mem_lname, mem_email")
      .eq("mem_email", email)
      .single();

    const fullName = data
      ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim()
      : email;
    setCurrentUserName(fullName || email);
    setCurrentUserEmail(data?.mem_email || email);
  };

  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  //track what changed
  const getChangesString = () => {
    const changes: string[] = [];

    if (initialData.title !== formData.title) {
      changes.push(`title changed to "${formData.title}"`);
    }
    if (initialData.description !== formData.description) {
      changes.push(`description changed to "${formData.description}"`);
    }
    if (initialData.start_date !== formData.start_date) {
      changes.push(`start date changed to ${formData.start_date}`);
    }
    if (initialData.end_date !== formData.end_date) {
      changes.push(`end date changed to ${formData.end_date}`);
    }

    return changes.length > 0
      ? `Changes: [${changes.join(", ")}]`
      : "No changes detected";
  };

  const logEditAudit = async (tableName: string, recordId: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";
    const changes = getChangesString();

    const detailedMessage = `Updated announcement "${formData.title}" (ID: ${recordId}) in ${tableName}. ${changes}`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: tableName,
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
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
      <NavBar />
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
                  {type === "landing" ? "Public Landing" : "Internal Dashboard"}{" "}
                  Details
                </h2>
              </div>

              <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4 space-y-4">
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || isUnchanged}
                className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
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
