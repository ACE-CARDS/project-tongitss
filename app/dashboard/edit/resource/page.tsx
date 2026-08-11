"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { useUser } from "@/components/context/userContext";
import BackButton from "@/components/ui/backButton";

interface ResourceItem {
  id: number;
  title: string;
  link: string;
  type: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

function EditResourceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("id");
  const from = searchParams.get("from");
  const supabase = createClient();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>("");
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    type: "",
    description: "",
  });

  const [initialFormData, setInitialFormData] = useState({
    title: "",
    link: "",
    type: "",
    description: "",
  });

  // Error states
  const [linkError, setLinkError] = useState("");
  const [titleError, setTitleError] = useState("");

  // User audit state
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Check if any changes were made
  const isUnchanged = useMemo(() => {
    const textIsSame = JSON.stringify(formData) === JSON.stringify(initialFormData);
    const imageIsSame = imagePreview === (initialImageUrl || "");
    return textIsSame && imageIsSame && !imageFile;
  }, [formData, initialFormData, imagePreview, initialImageUrl, imageFile]);

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

  useEffect(() => {
    if (resourceId) {
      fetchResourceData();
    } else {
      router.push("/dashboard");
    }
  }, [resourceId]);

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

  const fetchResourceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (error) throw error;

      if (data) {
        const fetchedFields = {
          title: data.title || "",
          link: data.link || "",
          type: data.type || "document",
          description: data.description || "",
        };

        setFormData(fetchedFields);
        setInitialFormData(fetchedFields);

        if (data.image_url) {
          setCurrentImageUrl(data.image_url);
          setInitialImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      } else {
        setError("Resource not found.");
      }
    } catch (err) {
      console.error("Error fetching resource:", err);
      setError("Failed to load resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors on change
    if (name === "title" && titleError) {
      setTitleError("");
    }
    if (name === "link" && linkError) {
      setLinkError("");
    }
  };

  const validateTitle = (): boolean => {
    const title = formData.title?.trim() || "";
    if (!title) {
      setTitleError("Title is required.");
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const checkDuplicateLink = async (url: string, currentId: string) => {
    if (!url || url === initialFormData.link) return true;

    const { data } = await supabase
      .from("downloads")
      .select("id")
      .eq("link", url)
      .neq("id", currentId)
      .maybeSingle();

    if (data) {
      setLinkError(
        "This link is already in use. Please provide a unique link.",
      );
      return false;
    }
    setLinkError("");
    return true;
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

  const deleteOldImage = async (oldImageUrl: string) => {
    const fileName = oldImageUrl.split("/").pop();
    if (fileName) {
      await supabase.storage.from("resource-image").remove([fileName]);
    }
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
      
      // Clean old preview
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview("");
    setImageFile(null);
    setCurrentImageUrl(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const logEditAudit = async (recordId: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    
    let changes = [];
    
    if (initialFormData.title !== formData.title) {
      changes.push(`Title changed from "${initialFormData.title}" to "${formData.title}"`);
    }
    if (initialFormData.link !== formData.link) {
      changes.push(`Link changed from "${initialFormData.link}" to "${formData.link}"`);
    }
    if (initialFormData.type !== formData.type) {
      changes.push(`Type changed from "${initialFormData.type}" to "${formData.type}"`);
    }
    if (initialFormData.description !== formData.description) {
      changes.push(`Description changed from "${initialFormData.description}" to "${formData.description}"`);
    }
    
    const imageIsSame = imagePreview === (initialImageUrl || "");
    if (!imageIsSame) {
      changes.push(`Image changed`);
    }

    const changesString = changes.join(", ");
    const detailedMessage = `Updated resource "${formData.title}": ${changesString}`;

    const logEntry = {
      action: "Update",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setLinkError("");
    setTitleError("");
    setImageError("");

    // Validate title
    if (!validateTitle()) {
      return;
    }

    // Validate URL format
    if (!validateUrl(formData.link)) {
      setSubmitError(
        "Please enter a valid URL.",
      );
      return;
    }

    setSaving(true);

    try {
      // Check duplicate link
      const isLinkUnique = await checkDuplicateLink(
        formData.link,
        resourceId!,
      );
      if (!isLinkUnique) {
        setSaving(false);
        return;
      }

      // Handle image
      let imageUrl = currentImageUrl;

      // If we have a new file
      if (imageFile) {
        if (initialImageUrl) {
          await deleteOldImage(initialImageUrl);
        }
        const newImageUrl = await uploadImage(imageFile);
        if (!newImageUrl) throw new Error("Failed to upload image.");
        imageUrl = newImageUrl;
      }
      // If image was removed
      else if (!imagePreview && initialImageUrl) {
        await deleteOldImage(initialImageUrl);
        imageUrl = null;
      }

      const { error } = await supabase
        .from("downloads")
        .update({
          title: formData.title,
          link: formData.link,
          type: formData.type,
          description: formData.description || null,
          image_url: imageUrl,
        })
        .eq("id", resourceId);

      if (error) throw error;

      await logEditAudit(resourceId!);

      router.push(
        from === "admin"
          ? "/dashboard/edit/success?type=resource&from=admin"
          : "/dashboard/edit/success?type=resource",
      );
      router.refresh();
    } catch (err) {
      console.error("Error updating resource:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update resource";
      setSubmitError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#475569] font-ubuntu-mono">
          You are not authorized to edit resources.
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
              Edit Resource
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="font-ubuntu-mono text-sm">{error}</p>
              <button
                onClick={() => fetchResourceData()}
                className="mt-2 px-4 py-1 bg-[#011638] text-white rounded hover:bg-[#1a2a4f] transition-colors font-ubuntu-mono text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {!error && (
            <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <p className="font-ubuntu-mono text-sm font-bold">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                  <h2 className="text-lg font-oswald font-semibold">Resource Information</h2>
                </div>

                <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4 space-y-4">
                  <div>
                    <label htmlFor="title" className="form_label">Title</label>
                    <input
                      type="text" id="title" name="title" maxLength={200}
                      value={formData.title} onChange={handleChange}
                      placeholder="Enter resource title"
                      data-error={!!titleError} className="form_input"
                    />
                    <span className="form_error">{titleError || "\u200b"}</span>
                  </div>

                  <div>
                    <label htmlFor="type" className="form_label">Type</label>
                    <select
                      id="type" name="type" value={formData.type} onChange={handleChange}
                      data-error={false} className="form_input"
                    >
                      <option value="" disabled className="text-[#94a3b8]">Select Resource Type</option>
                      {resourceTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="form_error">{"\u200b"}</span>
                  </div>

                  <div>
                    <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
                      <label htmlFor="description" className="form_label not_required">Description</label>
                      <span className="text-xs font-ubuntu-mono text-[#475569] select-none pt-0.5 text-right">
                        {1500 - formData.description.length} characters remaining
                      </span>
                    </div>
                    <textarea
                      id="description" name="description" rows={3} maxLength={1500}
                      value={formData.description} onChange={handleChange}
                      placeholder="Enter resource description"
                      data-error={false} className="form_input_area custom-scrollbar-blue"
                    />
                    <span className="form_error">{"\u200b"}</span>
                  </div>

                  <div>
                    <label className="form_label not_required">Image</label>
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#94a3b8] border-dashed rounded-lg hover:border-[#011638] transition-colors cursor-pointer"
                      onClick={() => {
                        const fileInput = document.getElementById("image-upload") as HTMLInputElement;
                        if (fileInput) fileInput.click();
                      }}
                    >
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="relative">
                            <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(); }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                            <div className="flex text-sm text-[#475569]">
                              <span className="rounded-md font-medium text-[#011638] hover:text-[#1a2a4f]">Click to upload</span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-[#475569]">JPEG, JPG, PNG, HEIC, HEIF up to 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                    <input id="image-upload" name="image" type="file" className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/heic,image/heif" onChange={handleImageChange} />
                    <span className="form_error">{imageError || "\u200b"}</span>
                  </div>

                  <div>
                    <label htmlFor="link" className="form_label">Link</label>
                    <input
                      type="url" id="link" name="link" maxLength={500}
                      value={formData.link} onChange={handleChange}
                      placeholder="Enter resource URL"
                      data-error={!!linkError} className="form_input"
                    />
                    <span className="form_error">{linkError || "\u200b"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  <Link
                    href={from === "admin" ? "/dashboard?tab=manage&section=resources" : "/dashboard"}
                    className="from_btn-cancel"
                  >
                    Cancel
                  </Link>
                  <button type="submit" disabled={saving || isUnchanged}
                    className={`form_btn-blue ${saving || isUnchanged ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default function EditResourcePage() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <EditResourceContent />
    </Suspense>
  );
}