"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import BackButton from "@/components/ui/backButton";

export default function AddEventForm() {
  const router = useRouter();
  const supabase = createClient();
  const formTopRef = useRef<HTMLDivElement>(null);

  // Form Fields State
  const [title, setTitle] = useState("");
  const [shortTitle, setShortTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Select");
  const [description, setDescription] = useState("");
  const [partnerships, setPartnerships] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Error States
  const [titleError, setTitleError] = useState("");
  const [shortTitleError, setShortTitleError] = useState("");
  const [dateError, setDateError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [descError, setDescError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);

  // User & Audit Log State
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const noChange =
    title.trim() === "" &&
    shortTitle.trim() === "" &&
    startDate === "" &&
    endDate === "" &&
    location.trim() === "" &&
    description.trim() === "" &&
    partnerships.trim() === "" &&
    !imageFile;

  // Change Handlers with Dynamic Validation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (val.trim().length < 2 && val.trim().length > 0) {
      setTitleError("Title is too short.");
      setHasError(true);
    } else {
      setTitleError("");
      setHasError(false);
    }
  };

  const handleShortTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setShortTitle(val);
    if (val.trim().length < 2 && val.trim().length > 0) {
      setShortTitleError("Short title is too short.");
      setHasError(true);
    } else {
      setShortTitleError("");
      setHasError(false);
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocation(val);
    if (val.trim()) setLocationError("");
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    if (val.trim().length < 10 && val.trim().length > 0) {
      setDescError("Description is too short.");
      setHasError(true);
    } else {
      setDescError("");
      setHasError(false);
    }
  };

  const handleDateOrStatusChange = (
    sDate: string,
    eDate: string,
    currStatus: string
  ) => {
    if (sDate && eDate) {
      const startObj = new Date(sDate);
      const endObj = new Date(eDate);
      const today = new Date();
      startObj.setHours(0, 0, 0, 0);
      endObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (endObj < startObj) {
        setDateError("End date cannot be earlier than start date.");
      } else {
        setDateError("");
      }

      if (currStatus === "Completed" && endObj >= today) {
        setStatusError("End date must be in the past for 'Completed'.");
      } else if (currStatus === "Upcoming" && startObj <= today) {
        setStatusError("Start date must be in the future for 'Upcoming'.");
      } else if (
        currStatus === "Ongoing" &&
        (startObj > today || endObj < today)
      ) {
        setStatusError("Today must be within the event range for 'Ongoing'.");
      } else {
        setStatusError("");
      }
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStartDate(val);
    handleDateOrStatusChange(val, endDate, status);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndDate(val);
    handleDateOrStatusChange(startDate, val, status);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    handleDateOrStatusChange(startDate, endDate, val);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTitleError("");
    setShortTitleError("");
    setDateError("");
    setLocationError("");
    setStatusError("");
    setDescError("");
    setSubmitError("");

    let validationFailed = false;

    const trimmedTitle = title.trim();
    const trimmedShortTitle = shortTitle.trim();
    const trimmedLocation = location.trim();
    const trimmedDesc = description.trim();
    const trimmedPartnerships = partnerships.trim();

    if (status === "Select") {
      setStatusError("Event status is required.");
      validationFailed = true;
    }

    if (!trimmedTitle) {
      setTitleError("Full title is required.");
      validationFailed = true;
    } else if (trimmedTitle.length < 2) {
      setTitleError("Title is too short.");
      validationFailed = true;
    }

    if (!trimmedShortTitle) {
      setShortTitleError("Short title is required.");
      validationFailed = true;
    } else if (trimmedShortTitle.length < 2) {
      setShortTitleError("Short title is too short.");
      validationFailed = true;
    }

    if (!trimmedLocation) {
      setLocationError("Location is required.");
      validationFailed = true;
    }

    if (!trimmedDesc) {
      setDescError("Description is required.");
      validationFailed = true;
    } else if (trimmedDesc.length < 10) {
      setDescError("Description is too short.");
      validationFailed = true;
    }

    if (!startDate || !endDate) {
      setDateError("Both start and end dates are required.");
      validationFailed = true;
    } else {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const today = new Date();
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (endDateObj < startDateObj) {
        setDateError("End date cannot be earlier than start date.");
        validationFailed = true;
      }

      if (status === "Completed" && endDateObj >= today) {
        setStatusError("End date must be in the past for 'Completed'.");
        validationFailed = true;
      }
      if (status === "Upcoming" && startDateObj <= today) {
        setStatusError("Start date must be in the future for 'Upcoming'.");
        validationFailed = true;
      }
      if (
        status === "Ongoing" &&
        (startDateObj > today || endDateObj < today)
      ) {
        setStatusError("Today must be within the event range for 'Ongoing'.");
        validationFailed = true;
      }
    }

    if (validationFailed) {
      setHasError(true);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setHasError(false);
    setIsSubmitting(true);

    try {
      let imageUrl = null;
      if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("events")
          .upload(fileName, imageFile);
        if (uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`);

        const {
          data: { publicUrl },
        } = supabase.storage.from("events").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const startDateObj = new Date(startDate);

      const { error } = await supabase.from("events").insert({
        title: trimmedTitle,
        short_title: trimmedShortTitle,
        year: startDateObj.getFullYear().toString(),
        start_date: startDate,
        end_date: endDate,
        location: trimmedLocation,
        status,
        description: trimmedDesc,
        image_url: imageUrl,
        partnerships: trimmedPartnerships,
      });

      if (error) throw new Error(error.message);
      await logCreateAudit(trimmedShortTitle);

      setIsSuccess(true);
      router.refresh();
    } catch (error: any) {
      setSubmitError(error.message || "An unexpected error occurred");
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

  const logCreateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Created a new event titled "${itemTitle}"`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "events",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  if (isSuccess) {
    return (
      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center">
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-10">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
            Event Posted!
          </h1>
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={() => router.push("/dashboard?tab=manage")}
              className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg font-oswald cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setIsSuccess(false);
                setTitle("");
                setShortTitle("");
                setStartDate("");
                setEndDate("");
                setLocation("");
                setStatus("Select");
                setDescription("");
                setPartnerships("");
                setImageFile(null);
              }}
              className="px-6 py-2 text-[#011638] bg-white border border-[#011638] rounded-lg font-oswald cursor-pointer"
            >
              Add Another
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl flex-1 w-full flex flex-col">
      <div ref={formTopRef} className="flex flex-col mb-6 gap-4">
        <BackButton
          href="/dashboard?tab=manage&section=events"
          className="!mb-0"
        />
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          Create New Event
        </h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 mb-8">
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-ubuntu-mono text-sm font-bold">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
            <h2 className="text-lg font-oswald font-semibold">
              Event Details
            </h2>
          </div>

          <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
            {/* Titles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form_label">Full Title</label>
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={handleTitleChange}
                  data-error={!!titleError}
                  placeholder="Full event title..."
                  className="form_input"
                />
                <span className="form_error">{titleError || "\u200b"}</span>
              </div>
              <div>
                <label className="form_label">Short Title</label>
                <input
                  type="text"
                  name="short_title"
                  value={shortTitle}
                  onChange={handleShortTitleChange}
                  data-error={!!shortTitleError}
                  placeholder="Short acronym or name..."
                  className="form_input"
                />
                <span className="form_error">
                  {shortTitleError || "\u200b"}
                </span>
              </div>
            </div>

            {/* Dates Grid */}
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

            {/* Location & Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form_label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={location}
                  onChange={handleLocationChange}
                  data-error={!!locationError}
                  placeholder="Event location..."
                  className="form_input"
                />
                <span className="form_error">{locationError || "\u200b"}</span>
              </div>
              <div>
                <label className="form_label">Event Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={handleStatusChange}
                  data-error={!!statusError}
                  className="form_input"
                >
                  <option value="Select" disabled>Select Status</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
                <span className="form_error">{statusError || "\u200b"}</span>
              </div>
            </div>

            {/* Description */}
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
                placeholder="Write event description..."
                className="form_input_area"
              />
              <span className="form_error">{descError || "\u200b"}</span>
            </div>

            {/* Partnerships (Optional) */}
            <div>
              <label className="form_label not_required">Partnerships</label>
              <textarea
                name="partnerships"
                value={partnerships}
                onChange={(e) => setPartnerships(e.target.value)}
                placeholder="Partner organizations (optional)..."
                className="form_input"
                rows={2}
              />
              <span className="form_error">{"\u200b"}</span>
            </div>

            {/* Cover Image (Optional) */}
            <div>
              <label className="form_label not_required">Cover Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className={`
                  form_input

                  file:mr-4
                  file:px-6
                  file:py-2
                  file:rounded-md
                  file:border-0

                  file:bg-[#011638]
                  file:text-[#fbfaf8]

                  file:font-oswald
                  file:text-sm
                  file:font-medium

                  file:cursor-pointer
                  file:transition-colors
                  hover:file:bg-[#1a2a4f]

                  cursor-pointer
                `}
              />
              <span className="form_error">{"\u200b"}</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end mt-4 items-center gap-3">
            <Link
              href="/dashboard?tab=manage&section=events"
              className="from_btn-cancel"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || noChange}
              className="form_btn-blue"
            >
              {isSubmitting ? "Posting..." : "Post Event"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}