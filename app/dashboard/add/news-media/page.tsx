"use client";

import { useUser } from "@/components/context/userContext";
import Footer from "@/components/layout/footer";
import NavBar from "@/components/layout/navbar";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import FormActions from "@/components/ui/FormActions";
import SectionCard from "@/components/ui/wrapper/FormSectionWrapper";
import FormWrapper from "@/components/ui/wrapper/FormWrapper";

function AddNewsMediaContent() {
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
        <AddNewsMediaForm />
      </div>
      <Footer />
    </>
  );
}

export default function AddNewsMediaPage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You are not authorized to add news & media.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <AddNewsMediaContent />
    </Suspense>
  );
}

export function AddNewsMediaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const supabase = createClient();
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [title, setTitle] = useState("");
  const [desc, setDescription] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [fbPostDate, setFbPostDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [titleError, setTitleError] = useState("");
  const [descError, setDescError] = useState("");
  const [postUrlError, setPostUrlError] = useState("");
  const [dateError, setDateError] = useState("");
  const [imageError, setImageError] = useState("");

  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const noChange =
    title.trim() === "" &&
    desc.trim() === "" &&
    postUrl.trim() === "" &&
    fbPostDate === "" &&
    !imageFile;

  // Clean image preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
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

    if (user?.email) loadCurrentUser(user.email);
  }, [user?.email, supabase]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);

    if(imageError == "A Title, Description, or Image is required.") {
      setTitleError("");
      setDescError("");
      setImageError("");
    }

    if (value.trim().length < 2 && value.trim().length > 0) {
      setTitleError("Title is too short.");
    } else {
      setTitleError("");
    }
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);

    if(imageError == "A Title, Description, or Image is required.") {
      setTitleError("");
      setDescError("");
      setImageError("");
    }
    
    if (value.trim().length < 10 && value.trim().length > 0) {
      setDescError("Description is too short.");
    } else {
      setDescError("");
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-image")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from("news-image").getPublicUrl(filePath);
    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if(imageError == "A Title, Description, or Image is required.") {
      setTitleError("");
      setDescError("");
      setImageError("");
    }
    
    if (file) {

      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setImageError("Only JPEG, PNG, and GIF images are allowed");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setImageError("File size must be less than 10MB");
        return;
      }

      setImageError("");
      if (imagePreview) URL.revokeObjectURL(imagePreview);

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFbPostDate(value);
    if (value) setDateError("");
  }

  const validateUrlFormat = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const checkDuplicatePostUrl = async (url: string): Promise<boolean> => {
    if (!url.trim()) return false;
    const { data } = await supabase
      .from("news_media")
      .select("id")
      .eq("post_url", url)
      .maybeSingle();

    if (data) {
      setPostUrlError("This post URL is already in use. Please provide a unique URL.");
      return true;
    }
    setPostUrlError("");
    return false;
  };

  const handlePostURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPostUrl(value);
    if (validateUrlFormat(value)) {
      checkDuplicatePostUrl(value);
    } else if (value.trim().length > 0) {
      setPostUrlError("Please enter a valid URL (e.g., https://example.com).");
    } else if (value) setPostUrlError("");
  }

  const logCreateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const detailedMessage = `Created a new media titled "${itemTitle || "Untitled Reference"}"`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "news_media",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write audit log:", error);
  };

  const validateTitleDescImage = (title:string, desc:string, img: File) => {
    if (!title && !desc && !img) {
      return false;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setTitleError("");
    setDescError("");
    setImageError("");
    setPostUrlError("");
    setDateError("");

    let hasError = false;

    if (!title && !desc && !imageFile) {
      setTitleError(" ");
      setDescError(" ");
      setImageError("A Title, Description, or Image is required.");
      hasError = true;
    }

    if (!postUrl.trim()) {
      setPostUrlError("Post URL is required.");
      hasError = true;
    }

    if (!validateUrlFormat(postUrl)) {
      setPostUrlError("Please enter a valid URL (e.g., https://example.com).");
      hasError = true;
    }
    
    if (!fbPostDate) {
      setDateError("Post date is required.");
      hasError = true;
    }

    if(hasError) return;

    setIsSubmitting(true);

    try {
      const isDuplicate = await checkDuplicatePostUrl(postUrl);
      if (isDuplicate) throw new Error("Duplicate database entry match on URL.");


      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) throw new Error("Failed to upload image. Please try again.");
      }

      const payload = {
        title: title.trim() || null,
        desc: desc.trim() || null,
        image_url: imageUrl,
        post_url: postUrl.trim(),
        fb_post_date: fbPostDate,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from("news_media").insert(payload);
      if (insertError) throw new Error(insertError.message);

      await logCreateAudit(title);

      router.push("/dashboard/add/success?type=news-media");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelDestination = from === "admin" ? "/dashboard?tab=manage&section=news" : "/dashboard";

  return (
    <FormWrapper title="Add News & Media" backHref={cancelDestination}>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* SECTION 1: Basic Information */}
        <SectionCard title="Basic Information">
          {/* Title Field */}
          <div>
            <label className="form_label not_required">Title</label>
            <input
              type="text"
              value={title}
              maxLength={100}
              placeholder="Enter news title"
              data-error={!!titleError}
              className="form_input"
              onChange={handleTitleChange}
            />
            <span className="form_error">{titleError || "\u200b"}</span>
          </div>

          {/* Description Field */}
          <div>
            <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
              <label className="form_label not_required">Description</label>
              <span className="text-xs font-ubuntu-mono text-[#475569] select-none text-right">
                {1500 - desc.length} characters remaining
              </span>
            </div>
            <textarea
              value={desc}
              rows={5}
              maxLength={1500}
              data-error={!!descError}
              placeholder="Enter news content"
              className="form_input_area custom-scrollbar-blue"
              onChange={handleDescChange}
            />
            <span className="form_error">
              {descError || "\u200b"}
            </span>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="form_label not_required">Image File</label>
            <div
              className="form_input border-dashed border-2 min-h-[150px] justify-center items-center flex cursor-pointer"
              data-error={!!imageError}
              onClick={() => {document.getElementById("image-upload")?.click(); setImageError("");}}
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
                        if (imagePreview) URL.revokeObjectURL(imagePreview);
                        setImageFile(null);
                        setImagePreview("");
                        setImageError("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-[#475569]" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-[#475569] text-center justify-center">
                      <span className="rounded-md font-medium text-[#011638] hover:text-[#1a2a4f]">Click to upload</span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-[#475569]">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
            />
            <span className="form_error">
              {imageError || "\u200b"}
            </span>
          </div>
        </SectionCard>

        {/* SECTION 2: Source Details */}
        <SectionCard title="Source Details">
          {/* Post URL Field */}
          <div>
            <label className="form_label">
              Post URL
            </label>
            <input
              type="url"
              value={postUrl}
              maxLength={200}
              placeholder="Enter news link reference"
              className="form_input"
              data-error={!!postUrlError}
              onChange={handlePostURLChange}
            />
            <span className="form_error">
              {postUrlError || "\u200b"}
            </span>
          </div>

          {/* Post Date Field */}
          <div>
            <label className="form_label">
              Post Date
            </label>
            <input
              type="date"
              value={fbPostDate}
              max={new Date().toISOString().split("T")[0]}
              data-error={!!dateError}
              className="form_input"
              onChange={handleDateChange}
            />
            <span className="form_error">
              {dateError || "\u200b"}
            </span>
          </div>
        </SectionCard>

        <FormActions
          cancelHref={cancelDestination}
          isStatus={isSubmitting}
          noChange={noChange}
          variant="blue"
          submitLabel="Post News"
          submittingLabel="Posting..."
          onCancelClick={() => sessionStorage.removeItem("newsMediaDraft")}
        />
      </form>
    </FormWrapper>
  );
}