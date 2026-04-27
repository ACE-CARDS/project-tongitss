"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AddNewsMediaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Other Needs
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [postUrlError, setPostUrlError] = useState("");
  const [titleContentError, setTitleContentError] = useState("");

  // For form fields
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const postUrlRef = useRef<HTMLInputElement>(null);
  const fbPostDateRef = useRef<HTMLInputElement>(null);
  const titleContentErrorRef = useRef<HTMLDivElement>(null);

  // Load draft from session storage (same as Announcement Form)
  useEffect(() => {
    const savedDraft = sessionStorage.getItem("newsMediaDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        
        if (titleRef.current) titleRef.current.value = draft.title || "";
        if (contentRef.current) contentRef.current.value = draft.content || "";
        if (postUrlRef.current) postUrlRef.current.value = draft.post_url || "";
        if (fbPostDateRef.current) fbPostDateRef.current.value = draft.fb_post_date || "";
        
        // Trigger validation
        if (titleRef.current || contentRef.current) {
          validateTitleContent();
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, []);

  // Clean image preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const saveDraft = () => {
    const draft = {
      title: titleRef.current?.value || "",
      content: contentRef.current?.value || "",
      post_url: postUrlRef.current?.value || "",
      fb_post_date: fbPostDateRef.current?.value || "",
    };
    sessionStorage.setItem("newsMediaDraft", JSON.stringify(draft));
  };

  // Check if link is duplicated
  const checkDuplicatePostUrl = async (url: string): Promise<boolean> => {
    if (!url) return false;
    
    const { data, error } = await supabase
      .from("news_media")
      .select("id")
      .eq("post_url", url)
      .maybeSingle();
    
    if (data) {
      setPostUrlError("This post URL is already in use. Please provide a unique URL.");
      return true;
    } else {
      setPostUrlError("");
      return false;
    }
  };

  // Check Title and Content (1 must be filled out)
  const validateTitleContent = (): boolean => {
    const title = titleRef.current?.value?.trim() || "";
    const content = contentRef.current?.value?.trim() || "";
    
    if (!title && !content) {
      setTitleContentError("Either Title or Content must be provided.");
      setTimeout(() => {
      titleContentErrorRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
      return false;
    } else {
      setTitleContentError("");
      return true;
    }
  };

  // Validate URL format
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('news-image')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('news-image')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File sizes (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      
      // File types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and GIF images are allowed");
        return;
      }
      
      // Clean old preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      const errorSpan = document.getElementById('image-error');
      if (errorSpan) errorSpan.style.display = 'none';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(""); 
    
    // Validate title/content
    if (!validateTitleContent()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      const title = titleRef.current?.value?.trim() || "";
      const content = contentRef.current?.value?.trim() || "";
      const postUrl = postUrlRef.current?.value?.trim();
      const fbPostDate = fbPostDateRef.current?.value;

      // Validate post URL
      if (!postUrl) {
        throw new Error("Post URL is required.");
      }

      // Validate URL format
      if (!validateUrl(postUrl)) {
        throw new Error("Please enter a valid URL (e.g., https://example.com).");
      }

      // Check duplicate post URL
      const isDuplicate = await checkDuplicatePostUrl(postUrl);
      if (isDuplicate) {
        throw new Error("This post URL is already in use. Please provide a unique URL.");
      }

      // Validate date
      if (!fbPostDate) {
        throw new Error("Post date is required.");
      }

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      const payload = {
        title: title || null,
        content: content || null,
        image_url: imageUrl,
        post_url: postUrl,
        fb_post_date: fbPostDate,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from("news_media").insert(payload);

      if (insertError) {
        console.error("Supabase Error Details:", insertError);
        throw new Error(insertError.message);
      }

      // Clear draft on success
      sessionStorage.removeItem("newsMediaDraft");

      // Redirect
      if (from === 'admin') {
        router.push('/dashboard?tab=manage&section=news');
      } else {
        router.push("/dashboard/add/success?type=news-media");
      }
      router.refresh();
      
    } catch (err) {
      // Handle error
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href={from === 'admin' ? '/dashboard?tab=manage&section=news' : '/dashboard'}
          className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          onClick={() => sessionStorage.removeItem("newsMediaDraft")}
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Add News & Media</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
        <form onSubmit={handleSubmit} onChange={saveDraft} className="space-y-6">

          {/* Submit error display */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="font-ubuntu-mono text-sm">{submitError}</p>
            </div>
          )}

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">News Details</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-oswald font-medium text-[#011638] mb-1">Title</label>
                  <input
                    type="text"
                    id="title"
                    ref={titleRef}
                    maxLength={100}
                    placeholder="Enter news title"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={() => validateTitleContent()}
                  />
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-oswald font-medium text-[#011638] mb-1">Content</label>
                  <textarea
                    id="content"
                    ref={contentRef}
                    rows={5}
                    maxLength={1500}
                    placeholder="Enter news content"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={() => validateTitleContent()}
                  />
                  <div ref={titleContentErrorRef}>
                  {titleContentError && (
                    <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                      {titleContentError}
                    </span>
                  )}
                </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Image</label>
                  <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[#94a3b8] border-dashed rounded-lg hover:border-[#011638] transition-colors cursor-pointer"
                    onClick={() => {
                      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
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
                              if (imagePreview) URL.revokeObjectURL(imagePreview);
                              setImageFile(null);
                              setImagePreview("");
                              const errorSpan = document.getElementById('image-error');
                              if (errorSpan) errorSpan.style.display = 'none';
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                            PNG, JPG, GIF up to 10MB
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
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                  />
                  <span id="image-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Source Information</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
              <div className="space-y-4">

                {/* Post URL */}
                <div>
                  <label htmlFor="post_url" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Post URL <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="url"
                    id="post_url"
                    ref={postUrlRef}
                    required
                    maxLength={200}
                    placeholder="Enter news link"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={async (e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('post-url-error');
                      
                      if (input.value.length === 0) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Post URL is required.';
                          errorSpan.style.display = 'block';
                        }
                        setPostUrlError("");
                      } else if (!validateUrl(input.value)) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Please enter a valid URL.';
                          errorSpan.style.display = 'block';
                        }
                        setPostUrlError("");
                      } else {
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                        await checkDuplicatePostUrl(input.value);
                      }
                    }}
                  />
                  <span id="post-url-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                  {postUrlError && (
                    <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                      {postUrlError}
                    </span>
                  )}
                </div>

                {/* Post Date */}
                <div>
                  <label htmlFor="fb_post_date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Post Date <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="date"
                    id="fb_post_date"
                    ref={fbPostDateRef}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('post-date-error');
                      
                      if (!input.value) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Post date is required.';
                          errorSpan.style.display = 'block';
                        }
                      } else {
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                      }
                    }}
                  />
                  <span id="post-date-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
            <Link
              href={from === 'admin' ? '/dashboard?tab=manage&section=news' : '/dashboard'}
              className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
              onClick={() => sessionStorage.removeItem("newsMediaDraft")}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Posting..." : "Post News"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}