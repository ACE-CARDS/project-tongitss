"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from "next/link";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

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
export default function EditNewsMedia() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = searchParams.get('id');
  const from = searchParams.get('from');
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_url: '',
    fb_post_date: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [postUrlError, setPostUrlError] = useState("");
  const [titleContentError, setTitleContentError] = useState("");

  // with ID, fetch but without, redirect back to news-media page
  useEffect(() => {
    if (newsId) {
      fetchNewsData();
    } else {
      router.push('/dashboard/news-media');
    }
  }, [newsId]);

  // Fetch data
  const fetchNewsData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news_media') // table
        .select('*') // columns
        .eq('id', newsId)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          title: data.title || '',
          content: data.content || '',
          post_url: data.post_url || '',
          fb_post_date: data.fb_post_date ? new Date(data.fb_post_date).toISOString().split('T')[0] : '',
        });
        if (data.image_url) {
          setCurrentImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      }
    } catch (err) {
      // If error
      console.error('Error fetching news:', err);
      setError('Failed to load news article');
    } finally {
      setLoading(false);
    }
  };

  // Form validation 

  // on input change do validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const updatedFormData = { ...formData, [name]: value };
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate title/content on change
    if (name === 'title' || name === 'content') {
      const title = name === 'title' ? value : updatedFormData.title;
    const content = name === 'content' ? value : updatedFormData.content;
    
    if (!title?.trim() && !content?.trim()) {
      setTitleContentError("Either Title or Content must be provided.");
    } else {
      setTitleContentError("");
    }
  }
};

  // same validation as add news
  const validateTitleContent = () => {
    const title = formData.title?.trim() || "";
    const content = formData.content?.trim() || "";
    
    if (!title && !content) {
      setTitleContentError("Either Title or Content must be provided.");
      return false;
    } else {
      setTitleContentError("");
      return true;
    }
  };

  // Check for duplicate URL
  const checkDuplicatePostUrl = async (url: string, currentId: string) => {
    if (!url) return;
    
    const { data, error } = await supabase
      .from("news_media")
      .select("id")
      .eq("post_url", url)
      .neq("id", currentId)
      .maybeSingle();
    
    if (data) {
      setPostUrlError("This post URL is already in use. Please provide a unique URL.");
      return false;
    } else {
      setPostUrlError("");
      return true;
    }
  };

  // Image upload
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

  // Delete old image from storage
  const deleteOldImage = async (oldImageUrl: string) => {
    const fileName = oldImageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('news-image').remove([fileName]);
    }
  };

  // Handle image file selection and validation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File sizes
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      
      // Fle types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPEG, PNG, and GIF images are allowed");
        return;
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      const errorSpan = document.getElementById('image-error');
      if (errorSpan) errorSpan.style.display = 'none';
    }
  };

  // remove image, clear preview
  const removeImage = async () => {
    if (currentImageUrl) {
      await deleteOldImage(currentImageUrl);
    }
    setCurrentImageUrl(null);
    setImagePreview("");
    setImageFile(null);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate title/content
    if (!validateTitleContent()) {
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      // Duplicate post URL?
      const isUrlUnique = await checkDuplicatePostUrl(formData.post_url, newsId!);
      if (!isUrlUnique) {
        setSaving(false);
        return;
      }

      let imageUrl = currentImageUrl;
      
      // Upload new -> Delete old (if exists)
      if (imageFile) {
        if (currentImageUrl) {
          await deleteOldImage(currentImageUrl);
        }
        
        const newImageUrl = await uploadImage(imageFile);
        if (!newImageUrl) {
          throw new Error("Failed to upload image. Please try again.");
        }
        imageUrl = newImageUrl;
      }

      // Update database
      const { error } = await supabase
        .from('news_media')
        .update({
          title: formData.title || null,
          content: formData.content || null,
          image_url: imageUrl,
          post_url: formData.post_url,
          fb_post_date: formData.fb_post_date,
        })
        .eq('id', newsId);

      if (error) throw error;
      
      // Redirect to success page after editing
      if (from === 'admin') {
        router.push('/dashboard/edit/success?type=news-media&from=admin');
      } else {
        router.push('/dashboard/edit/success?type=news-media');
      }
    } catch (err) {
      console.error('Error updating news:', err);
      setError('Failed to update news article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: "20px 20px"
        }}
      >
        <NavBar/>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading news articles...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      <NavBar/>
      
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-6">
            <button
            onClick={() => {
              if (from === 'admin') {
                router.push('/dashboard?tab=manage&section=news');
              } else {
                router.back();
              }
            }}
            className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          >
            ← Back
          </button>
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">Edit News Article</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Information */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">Basic Information</h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={200}
                        placeholder="Enter news title"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      />
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Description
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={6}
                        maxLength={5000}
                        placeholder="Enter news description"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] resize-vertical"
                      />
                      {titleContentError && (
                        <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                          {titleContentError}
                        </span>
                      )}
                    </div>

                    {/* Image */}
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
                                  removeImage();
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

              {/* Facebook Details */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">Facebook Details</h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="post_url" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Post URL <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="url"
                        id="post_url"
                        name="post_url"
                        value={formData.post_url}
                        onChange={async (e) => {
                          handleChange(e);
                          if (e.target.value) {
                            await checkDuplicatePostUrl(e.target.value, newsId!);
                          } else {
                            setPostUrlError("");
                          }
                        }}
                        required
                        placeholder="https://facebook.com/..."
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      />
                      {postUrlError && (
                        <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                          {postUrlError}
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="fb_post_date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Post Date <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="date"
                        id="fb_post_date"
                        name="fb_post_date"
                        value={formData.fb_post_date}
                        onChange={handleChange}
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  disabled={saving}
                  className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
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