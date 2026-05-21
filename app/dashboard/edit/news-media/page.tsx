"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { useUser } from "@/components/context/userContext";

// Types
interface NewsItem {
  id: number;
  title: string | null;
  content: string | null;
  image_url: string | null;
  post_url: string;
  fb_post_date: string;
  created_at: string;
}

// Main component
function EditNewsMediaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");
  const from = searchParams.get("from");
  const supabase = createClient();

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

  const [error, setError] = useState<string | null>(null);
  const [postUrlError, setPostUrlError] = useState("");
  const [titleContentError, setTitleContentError] = useState("");

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
      setError("Failed to load news article");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "title" || name === "content") {
      const title = name === "title" ? value : updatedFormData.title;
      const content = name === "content" ? value : updatedFormData.content;

      if (!title?.trim() && !content?.trim()) {
        setTitleContentError("Either Title or Content must be provided.");
      } else {
        setTitleContentError("");
      }
    }
  };

  const validateTitleContent = () => {
    const title = formData.title?.trim() || "";
    const content = formData.content?.trim() || "";
    if (!title && !content) {
      setTitleContentError("Either Title or Content must be provided.");
      return false;
    }
    setTitleContentError("");
    return true;
  };

  const checkDuplicatePostUrl = async (url: string, currentId: string) => {
    if (!url || url === initialFormData.post_url) return true;

    const { data } = await supabase
      .from("news_media")
      .select("id")
      .eq("post_url", url)
      .neq("id", currentId)
      .maybeSingle();

    if (data) {
      setPostUrlError(
        "This post URL is already in use. Please provide a unique URL.",
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
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and GIF images are allowed");
        return;
      }

      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setCurrentImageUrl(null);
    setImagePreview("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTitleContent()) return;

    setSaving(true);
    setError(null);

    try {
      const isUrlUnique = await checkDuplicatePostUrl(
        formData.post_url,
        newsId!,
      );
      if (!isUrlUnique) {
        setSaving(false);
        return;
      }

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
      // If image was removed (preview is empty) and we had an initial image
      else if (!imagePreview && initialImageUrl) {
        await deleteOldImage(initialImageUrl);
        imageUrl = null;
      }

      const { error } = await supabase
        .from("news_media")
        .update({
          title: formData.title || null,
          content: formData.content || null,
          image_url: imageUrl,
          post_url: formData.post_url,
          fb_post_date: formData.fb_post_date,
        })
        .eq("id", newsId);

      if (error) throw error;

      if (newsId) {
        await logEditAudit(newsId);
      }

      router.push(
        from === "admin"
          ? "/dashboard/edit/success?type=news-media&from=admin"
          : "/dashboard/edit/success?type=news-media",
      );
    } catch (err) {
      console.error("Error updating news:", err);
      setError("Failed to update news article");
    } finally {
      setSaving(false);
    }
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
      changes.push(`post date changed to ${formData.post_url}`);
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

    const detailedMessage = `Updated announcement "${formData.title}" (ID: ${recordId}). ${changes}`;

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

  if (loading) return <LoadingState />;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-6">
            <button
              onClick={() =>
                from === "admin"
                  ? router.push("/dashboard?tab=manage&section=news")
                  : router.back()
              }
              className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">
              Edit News Article
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">
                    Basic Information
                  </h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      maxLength={200}
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Description
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      rows={6}
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue"
                    />
                    {titleContentError && (
                      <span className="text-xs text-red-600 font-ubuntu-mono">
                        {titleContentError}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Image
                    </label>
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#94a3b8] border-dashed rounded-lg hover:border-[#011638] transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
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
                          <div className="text-sm text-[#475569]">
                            <p className="font-medium text-[#011638]">
                              Click to upload
                            </p>
                            <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">
                    Source Details
                  </h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Post URL <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="url"
                      name="post_url"
                      value={formData.post_url}
                      onChange={handleChange}
                      required
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    />
                    {postUrlError && (
                      <span className="text-xs text-red-600 font-ubuntu-mono">
                        {postUrlError}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Post Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      name="fb_post_date"
                      value={formData.fb_post_date}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split("T")[0]}
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                <Link
                  href={
                    from === "admin"
                      ? "/dashboard?tab=manage&section=news"
                      : "/dashboard"
                  }
                  className="px-4 py-2 text-[#011638] font-ubuntu-mono"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || isUnchanged}
                  className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function EditNewsMedia() {
  return (
    <Suspense fallback={<LoadingState />}>
      <EditNewsMediaContent />
    </Suspense>
  );
}
