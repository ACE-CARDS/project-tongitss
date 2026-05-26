"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/components/context/userContext";
import LoadingState from "@/components/ui/loading/mainLoadingState";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import FormWrapper from "@/components/ui/wrapper/FormWrapper";
import SectionCard from "@/components/ui/wrapper/FormSectionWrapper";
import FormActions from "@/components/ui/FormActions";

function AddAnnouncementContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] min-h-screen bg-[#fbfaf8]"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <AddAnnouncementForm />
      </div>
      <Footer />
    </>
  );
}

export default function AddAnnouncementPage() {
  const { user } = useUser();
  
  // Show loading while user is being fetched
  if (!user) {
    return <LoadingState />;
  }
  
  // Check authorization after user is loaded
  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to add announcements.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <AddAnnouncementContent />
    </Suspense>
  );
}

export function AddAnnouncementForm() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [announcementType, setAnnouncementType] = useState<"landing" | "dashboard">("landing");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const noChange = 
    title.trim() === "" && 
    description.trim() === "" && 
    startDate === "" && 
    endDate === "";

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (value.trim().length < 2 && value.trim().length > 0) {
      setTitleError("Title is too short.");
    } else {
      setTitleError("");
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (value.trim().length < 10 && value.trim().length > 0) {
      setDescError("Description is too short.");
    } else {
      setDescError("");
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    if (value && endDate) setDateError("");
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    if (startDate && value) {
      if (new Date(value) >= new Date(startDate)) {
        setDateError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTitleError("");
    setDescError("");
    setDateError("");
    setSubmitError("");

    let hasError = false;
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required.");
      hasError = true;
    } else if (trimmedTitle.length < 2 && trimmedTitle.length > 0) {
      setTitleError("Title is too short.");
    }

    if (!trimmedDesc) {
      setDescError("Description is required.");
      hasError = true;
    } else if (trimmedDesc.length < 10 && trimmedDesc.length > 0) {
      setDescError("Description is too short.");
    } 

    if (!startDate || !endDate) {
      setDateError("Both start and end dates are required.");
      hasError = true;
    } else if (new Date(endDate) < new Date(startDate)) {
      setDateError("End date cannot be earlier than start date or vice versa.");
      hasError = true;
    }

    setIsSubmitting(true);

    try {
      const tableName = announcementType === "landing" ? "announce_landing" : "announce_dash";
      const payload = announcementType === "landing"
        ? {
            announce_landing_title: trimmedTitle,
            announce_landing_desc: trimmedDesc,
            announce_landing_start: startDate,
            announce_landing_end: endDate,
          }
        : {
            announce_dash_title: trimmedTitle,
            announce_dash_desc: trimmedDesc,
            announce_dash_start: startDate,
            announce_dash_end: endDate,
          };

      const { error: dbError } = await supabase.from(tableName).insert(payload);
      if (dbError) throw new Error(dbError.message);

      await logCreateAudit(tableName, trimmedTitle);

      router.push("/dashboard/add/success?type=announcement");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  useEffect(() => {
    if (user?.email) loadCurrentUser(user.email);
  }, [user?.email]);

  const logCreateAudit = async (tableName: string, itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const detailedMessage = `Created a new announcement titled "${itemTitle}" in ${tableName}`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: tableName,
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write audit log", error);
  };

  return (
    <FormWrapper 
      title="Create New Announcement" 
      backHref="/dashboard?tab=manage&section=announcements"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Display Location Buttons */}
        <div>
          <label className="form_label">Display Location</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAnnouncementType("landing")}
              className={`cursor-pointer py-3 px-4 rounded-xl border-2 font-ubuntu-mono transition-all duration-200 ${
                announcementType === "landing"
                  ? "border-[#011638] bg-[#011638] text-white"
                  : "border-[#94a3b8] text-[#475569] hover:border-[#011638]"
              }`}
            >
              Landing Page
            </button>
            <button
              type="button"
              onClick={() => setAnnouncementType("dashboard")}
              className={`cursor-pointer py-3 px-4 rounded-xl border-2 font-ubuntu-mono transition-all duration-200 ${
                announcementType === "dashboard"
                  ? "border-[#011638] bg-[#011638] text-white"
                  : "border-[#94a3b8] text-[#475569] hover:border-[#011638]"
              }`}
            >
              Member Dashboard
            </button>
          </div>
        </div>

        {/* Details Content Wrapper Box */}
        <SectionCard 
          title={announcementType === "landing" ? "Public Landing Details" : "Internal Dashboard Details"}
        >
          {/* Title Field */}
          <div>
            <label className="form_label">Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={handleTitleChange}
              maxLength={100}
              data-error={!!titleError}
              placeholder={announcementType === "landing" ? "Public heading..." : "Internal notice..."}
              className="form_input"
            />
            <span className="form_error">
              {titleError || "\u200b"}
            </span>
          </div>

          {/* Description Field */}
          <div>
            
            <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
              <label className="form_label">Description</label>
              <span className="text-xs font-ubuntu-mono text-[#475569] select-none pt-0.5 text-right">
                {500 - description.length} characters remaining
              </span>
            </div>
            <textarea
              name="description"
              value={description}
              onChange={handleDescChange}
              maxLength={500}
              data-error={!!descError}
              placeholder="Write information details..."
              className="form_input_area"
            />
            <span className="form_error">
              {descError || "\u200b"}
            </span>
          </div>

          {/* Dates Grid Fields */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form_label">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={startDate}
                  min="2022-01-01"
                  max={endDate}
                  onChange={handleStartDateChange}
                  data-error={!!dateError}
                  className="form_input"
                />
              </div>
              <div>
                <label className="form_label">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={endDate}
                  min={startDate}
                  onChange={handleEndDateChange}
                  data-error={!!dateError}
                  className="form_input"
                />
              </div>
            </div>
            <span className="form_error">
              {dateError || "\u200b"}
            </span>
          </div>
        </SectionCard>

        <FormActions
          cancelHref="/dashboard?tab=manage&section=announcements"
          isStatus={isSubmitting}
          noChange={noChange}
          variant="blue"
          submitLabel={`Post to ${announcementType === "landing" ? "Landing" : "Dashboard"}`}
          submittingLabel="Posting..."
        />
      </form>
    </FormWrapper>
  );
}