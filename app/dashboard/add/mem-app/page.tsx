"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/components/context/userContext";
import BackButton from "@/components/ui/backButton";

const getEmbedUrl = (url: string) => {
  if (!url) return null;
  try {
    if (url.includes("watch?v="))
      return `https://www.youtube.com/embed/${url.split("watch?v=")[1].split("&")[0]}`;
    if (url.includes("youtu.be/"))
      return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
    return url;
  } catch {
    return null;
  }
};

export default function AddMemApp() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [instructionCount, setInstructionCount] = useState(0);

  // Form Field States
  const [type, setType] = useState("instruction");
  const [orderIndex, setOrderIndex] = useState<string | number>("");
  const [description, setDescription] = useState("");

  // Error States
  const [typeError, setTypeError] = useState("");
  const [orderIndexError, setOrderIndexError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMax = async () => {
      const { data } = await supabase
        .from("announce_memapp")
        .select("id")
        .eq("type", "instruction");
      if (data) setInstructionCount(data.length);
    };
    fetchMax();
  }, [supabase]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
    setTypeError("");
    setOrderIndexError("");
    setDescriptionError("");
  };

  const handleOrderIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrderIndex(val);
    if (val) setOrderIndexError("");
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setDescription(val);
    if (val.trim()) setDescriptionError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeError("");
    setOrderIndexError("");
    setDescriptionError("");
    setSubmitError("");

    let validationFailed = false;

    let finalSequence = 0;
    if (type === "video") {
      finalSequence = 1;
    } else if (type === "instruction") {
      finalSequence = parseInt(String(orderIndex), 10);

      if (
        isNaN(finalSequence) ||
        finalSequence < 1 ||
        finalSequence > instructionCount + 1
      ) {
        setOrderIndexError(
          `Sequence must be between 1 and ${instructionCount + 1}.`
        );
        validationFailed = true;
      }
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setDescriptionError(
        type === "video" ? "YouTube URL is required." : "Description is required."
      );
      validationFailed = true;
    } else if (type === "video" && !getEmbedUrl(trimmedDesc)) {
      setDescriptionError("Please enter a valid YouTube URL.");
      validationFailed = true;
    }

    if (validationFailed) {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setLoading(true);

    try {
      if (type === "instruction") {
        const { data: otherItems } = await supabase
          .from("announce_memapp")
          .select("*")
          .eq("type", type)
          .order("order_index", { ascending: true });

        let itemsList = otherItems || [];
        if (finalSequence > itemsList.length + 1)
          finalSequence = itemsList.length + 1;

        itemsList.splice(finalSequence - 1, 0, {
          id: "current",
          type,
          description: "",
          order_index: 0,
          created_at: "",
        });

        for (let i = 0; i < itemsList.length; i++) {
          const expectedIndex = i + 1;
          if (
            itemsList[i].id !== "current" &&
            itemsList[i].order_index !== expectedIndex
          ) {
            await supabase
              .from("announce_memapp")
              .update({ order_index: expectedIndex })
              .eq("id", itemsList[i].id);
          }
        }
      }

      if (type === "video") {
        await supabase
          .from("announce_memapp")
          .update({ order_index: 0 })
          .eq("type", "video");
      }

      const submitData = {
        type,
        description: trimmedDesc,
        order_index: finalSequence,
      };

      const { error } = await supabase
        .from("announce_memapp")
        .insert([submitData]);

      if (error) throw error;
      await logCreateAudit(type, trimmedDesc, finalSequence);

      router.refresh();
      setIsSuccess(true);
    } catch (err: any) {
      setSubmitError("Error saving item: " + err.message);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setType("instruction");
    setDescription("");
    setOrderIndex("");
    setIsSuccess(false);
    setSubmitError(null);
    setTypeError("");
    setOrderIndexError("");
    setDescriptionError("");
  };

  const embedUrl = type === "video" ? getEmbedUrl(description) : null;

  // Audit Log Integration
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

  const logCreateAudit = async (
    contentType: string,
    text: string,
    orderIdx: number
  ) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    let detailedMessage = "";
    if (contentType === "instruction") {
      detailedMessage = `Created new instruction step at sequence #${orderIdx}: "${text.substring(0, 60)}${text.length > 60 ? "..." : ""}"`;
    } else if (contentType === "video") {
      detailedMessage = `Added new video link: "${text}"`;
    } else {
      detailedMessage = `Created new reminder item: "${text.substring(0, 60)}${text.length > 60 ? "..." : ""}"`;
    }

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "announce_memapp",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] min-h-screen bg-[#fbfaf8]"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <main className="flex-1 container mx-auto py-10 px-4 sm:px-6 max-w-3xl flex flex-col">
          {isSuccess ? (
            <div className="flex-1 flex justify-center items-center py-12">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-[8px] border-[#011638] p-10 sm:p-14 flex flex-col items-center text-center w-full">
                <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-[#22c55e] flex items-center justify-center mb-6 p-1.5">
                  <div className="w-full h-full rounded-full border-[1.5px] border-[#22c55e] flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-[#22c55e]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl sm:text-[28px] font-oswald font-bold text-[#011638] mb-3">
                  Content Posted!
                </h2>
                <p className="text-[#475569] font-ubuntu-mono mb-10 text-[15px]">
                  Your content has been successfully saved to the database and
                  is now live.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <button
                    onClick={() =>
                      router.push("/dashboard?tab=manage&section=memapp")
                    }
                    className="px-6 py-2.5 bg-[#20409a] text-white rounded-md hover:bg-[#1e3a8a] transition-colors text-[15px] font-oswald uppercase tracking-widest font-bold"
                  >
                    Go back to Dashboard
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-2.5 bg-white text-[#011638] border border-[#011638] rounded-md hover:bg-slate-50 transition-colors text-[15px] font-oswald uppercase tracking-widest font-bold"
                  >
                    Create Another Content
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1">
              <div ref={formTopRef} className="flex flex-col gap-4 mb-6">
                <BackButton
                  href="/dashboard?tab=manage&section=memapp"
                  className="!mb-0"
                />
                <h1 className="text-2xl sm:text-3xl font-oswald font-bold text-[#011638]">
                  Create New Content
                </h1>
              </div>

              <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 mb-8">
                {submitError && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-ubuntu-mono text-sm font-bold">
                      {submitError}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                    <h2 className="text-lg font-oswald font-semibold">
                      MemApp Details
                    </h2>
                  </div>

                  <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                    {/* Content Type & Sequence Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        className={
                          type === "video" || type === "reminder"
                            ? "sm:col-span-2"
                            : ""
                        }
                      >
                        <label className="form_label">Content Type</label>
                        <select
                          value={type}
                          onChange={handleTypeChange}
                          data-error={!!typeError}
                          className="form_input"
                        >
                          <option value="instruction">Instruction</option>
                          <option value="reminder">Reminder</option>
                          <option value="video">Video URL</option>
                        </select>
                        <span className="form_error">
                          {typeError || "\u200b"}
                        </span>
                      </div>

                      {type === "instruction" && (
                        <div>
                          <label className="form_label">
                            Sequence Order (1 to {instructionCount + 1})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={instructionCount + 1}
                            value={orderIndex}
                            onChange={handleOrderIndexChange}
                            data-error={!!orderIndexError}
                            className="form_input"
                          />
                          <span className="form_error">
                            {orderIndexError || "\u200b"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description / YouTube URL Input */}
                    <div>
                      <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
                        <label className="form_label">
                          {type === "video" ? "YouTube URL" : "Description"}
                        </label>
                        {type !== "video" && (
                          <span className="text-xs font-ubuntu-mono text-[#475569] select-none pt-0.5 text-right">
                            {500 - description.length} characters remaining
                          </span>
                        )}
                      </div>
                      <textarea
                        value={description}
                        onChange={handleDescriptionChange}
                        rows={type === "video" ? 2 : 5}
                        maxLength={type !== "video" ? 500 : undefined}
                        data-error={!!descriptionError}
                        placeholder={
                          type === "video"
                            ? "https://youtube.com/..."
                            : "Enter text here..."
                        }
                        className={
                          type === "video"
                            ? "form_input"
                            : "form_input_area"
                        }
                      />
                      <span className="form_error">
                        {descriptionError || "\u200b"}
                      </span>
                    </div>

                    {/* YouTube Video Preview */}
                    {type === "video" && description && (
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-3">
                          Preview
                        </h3>
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            className="w-full aspect-video rounded-lg shadow-sm border-0"
                            allowFullScreen
                          />
                        ) : (
                          <p className="text-sm text-red-500 font-ubuntu-mono font-bold">
                            Invalid YouTube URL
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end mt-4 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="from_btn-cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="form_btn-blue"
                    >
                      {loading ? "Saving..." : "Save Content"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}