"use client";

import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import BackButton from "@/components/ui/backButton";

// Main component
function EditNewsMediaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");
  const from = searchParams.get("from");
  const supabase = createClient();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Image States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    post_url: "",
    fb_post_date: "",
  });

  const [initialFormData, setInitialFormData] = useState({
    title: "",
    content: "",
    post_url: "",
    fb_post_date: "",
  });

  // Error states
  const [submitError, setSubmitError] = useState<string>("");
  const [titleContentError, setTitleContentError] = useState("");
  const [postUrlError, setPostUrlError] = useState("");
  const [postDateError, setPostDateError] = useState("");
  const [imageError, setImageError] = useState("");

  // Audit User Info
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);

  // Logic to determine if any change has occurred
  const isUnchanged = useMemo(() => {
    const textIsSame =
      JSON.stringify(formData) === JSON.stringify(initialFormData);
    const imageIsSame = imagePreview === (initialImageUrl || "");
    return textIsSame && imageIsSame && !imageFile;
  }, [formData, initialFormData, imagePreview, initialImageUrl, imageFile]);

  useEffect(() => {
    if (newsId) {
      fetchNewsData();
    } else {
      router.push("/dashboard/news-media");
    }
  }, [newsId]);

  // Load current user for audit logs
  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  // Cleanup Preview Blob URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

  const fetchNewsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("news_media")
        .select("*")
        .eq("id", newsId)
        .single();

      if (error) throw error;

      if (data) {
        const fetchedFields = {
          title: data.title || "",
          content: data.content || "",
          post_url: data.post_url || "",
          fb_post_date: data.fb_post_date
            ? new Date(data.fb_post_date).toISOString().split("T")[0]
            : "",
        };

        setFormData(fetchedFields);
        setInitialFormData(fetchedFields);

        if (data.image_url) {
          setCurrentImageUrl(data.image_url);
          setInitialImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      setSubmitError("Failed to load news article.");
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (urlStr: string): boolean => {
    try {
      new URL(urlStr);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    if (name === "title" || name === "content") {
      const title = name === "title" ? value : updatedFormData.title;
      const content = name === "content" ? value : updatedFormData.content;

      if (!title?.trim() && !content?.trim()) {
        setTitleContentError("Either Title or Description must be provided.");
      } else {
        setTitleContentError("");
      }
    }

    if (name === "post_url") {
      if (!value.trim()) {
        setPostUrlError("Post URL is required.");
      } else if (!validateUrl(value.trim())) {
        setPostUrlError("Please enter a valid URL.");
      } else {
        setPostUrlError("");
        checkDuplicatePostUrl(value.trim(), newsId!);
      }
    }

    if (name === "fb_post_date") {
      if (!value) {
        setPostDateError("Post Date is required.");
      } else {
        setPostDateError("");
      }
    }
  };

  const validateTitleContent = (): boolean => {
    const title = formData.title?.trim() || "";
    const content = formData.content?.trim() || "";
    if (!title && !content) {
      setTitleContentError("Either Title or Description must be provided.");
      return false;
    }
    setTitleContentError("");
    return true;
  };

  const checkDuplicatePostUrl = async (
    url: string,
    currentId: string
  ): Promise<boolean> => {
    if (!url || url === initialFormData.post_url) return true;

    const { data } = await supabase
      .from("news_media")
      .select("id")
      .eq("post_url", url)
      .neq("id", currentId)
      .maybeSingle();

    if (data) {
      setPostUrlError(
        "This post URL is already in use. Please provide a unique URL."
      );
      return false;
    }
    setPostUrlError("");
    return true;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-image")
      .upload(filePath, file);

    if (uploadError) return null;

    const {
      data: { publicUrl },
    } = supabase.storage.from("news-image").getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteOldImage = async (oldImageUrl: string) => {
    const fileName = oldImageUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("news-image").remove([fileName]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setImageError("File size must be less than 10MB.");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/heic",
        "image/heif",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setImageError("Only JPEG, JPG, PNG, HEIC, HEIF, and GIF images are allowed.");
        return;
      }

      setImageError("");

      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setCurrentImageUrl(null);
    setImagePreview("");
    setImageFile(null);
    setImageError("");
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const getChangesString = () => {
    const changes: string[] = [];
    const imageIsSame = imagePreview === (initialImageUrl || "");

    if (initialFormData.title !== formData.title) {
      changes.push(`title changed to "${formData.title}"`);
    }
    if (initialFormData.content !== formData.content) {
      changes.push(`description changed to "${formData.content}"`);
    }
    if (initialFormData.fb_post_date !== formData.fb_post_date) {
      changes.push(`post date changed to ${formData.fb_post_date}`);
    }
    if (initialFormData.post_url !== formData.post_url) {
      changes.push(`post URL changed to ${formData.post_url}`);
    }
    if (!imageIsSame) {
      changes.push(`image changed`);
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

    const detailedMessage = `Updated news article "${formData.title || "Untitled"}" (ID: ${recordId}). ${changes}`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "news_media",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setPostUrlError("");
    setPostDateError("");
    setTitleContentError("");

    let validationFailed = false;

    if (!validateTitleContent()) {
      validationFailed = true;
    }

    const trimmedUrl = formData.post_url.trim();
    if (!trimmedUrl) {
      setPostUrlError("Post URL is required.");
      validationFailed = true;
    } else if (!validateUrl(trimmedUrl)) {
      setPostUrlError("Please enter a valid URL.");
      validationFailed = true;
    }

    if (!formData.fb_post_date) {
      setPostDateError("Post date is required.");
      validationFailed = true;
    }

    if (validationFailed) {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setSaving(true);

    try {
      const isUrlUnique = await checkDuplicatePostUrl(trimmedUrl, newsId!);
      if (!isUrlUnique) {
        throw new Error(
          "This post URL is already in use. Please provide a unique URL."
        );
      }

      let imageUrl = currentImageUrl;

      // Upload new file if selected
      if (imageFile) {
        if (initialImageUrl) {
          await deleteOldImage(initialImageUrl);
        }
        const newImageUrl = await uploadImage(imageFile);
        if (!newImageUrl) throw new Error("Failed to upload image. Please try again.");
        imageUrl = newImageUrl;
      }
      // If image was removed
      else if (!imagePreview && initialImageUrl) {
        await deleteOldImage(initialImageUrl);
        imageUrl = null;
      }

      const { error: updateError } = await supabase
        .from("news_media")
        .update({
          title: formData.title.trim() || null,
          content: formData.content.trim() || null,
          image_url: imageUrl,
          post_url: trimmedUrl,
          fb_post_date: formData.fb_post_date,
        })
        .eq("id", newsId);

      if (updateError) throw new Error(updateError.message);

      if (newsId) {
        await logEditAudit(newsId);
      }

      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      router.push(
        from === "admin"
          ? "/dashboard/edit/success?type=news-media&from=admin"
          : "/dashboard/edit/success?type=news-media"
      );
      router.refresh();
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(errorMessage);
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#475569] font-ubuntu-mono">
          You are not authorized to edit news articles.
        </p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div ref={formTopRef} className="flex flex-col mb-6 gap-4">
            <BackButton
              href={
                from === "admin"
                  ? "/dashboard?tab=manage&section=news"
                  : "/dashboard"
              }
              className="!mb-0"
            />
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">
              Edit News Article
            </h1>
          </div>

          <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-ubuntu-mono text-sm font-bold">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                  <h2 className="text-lg font-oswald font-semibold">
                    Basic Information
                  </h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="form_label">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      maxLength={200}
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter news title"
                      data-error={!!titleContentError}
                      className="form_input"
                    />
                    <span className="form_error">
                      {titleContentError || "\u200b"}
                    </span>
                  </div>

                  {/* Description / Content */}
                  <div>
                    <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
                      <label htmlFor="content" className="form_label">
                        Description
                      </label>
                      <span className="text-xs font-ubuntu-mono text-[#475569] select-none pt-0.5 text-right">
                        {1500 - formData.content.length} characters remaining
                      </span>
                    </div>
                    <textarea
                      id="content"
                      name="content"
                      rows={6}
                      maxLength={1500}
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Enter news description or content"
                      data-error={!!titleContentError}
                      className="form_input_area custom-scrollbar-blue"
                    />
                    <span className="form_error">
                      {titleContentError || "\u200b"}
                    </span>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="form_label">Image</label>
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#94a3b8] border-dashed rounded-lg hover:border-[#011638] transition-colors cursor-pointer"
                      onClick={() => {
                        const fileInput = document.getElementById(
                          "image-upload"
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.click();
                      }}
                    >
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mx-auto h-48 w-auto object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="mx-auto h-12 w-12 text-[#475569]"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-[#475569]">
                              <span className="rounded-md font-medium text-[#011638] hover:text-[#1a2a4f]">
                                Click to upload
                              </span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-[#475569]">
                              JPEG, JPG, PNG, HEIC, HEIF, GIF up to 10MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <input
                      id="image-upload"
                      name="image"
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/gif"
                      onChange={handleImageChange}
                    />
                    <span className="form_error">{imageError || "\u200b"}</span>
                  </div>
                </div>
              </div>

              {/* Source Details Section */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                  <h2 className="text-lg font-oswald font-semibold">
                    Source Details
                  </h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4 space-y-4">
                  {/* Post URL */}
                  <div>
                    <label htmlFor="post_url" className="form_label">
                      Post URL
                    </label>
                    <input
                      type="url"
                      id="post_url"
                      name="post_url"
                      maxLength={500}
                      value={formData.post_url}
                      onChange={handleChange}
                      placeholder="Enter post URL"
                      data-error={!!postUrlError}
                      className="form_input"
                    />
                    <span className="form_error">
                      {postUrlError || "\u200b"}
                    </span>
                  </div>

                  {/* Post Date */}
                  <div>
                    <label htmlFor="fb_post_date" className="form_label">
                      Post Date
                    </label>
                    <input
                      type="date"
                      id="fb_post_date"
                      name="fb_post_date"
                      value={formData.fb_post_date}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]}
                      data-error={!!postDateError}
                      className="form_input"
                    />
                    <span className="form_error">
                      {postDateError || "\u200b"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <Link
                  href={
                    from === "admin"
                      ? "/dashboard?tab=manage&section=news"
                      : "/dashboard"
                  }
                  className="from_btn-cancel"
                  onClick={() => {
                    if (imagePreview && imagePreview.startsWith("blob:")) {
                      URL.revokeObjectURL(imagePreview);
                    }
                  }}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || isUnchanged}
                  className="form_btn-blue"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function EditNewsMedia() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <EditNewsMediaContent />
    </Suspense>
  );
}