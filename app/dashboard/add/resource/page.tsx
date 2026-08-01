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
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  // Form refs
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  
  // Error states
  const [linkError, setLinkError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [imageError, setImageError] = useState("");
  
  // User audit state
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

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
        const { data, error } = await supabase
          .rpc('get_resources_types');
        
        if (error) {
          console.error("RPC Error:", error);
          const { data: typeData, error: typeError } = await supabase
            .from("downloads")
            .select("type")
            .not("type", "is", null);
          
          if (typeError) throw typeError;
          
          const types = new Set<string>();
          typeData.forEach(item => {
            if (item.type) {
              types.add(item.type);
            }
          });
          
          if (types.size === 0) {
            setResourceTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
          } else {
            const sortedTypes = Array.from(types).sort();
            const otherIndex = sortedTypes.indexOf('other');
            if (otherIndex !== -1) {
              sortedTypes.splice(otherIndex, 1);
              sortedTypes.push('other');
            }
            setResourceTypes(sortedTypes);
          }
        } else if (data && data.length > 0) {
          const sortedData = data.sort();
          const otherIndex = sortedData.indexOf('other');
          if (otherIndex !== -1) {
            sortedData.splice(otherIndex, 1);
            sortedData.push('other');
          }
          setResourceTypes(sortedData);
        } else {
          // Fallbacks
          setResourceTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
        }
      } catch (err) {
        console.error("Error fetching resource types:", err);
        setResourceTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
      }
    };
    
    fetchResourceTypes();
  }, []);

  // Load current user for audit
  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  // Load draft
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("resourceDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (titleRef.current) titleRef.current.value = draft.title || "";
        if (linkRef.current) linkRef.current.value = draft.link || "";
        if (descriptionRef.current) descriptionRef.current.value = draft.description || "";
        if (typeRef.current && draft.type) {
          const options = Array.from(typeRef.current.options);
          const hasType = options.some(opt => opt.value === draft.type);
          if (hasType) {
            typeRef.current.value = draft.type;
          }
        }
        if (draft.imagePreview) {
          setImagePreview(draft.imagePreview);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, [resourceTypes]);

  // Preview URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
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

  const saveDraft = () => {
    const draft = {
      title: titleRef.current?.value || "",
      link: linkRef.current?.value || "",
      type: typeRef.current?.value || "",
      description: descriptionRef.current?.value || "",
      imagePreview: imagePreview || "",
    };
    sessionStorage.setItem("resourceDraft", JSON.stringify(draft));
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const checkDuplicateLink = async (url: string): Promise<boolean> => {
    if (!url) return false;

    const { data, error } = await supabase
      .from("downloads")
      .select("id")
      .eq("link", url)
      .maybeSingle();

    if (data) {
      setLinkError(
        "This link is already in use. Please provide a unique link.",
      );
      return true;
    } else {
      setLinkError("");
      return false;
    }
  };

  const validateTitle = (): boolean => {
    const title = titleRef.current?.value?.trim() || "";
    if (!title) {
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
        setImageError("File size must be less than 5MB");
        return;
      }

      // File types
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"];
      if (!allowedTypes.includes(file.type)) {
        setImageError("Only JPEG, JPG, PNG, HEIC, and HEIF images are allowed");
        return;
      }

      setImageError("");
      
      // Preview
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      saveDraft();
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    saveDraft();
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

    // Validate title
    if (!validateTitle()) {
      return;
    }

    // Validate type
    if (!typeRef.current?.value) {
      setSubmitError("Please select a resource type.");
      return;
    }

    setIsSubmitting(true);

    try {
      const title = titleRef.current?.value?.trim() || "";
      const link = linkRef.current?.value?.trim();
      const type = typeRef.current?.value;
      const description = descriptionRef.current?.value?.trim() || "";

      // Validate link
      if (!link) {
        throw new Error("Resource link is required.");
      }

      // Validate URL format
      if (!validateUrl(link)) {
        throw new Error(
          "Please enter a valid URL.",
        );
      }

      // Check duplicate link
      const isDuplicate = await checkDuplicateLink(link);
      if (isDuplicate) {
        throw new Error(
          "This link is already in use. Please provide a unique link.",
        );
      }

      // Upload image
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      const payload = {
        title: title,
        link: link,
        type: type,
        description: description || null,
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

      await logCreateAudit(title);

      // Clear draft on success
      sessionStorage.removeItem("resourceDraft");
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      // Redirect
      router.push("/dashboard/add/success?type=resource");
      router.refresh();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      console.error("Submission error:", err);
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
          <div className="flex flex-col mb-6 gap-4">
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
            <form
              onSubmit={handleSubmit}
              onChange={saveDraft}
              className="space-y-6"
            >
              {/* Submit error display */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  <p className="font-ubuntu-mono text-sm">{submitError}</p>
                </div>
              )}

              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                  <h2 className="text-lg font-oswald font-semibold">
                    Resource Information
                  </h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-oswald font-medium text-[#011638] mb-1"
                      >
                        Title <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        ref={titleRef}
                        maxLength={200}
                        placeholder="Enter resource title"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onInput={() => validateTitle()}
                      />
                      {titleError && (
                        <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                          {titleError}
                        </span>
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-oswald font-medium text-[#011638] mb-1"
                      >
                        Type <span className="text-[#eec643]">*</span>
                      </label>
                      <select
                        id="type"
                        ref={typeRef}
                        defaultValue=""
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      >
                        <option value="" disabled className="text-[#94a3b8]">
                          Select Resource Type
                        </option>
                        {resourceTypes.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-oswald font-medium text-[#011638] mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        ref={descriptionRef}
                        rows={3}
                        maxLength={1500}
                        placeholder="Enter resource description"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Image
                      </label>
                      <div
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#94a3b8] border-dashed rounded-lg hover:border-[#011638] transition-colors cursor-pointer"
                        onClick={() => {
                          const fileInput = document.getElementById(
                            "image-upload",
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
                                JPEG, JPG, PNG, HEIC, HEIF up to 2MB
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
                      {imageError && (
                        <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                          {imageError}
                        </span>
                      )}
                    </div>

                    {/* Link */}
                    <div>
                      <label
                        htmlFor="link"
                        className="block text-sm font-oswald font-medium text-[#011638] mb-1"
                      >
                        Link <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="url"
                        id="link"
                        ref={linkRef}
                        required
                        maxLength={500}
                        placeholder="Enter resource URL"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onInput={async (e) => {
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById("link-error");

                          if (input.value.length === 0) {
                            if (errorSpan) {
                              errorSpan.textContent = "Link is required.";
                              errorSpan.style.display = "block";
                            }
                            setLinkError("");
                          } else if (!validateUrl(input.value)) {
                            if (errorSpan) {
                              errorSpan.textContent = "Please enter a valid URL.";
                              errorSpan.style.display = "block";
                            }
                            setLinkError("");
                          } else {
                            if (errorSpan) {
                              errorSpan.style.display = "none";
                            }
                            await checkDuplicateLink(input.value);
                          }
                        }}
                      />
                      <span
                        id="link-error"
                        className="text-xs mt-1 block font-ubuntu-mono text-red-600"
                      ></span>
                      {linkError && (
                        <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                          {linkError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                <Link
                  href={
                    from === "admin"
                      ? "/dashboard?tab=manage&section=resources"
                      : "/dashboard"
                  }
                  className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
                  onClick={() => {
                    sessionStorage.removeItem("resourceDraft");
                    if (imagePreview && imagePreview.startsWith('blob:')) {
                      URL.revokeObjectURL(imagePreview);
                    }
                  }}
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Adding..." : "Add Resource"}
                </button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
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