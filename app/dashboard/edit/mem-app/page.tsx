"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const getEmbedUrl = (url: string) => {
  if (!url) return null;
  try {
    if (url.includes("watch?v=")) return `https://www.youtube.com/embed/${url.split("watch?v=")[1].split("&")[0]}`;
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
    return url;
  } catch { return null; }
};

function EditMemAppForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const id = searchParams.get("id");
  
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState({
    type: "instruction",
    description: "",
    order_index: "" as string | number, 
  });

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setIsFetching(true);
    const { data, error } = await supabase.from("announce_memapp").select("*").eq("id", id).single();
    if (data && !error) {
      setFormData({ type: data.type, description: data.description, order_index: data.order_index || 1 });
    } else {
      alert("Item not found");
      router.push("/dashboard?tab=manage&section=memapp");
    }
    setIsFetching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalSequence = formData.type === 'video' ? 1 : parseInt(String(formData.order_index), 10);

    if (isNaN(finalSequence) || finalSequence < 1) {
      alert("Please enter a valid sequence number (1 or greater).");
      setLoading(false);
      return;
    }

    if (formData.type === 'instruction' || formData.type === 'reminder') {
      const { data: otherItems } = await supabase
        .from("announce_memapp")
        .select("*")
        .eq("type", formData.type)
        .neq("id", id)
        .order("order_index", { ascending: true });

      let itemsList = otherItems || [];

      if (finalSequence > itemsList.length + 1) {
        finalSequence = itemsList.length + 1;
      }

      itemsList.splice(finalSequence - 1, 0, { id: 'current', type: formData.type, description: '', order_index: 0, created_at: '' });

      for (let i = 0; i < itemsList.length; i++) {
        const expectedIndex = i + 1;
        if (itemsList[i].id !== 'current' && itemsList[i].order_index !== expectedIndex) {
          await supabase.from("announce_memapp").update({ order_index: expectedIndex }).eq("id", itemsList[i].id);
        }
      }
    }

    const submitData = {
      type: formData.type,
      description: formData.description,
      order_index: finalSequence
    };

    const { error } = await supabase.from("announce_memapp").update(submitData).eq("id", id);
    if (error) {
      alert("Error updating item: " + error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push("/dashboard?tab=manage&section=memapp");
    }
  };

  if (isFetching) return <div className="text-center py-20 font-ubuntu-mono text-[#475569] animate-pulse">Loading editor...</div>;

  const embedUrl = formData.type === 'video' ? getEmbedUrl(formData.description) : null;

  return (
    <div className="w-full max-w-3xl mx-auto py-10 px-6">
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center gap-2 text-[#475569] hover:text-[#011638] font-ubuntu-mono transition-colors"
      >
        <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-[#fbfaf8] rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-[#011638] px-6 py-4">
          <h1 className="text-xl font-oswald font-bold text-[#fbfaf8] uppercase tracking-wide">Edit Content</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
            <div className={formData.type === 'video' ? "sm:col-span-2 min-w-0" : "min-w-0"}>
              <label className="block text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-2">Content Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
                disabled={formData.type === 'deadline'}
              >
                <option value="instruction">Instruction</option>
                <option value="reminder">Reminder</option>
                <option value="video">Video URL</option>
              </select>
            </div>

            {formData.type !== 'video' && (
              <div className="min-w-0">
                <label className="block text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-2">Sequence Order</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                  className="w-full px-4 py-2 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
                  required
                />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-2">
              {formData.type === 'video' ? 'YouTube URL' : 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={formData.type === 'video' ? 2 : 5}
              className="w-full px-4 py-2 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono resize-y break-all whitespace-pre-wrap"
              required
            />
          </div>

          {/* VIDEO PREVIEW PANEL */}
          {formData.type === 'video' && formData.description && (
            <div className="mt-2 p-4 bg-gray-100 rounded-lg border border-gray-200">
              <h3 className="text-sm font-oswald font-bold text-[#011638] uppercase tracking-widest mb-3">Preview</h3>
              {embedUrl ? (
                <iframe src={embedUrl} className="w-full aspect-video rounded-lg shadow-sm border-0" allowFullScreen></iframe>
              ) : (
                <p className="text-sm text-red-500 font-ubuntu-mono">Invalid YouTube URL</p>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => router.back()} 
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
  );
}

export default function EditMemApp() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-ubuntu-mono text-[#475569] animate-pulse">Loading editor...</div>}>
      <EditMemAppForm />
    </Suspense>
  );
}