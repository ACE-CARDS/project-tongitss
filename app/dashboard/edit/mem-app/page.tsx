"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useUser } from "@/components/context/userContext";

// Expanded parser for YouTube, Google Drive, and Facebook
const getEmbedUrl = (url: string) => {
  if (!url) return null;
  try {
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/i);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;

    const fbMatch = url.match(/(?:facebook\.com|fb\.watch|fb\.me)\/.+/i);
    if (fbMatch) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;

    return null;
  } catch {
    return null;
  }
};

function EditMemAppForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const formTopRef = useRef<HTMLDivElement>(null);

  const [initialType, setInitialType] = useState("");
  const [totalInstructions, setTotalInstructions] = useState(0);

  const [initialData, setInitialData] = useState({
    type: "",
    description: "",
    order_index: "" as string | number,
  });

  const [formData, setFormData] = useState({
    type: "instruction",
    description: "",
    order_index: "" as string | number,
  });

  useEffect(() => {
    setIframeError(false);
  }, [formData.description]);

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setIsFetching(true);

    const { data: instData } = await supabase
      .from("announce_memapp")
      .select("id")
      .eq("type", "instruction");
    const count = instData ? instData.length : 0;
    setTotalInstructions(count);

    const { data, error } = await supabase
      .from("announce_memapp")
      .select("*")
      .eq("id", id)
      .single();

    if (data && !error) {
      setInitialType(data.type);

      const fetchedState = {
        type: data.type,
        description: data.description || "",
        order_index: data.order_index || 1,
      };

      setFormData(fetchedState);
      setInitialData(fetchedState);
    } else {
      alert("Item not found");
      router.push("/dashboard?tab=manage&section=memapp");
    }
    setIsFetching(false);
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

    if (initialData.type !== formData.type) {
      changes.push(`type changed to "${formData.type}"`);
    }
    if (initialData.description !== formData.description) {
      changes.push(`description changed to "${formData.description}"`);
    }
    if (Number(initialData.order_index) !== Number(formData.order_index)) {
      changes.push(
        `sequence order shifted from #${initialData.order_index} to #${formData.order_index}`,
      );
    }

    return changes.length > 0
      ? `Changes: [${changes.join(", ")}]`
      : "No changes detected";
  };

  const logEditAudit = async (recordId: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const changes = getChangesString();
    const detailedMessage = `Updated membership application content (ID: ${recordId}). ${changes}`;

    const logEntry = {
      action: "Update",
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

  const getFieldClass = (fieldName: string, extraClasses: string = "") => {
    const baseClass = `w-full px-4 py-2 border rounded-lg focus:outline-none bg-[#fbfaf8] text-[#475569] font-ubuntu-mono ${extraClasses}`;
    const borderClass = invalidFields.includes(fieldName)
      ? "border-red-500 ring-1 ring-red-500"
      : "border-[#011638] focus:ring-[#011638]";
    return `${baseClass} ${borderClass}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInvalidFields([]);

    let finalSequence = 0;
    if (formData.type === "video") finalSequence = 1;
    else if (formData.type === "instruction") {
      finalSequence = parseInt(String(formData.order_index), 10);
      const dynamicMax =
        initialType === "instruction"
          ? totalInstructions
          : totalInstructions + 1;

      if (
        isNaN(finalSequence) ||
        finalSequence < 1 ||
        finalSequence > dynamicMax
      ) {
        setErrorMsg(
          `Please enter a valid sequence number (1 to ${dynamicMax}).`,
        );
        setInvalidFields(["order_index"]);
        formTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setLoading(false);
        return;
      }
    }

    if (formData.type === "video" && !getEmbedUrl(formData.description)) {
      setErrorMsg("Please enter a valid YouTube, Facebook, or Google Drive URL.");
      setInvalidFields(["description"]);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setLoading(false);
      return;
    }

    try {
      if (formData.type === "instruction") {
        const { data: otherItems } = await supabase
          .from("announce_memapp")
          .select("*")
          .eq("type", formData.type)
          .neq("id", id)
          .order("order_index", { ascending: true });

        let itemsList = otherItems || [];
        if (finalSequence > itemsList.length + 1)
          finalSequence = itemsList.length + 1;

        itemsList.splice(finalSequence - 1, 0, {
          id: "current",
          type: formData.type,
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

      if (formData.type === "video") {
        await supabase
          .from("announce_memapp")
          .update({ order_index: 0 })
          .eq("type", "video");
      }

      const submitData = {
        type: formData.type,
        description: formData.description.trim(),
        order_index: finalSequence,
      };

      const { error } = await supabase
        .from("announce_memapp")
        .update(submitData)
        .eq("id", id);
      if (error) throw error;

      if (id) {
        await logEditAudit(id);
      }

      router.refresh();
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg("Error updating item: " + err.message);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isFetching)
    return (
      <div
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <NavBar />
        <div className="flex-1 flex justify-center items-center py-20 font-ubuntu-mono text-[#475569] animate-pulse">
          Loading editor...
        </div>
        <Footer />
      </div>
    );

  const embedUrl = formData.type === "video" ? getEmbedUrl(formData.description) : null;
  const dynamicMax =
    formData.type === "instruction"
      ? initialType === "instruction"
        ? totalInstructions
        : totalInstructions + 1
      : undefined;

  return (
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />

      <main className="flex-1 container mx-auto py-10 px-4 sm:px-6 max-w-3xl flex flex-col">
        {isSuccess ? (
          <div className="flex-1 flex justify-center items-center py-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-[8px] border-[#011638] p-10 sm:p-14 flex flex-col items-center text-center w-full">
              <div className="w-[72px] h-[72px] rounded-full border-[1.5px] border-[#22c55e] flex items-center justify-center mb-6 p-1.5">
                <div className="w-full h-full rounded-full border-[1.5px] border-[#22c55e] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl sm:text-[28px] font-oswald font-bold text-[#011638] mb-3">
                Content Updated!
              </h2>
              <p className="text-[#475569] font-ubuntu-mono mb-10 text-[15px]">
                Your content changes have been successfully saved to the database.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                  onClick={() => router.push("/dashboard?tab=manage&section=memapp")}
                  className="px-6 py-2.5 bg-[#20409a] text-white rounded-md hover:bg-[#1e3a8a] transition-colors text-[15px] font-oswald uppercase tracking-widest font-bold"
                >
                  Go back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    fetchItem();
                  }}
                  className="px-6 py-2.5 bg-white text-[#011638] border border-[#011638] rounded-md hover:bg-slate-50 transition-colors text-[15px] font-oswald uppercase tracking-widest font-bold"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1">
            <div ref={formTopRef} className="mb-6 flex items-center justify-between">
              <button
                onClick={() => router.push("/dashboard?tab=manage&section=memapp")}
                className="flex items-center gap-2 text-[#475569] hover:text-[#011638] font-ubuntu-mono transition-colors"
              >
                <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>{" "}
                Back
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-[#011638] px-6 py-4">
                <h1 className="text-xl font-oswald font-bold text-[#fbfaf8] uppercase tracking-wide">
                  Edit Content
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-6">
                {errorMsg && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
                  <div className={formData.type === "video" || formData.type === "reminder" ? "sm:col-span-2 min-w-0" : "min-w-0"}>
                    <label className="block text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        setFormData({ ...formData, type: e.target.value });
                        setInvalidFields((prev) => prev.filter((f) => f !== "type"));
                      }}
                      className={getFieldClass("type")}
                      disabled={formData.type === "deadline"}
                    >
                      <option value="instruction">Instruction</option>
                      <option value="reminder">Reminder</option>
                      <option value="video">Video URL</option>
                    </select>
                  </div>

                  {formData.type === "instruction" && (
                    <div className="min-w-0">
                      <label className="block text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-2">
                        Sequence Order (1 to {dynamicMax})
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={dynamicMax}
                        value={formData.order_index}
                        onChange={(e) => {
                          setFormData({ ...formData, order_index: e.target.value });
                          setInvalidFields((prev) => prev.filter((f) => f !== "order_index"));
                        }}
                        className={getFieldClass("order_index")}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="min-w-0 relative">
                  <label className="block text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-2">
                    {formData.type === "video" ? "Video URL (YouTube, FB, Google Drive)" : "Description"}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                      setInvalidFields((prev) => prev.filter((f) => f !== "description"));
                    }}
                    rows={formData.type === "video" ? 2 : 5}
                    maxLength={formData.type !== "video" ? 500 : undefined}
                    placeholder={
                      formData.type === "video"
                        ? "https://youtube.com/..., https://drive.google.com/..., or fb.watch/..."
                        : "Enter text here..."
                    }
                    className={getFieldClass("description", "resize-y break-all whitespace-pre-wrap pb-8")}
                    required
                  />
                  {formData.type !== "video" && (
                    <span className={`absolute bottom-3 right-4 text-xs font-ubuntu-mono font-bold ${formData.description.length >= 500 ? "text-red-500" : "text-slate-400"}`}>
                      {formData.description.length}/500
                    </span>
                  )}
                </div>

                {formData.type === "video" && formData.description && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-3">
                      Video Preview Check
                    </h3>
                    {embedUrl && !iframeError ? (
                      <>
                        <iframe
                          src={embedUrl}
                          onError={() => setIframeError(true)}
                          className="w-full aspect-video rounded-lg shadow-sm border-0 bg-black"
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                        ></iframe>
                        <div className="mt-4 text-sm text-amber-800 bg-amber-50 p-4 rounded-md border border-amber-200 flex items-start gap-3">
                          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          <p className="font-ubuntu-mono leading-relaxed">
                            <strong>Privacy & Availability Warning:</strong> If the preview above shows an error or asks you to sign in, the video is set to private. Ensure you change the settings on the host platform to <strong>"Public"</strong> or <strong>"Anyone with the link"</strong> so applicants can view it.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-red-700 bg-red-50 p-4 rounded border border-red-200 font-ubuntu-mono font-bold">
                        The URL is either formatted incorrectly or completely blocks embedding. Please verify the URL and make sure its visibility is set to Public.
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard?tab=manage&section=memapp")}
                    className="px-4 py-2 text-[#475569] font-ubuntu-mono hover:text-[#011638] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#eec643] text-[#011638] rounded-lg hover:bg-[#d9b237] transition-colors font-oswald uppercase tracking-widest whitespace-nowrap shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Content"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function EditMemApp() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-20 font-ubuntu-mono text-[#475569] animate-pulse">
          Loading editor...
        </div>
      }
    >
      <EditMemAppForm />
    </Suspense>
  );
}