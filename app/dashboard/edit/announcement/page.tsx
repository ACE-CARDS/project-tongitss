"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import FormWrapper from "@/components/ui/wrapper/FormWrapper";
import SectionCard from "@/components/ui/wrapper/FormSectionWrapper";
import FormActions from "@/components/ui/FormActions";

function EditAnnouncementContent() {
  const searchParams = useSearchParams();
  const announcementId = searchParams.get("id");
  const type = searchParams.get("type") as "landing" | "dashboard";
  const router = useRouter();

  // Redirect instantly if required queries are missing
  useEffect(() => {
    if (!announcementId || !type) {
      router.push("/dashboard");
    }
  }, [announcementId, type, router]);

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
        {announcementId && type && (
          <EditAnnouncementForm announcementId={announcementId} type={type} />
        )}
      </div>
      <Footer />
    </>
  );
}

export default function EditAnnouncementPage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-oswald text-lg text-[#011638]">
          You are not authorized to edit announcements.
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <EditAnnouncementContent />
    </Suspense>
  );
}

interface EditAnnouncementFormProps {
  announcementId: string;
  type: "landing" | "dashboard";
}

export function EditAnnouncementForm({ announcementId, type }: EditAnnouncementFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const errorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [initialData, setInitialData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const noChange =
    title === initialData.title &&
    description === initialData.description &&
    startDate === initialData.startDate &&
    endDate === initialData.endDate;

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      setSubmitError("");
      try {
        const tableName = type === "landing" ? "announce_landing" : "announce_dash";

        const { data, error: dbError } = await supabase
          .from(tableName)
          .select("*")
          .eq("id", announcementId)
          .single();

        if (dbError) throw dbError;

        if (data) {
          const loadedData = {
            title: type === "landing" ? data.announce_landing_title : data.announce_dash_title,
            description: type === "landing" ? data.announce_landing_desc : data.announce_dash_desc,
            startDate: type === "landing" ? data.announce_landing_start : data.announce_dash_start,
            endDate: type === "landing" ? data.announce_landing_end : data.announce_dash_end,
          };

          setTitle(loadedData.title || "");
          setDescription(loadedData.description || "");
          setStartDate(loadedData.startDate || "");
          setEndDate(loadedData.endDate || "");

          setInitialData(loadedData);
        }
      } catch (err) {
        console.error("Error fetching announcement:", err);
        setSubmitError("Failed to load announcement data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [announcementId, type, supabase]);

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
    } else if (trimmedTitle.length < 2) {
      setTitleError("Title is too short.");
      hasError = true;
    }

    if (!trimmedDesc) {
      setDescError("Description is required.");
      hasError = true;
    } else if (trimmedDesc.length < 10) {
      setDescError("Description is too short.");
      hasError = true;
    }

    if (!startDate || !endDate) {
      setDateError("Both start and end dates are required.");
      hasError = true;
    } else if (new Date(endDate) < new Date(startDate)) {
      setDateError("End date cannot be earlier than start date or vice versa.");
      hasError = true;
    }

    if (hasError) {
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setIsSubmitting(true);

    try {
      const tableName = type === "landing" ? "announce_landing" : "announce_dash";
      const payload = type === "landing"
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

      const { error: dbError } = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", announcementId);

      if (dbError) throw dbError;

      await logEditAudit(tableName, announcementId, trimmedTitle);

      router.push("/dashboard/edit/success?type=announcement");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
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

  // Compute Delta Changesets for Audit Logs Records
  const getChangesString = (trimmedTitle: string) => {
    const changes: string[] = [];

    if (initialData.title !== trimmedTitle) {
      changes.push(`title changed to "${trimmedTitle}"`);
    }
    if (initialData.description !== description.trim()) {
      changes.push(`description changed to "${description.trim()}"`);
    }
    if (initialData.startDate !== startDate) {
      changes.push(`start date changed to ${startDate}`);
    }
    if (initialData.endDate !== endDate) {
      changes.push(`end date changed to ${endDate}`);
    }

    return changes.length > 0 ? `Changes: [${changes.join(", ")}]` : "No changes detected";
  };

  const logEditAudit = async (tableName: string, recordId: string, trimmedTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const deltaString = getChangesString(trimmedTitle);

    const detailedMessage = `Updated announcement "${trimmedTitle}" (ID: ${recordId}) in ${tableName}. ${deltaString}`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: tableName,
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write audit log", error);
  };

  if (loading) return <LoadingState />;

  return (
    <FormWrapper
      title={`Edit ${type === "landing" ? "Landing" : "Dashboard"} Announcement`}
      backHref="/dashboard?tab=manage&section=announcements"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Form Fields Card Container */}
        <SectionCard
          title={type === "landing" ? "Public Landing Details" : "Internal Dashboard Details"}
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
              placeholder={type === "landing" ? "Public heading..." : "Internal notice..."}
              className="form_input"
            />
            <span className="form_error">{titleError || "\u200b"}</span>
          </div>

          {/* Description Field & Dynamic Remaining String Counters */}
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
            <span className="form_error">{descError || "\u200b"}</span>
          </div>

          {/* Dates Bound Selection Layout */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form_label">Start Date</label>
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
                <label className="form_label">End Date</label>
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
            <span className="form_error">{dateError || "\u200b"}</span>
          </div>
        </SectionCard>

        {/* Core Controls Actions Interfacer */}
        <FormActions
          cancelHref="/dashboard?tab=manage&section=announcements"
          isStatus={isSubmitting}
          noChange={noChange}
          variant="blue"
          submitLabel="Update Announcement"
          submittingLabel="Updating..."
        />
      </form>
    </FormWrapper>
  );
}