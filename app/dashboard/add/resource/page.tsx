"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import BackButton from "@/components/ui/backButton";

function AddResourceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const supabase = createClient();
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  // Form Field States
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Error states
  const [titleError, setTitleError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [imageError, setImageError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  // User audit state
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const formTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Fetch resource types from enum
  useEffect(() => {
    const fetchResourceTypes = async () => {
      try {
        const { data, error } = await supabase.rpc("get_resources_types");

        if (error) {
          console.error("RPC Error:", error);
          const { data: typeData, error: typeError } = await supabase
            .from("downloads")
            .select("type")
            .not("type", "is", null);

          if (typeError) throw typeError;

          const types = new Set<string>();
          typeData.forEach((item) => {
            if (item.type) {
              types.add(item.type);
            }
          });

          if (types.size === 0) {
            setResourceTypes([
              "document",
              "form",
              "guide",
              "merch",
              "module",
              "publication",
              "report",
              "other",
            ]);
          } else {
            const sortedTypes = Array.from(types).sort();
            const otherIndex = sortedTypes.indexOf("other");
            if (otherIndex !== -1) {
              sortedTypes.splice(otherIndex, 1);
              sortedTypes.push("other");
            }
            setResourceTypes(sortedTypes);
          }
        } else if (data && data.length > 0) {
          const sortedData = (data as string[]).sort();
          const otherIndex = sortedData.indexOf("other");
          if (otherIndex !== -1) {
            sortedData.splice(otherIndex, 1);
            sortedData.push("other");
          }
          setResourceTypes(sortedData);
        } else {
          setResourceTypes([
            "document",
            "form",
            "guide",
            "merch",
            "module",
            "publication",
            "report",
            "other",
          ]);
        }
      } catch (err) {
        console.error("Error fetching resource types:", err);
        setResourceTypes([
          "document",
          "form",
          "guide",
          "merch",
          "module",
          "publication",
          "report",
          "other",
        ]);
      }
    };

    fetchResourceTypes();
  }, [supabase]);

  // Load current user for audit
  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  // Cleanup Preview URL
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

  const validateUrl = (urlStr: string): boolean => {
    try {
      new URL(urlStr);
      return true;
    } catch {
      return false;
    }
  };

  const checkDuplicateLink = async (urlStr: string): Promise<boolean> => {
    if (!urlStr) return false;

    const { data } = await supabase
      .from("downloads")
      .select("id")
      .eq("link", urlStr)
      .maybeSingle();

    if (data) {
      setLinkError("This link is already in use. Please provide a unique link.");
      return true;
    } else {
      setLinkError("");
      return false;
    }
  };

  const validateTitle = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setTitleError("Title is required.");
      return false;
    } else {
      setTitleError("");
      return true;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resource-image")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resource-image").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File size limit: 5MB
      if (file.size > 5 * 1024 * 1024) {
        setImageError("File size must be less than 5MB.");
        return;
      }

      // File types
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/heic",
        "image/heif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setImageError("Only JPEG, JPG, PNG, HEIC, and HEIF images are allowed.");
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
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const logCreateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Created a new resource titled "${itemTitle}"`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "downloads",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setLinkError("");
    setTitleError("");
    setTypeError("");
    setDescriptionError("");

    let validationFailed = false;

    // Validate Title
    if (!validateTitle(title)) {
      validationFailed = true;
    }

    // Validate Type
    if (!type) {
      setTypeError("Please select a resource type.");
      validationFailed = true;
    }

    // Validate Link
    const trimmedLink = link.trim();
    if (!trimmedLink) {
      setLinkError("Resource link is required.");
      validationFailed = true;
    } else if (!validateUrl(trimmedLink)) {
      setLinkError("Please enter a valid URL.");
      validationFailed = true;
    }

    if (validationFailed) {
      formTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const isDuplicate = await checkDuplicateLink(trimmedLink);
      if (isDuplicate) {
        throw new Error("This link is already in use. Please provide a unique link.");
      }

      // Upload image
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      const payload = {
        title: trimmedTitle,
        link: trimmedLink,
        type: type,
        description: trimmedDescription || null,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("downloads")
        .insert(payload);

      if (insertError) {
        console.error("Supabase Error Details:", insertError);
        throw new Error(insertError.message);
      }

      await logCreateAudit(trimmedTitle);

      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      router.push("/dashboard/add/success?type=resource");
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
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#475569] font-ubuntu-mono">
          You are not authorized to add resources.
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
                  ? "/dashboard?tab=manage&section=resources"
                  : "/dashboard"
              }
              className="!mb-0"
            />
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">
              Add Resource
            </h1>
          </div>

          <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-ubuntu-mono text-sm font-bold">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                <h2 className="text-lg font-oswald font-semibold">
                  Resource Information
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
                    maxLength={200}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      validateTitle(e.target.value);
                    }}
                    placeholder="Enter resource title"
                    data-error={!!titleError}
                    className="form_input"
                  />
                  <span className="form_error">{titleError || "\u200b"}</span>
                </div>

                {/* Type */}
                <div>
                  <label htmlFor="type" className="form_label">
                    Type
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      if (e.target.value) setTypeError("");
                    }}
                    data-error={!!typeError}
                    className="form_input"
                  >
                    <option value="" disabled className="text-[#94a3b8]">
                      Select Resource Type
                    </option>
                    {resourceTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                  <span className="form_error">{typeError || "\u200b"}</span>
                </div>

                {/* Description */}
                <div>
                  <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
                    <label htmlFor="description" className="form_label not_required">
                      Description
                    </label>
                    <span className="text-xs font-ubuntu-mono text-[#475569] select-none pt-0.5 text-right">
                      {1500 - description.length} characters remaining
                    </span>
                  </div>
                  <textarea
                    id="description"
                    rows={3}
                    maxLength={1500}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    placeholder="Enter resource description"
                    data-error={!!descriptionError}
                    className="form_input_area custom-scrollbar-blue"
                  />
                  <span className="form_error">
                    {descriptionError || "\u200b"}
                  </span>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="form_label not_required">Image</label>
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
                            JPEG, JPG, PNG, HEIC, HEIF up to 5MB
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
                    accept="image/jpeg,image/jpg,image/png,image/heic,image/heif"
                    onChange={handleImageChange}
                  />
                  <span className="form_error">{imageError || "\u200b"}</span>
                </div>

                {/* Link */}
                <div>
                  <label htmlFor="link" className="form_label">
                    Link
                  </label>
                  <input
                    type="url"
                    id="link"
                    maxLength={500}
                    value={link}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLink(val);

                      if (!val.trim()) {
                        setLinkError("Link is required.");
                      } else if (!validateUrl(val)) {
                        setLinkError("Please enter a valid URL.");
                      } else {
                        setLinkError("");
                        checkDuplicateLink(val);
                      }
                    }}
                    placeholder="Enter resource URL"
                    data-error={!!linkError}
                    className="form_input"
                  />
                  <span className="form_error">{linkError || "\u200b"}</span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <Link
                  href={
                    from === "admin"
                      ? "/dashboard?tab=manage&section=resources"
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
                  disabled={isSubmitting}
                  className="form_btn-blue"
                >
                  {isSubmitting ? "Adding..." : "Add Resource"}
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

export default function AddResourcePage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <AddResourceContent />
    </Suspense>
  );
}