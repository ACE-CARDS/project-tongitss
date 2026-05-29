"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const thesisId = searchParams.get("id");

  const [thesis, setThesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchThesis() {
      if (!thesisId) return;
      
      const { data, error } = await supabase
        .from("thesis")
        .select(`
          *,
          r_category (r_category_name),
          school (school_name),
          thesis_author (
            author (
              author_fname,
              author_minit,
              author_lname,
              author_email
            )
          )
        `)
        .eq("id", thesisId)
        .single();

      if (error) {
        console.error("Error fetching thesis:", error);
        setSubmitError("Failed to load thesis data.");
      } else {
        setThesis(data);
      }
      setLoading(false);
    }

    fetchThesis();
  }, [thesisId]);

  const validateRejectionReason = (reason: string): string | null => {
    if (!reason.trim()) {
      return "Rejection reason is required.";
    }
    if (reason.trim().length < 10) {
      return "Rejection reason must be at least 10 characters.";
    }
    if (reason.trim().length > 300) {
      return "Rejection reason must not exceed 300 characters.";
    }
    return null;
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from("thesis")
        .update({ 
          thesis_status: "accepted", 
          rejection_reason: null 
        })
        .eq("id", thesisId);

      if (error) throw error;
      router.push("/thesis/admin/review/success");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to approve thesis.");
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const errorMsg = validateRejectionReason(rejectionReason);
    if (errorMsg) {
      setRejectionError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from("thesis")
        .update({ 
          thesis_status: "rejected",
          rejection_reason: rejectionReason.trim() 
        })
        .eq("id", thesisId);

      if (error) throw error;
      router.push("/thesis/admin/review/success");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to reject thesis.");
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="min-h-[400px]"></div>
        </main>
      </div>
    </div>
  );
  
  if (!thesis) return <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8]">Thesis not found.</div>;

  const keywords = thesis.thesis_keyword 
    ? thesis.thesis_keyword.split(',').map((k: string) => k.trim()).filter((k: string) => k) 
    : [];

  return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div>
            <BackButton href="/dashboard?tab=thesis&page=1" />
            <div className="mt-5">
              <h1 className="text-3xl font-oswald font-bold text-[#011638]">
                Review Thesis
              </h1>
              <p className="text-[#475569] font-ubuntu-mono mt-2 break-words">
                Review "<span className="font-bold italic text-[#011638] break-words">{thesis.thesis_title}</span>" and decide whether to approve or reject it.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <div className="bg-[#fbfaf8] mt-4 rounded-lg shadow-xl border border-[#e0e7ff] p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Basic Information</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Thesis Title</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">{thesis.thesis_title}</div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Abstract</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 whitespace-pre-wrap break-words min-h-[100px]">{thesis.thesis_abstract}</div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? keywords.map((word: string, i: number) => (
                      <span key={i} className="bg-[#eef2ff] text-[#1e4db7] border border-[#1e4db7] px-2 py-1 rounded text-xs font-ubuntu-mono">{word}</span>
                    )) : <span className="text-gray-400 font-ubuntu-mono text-sm italic">No keywords</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Research Category</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">{thesis.r_category?.r_category_name || "Not specified"}</div>
                </div>
              </div>
            </div>

            {/* Author(s) & School */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Author(s) & School</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">School</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">{thesis.school?.school_name || "No School Listed"}</div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">Author(s)</label>
                  <div className="grid grid-cols-1 gap-3">
                    {thesis.thesis_author?.map((ta: any, index: number) => (
                      <div key={index} className="px-3 py-2 border border-[#94a3b8] rounded bg-white">
                        <p className="font-ubuntu-mono text-[#475569]">{ta.author?.author_fname} {ta.author?.author_minit && `${ta.author.author_minit}. `}{ta.author?.author_lname}</p>
                        <p className="text-xs text-[#1e4db7] font-ubuntu-mono">{ta.author?.author_email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

           {/* Thesis Details */}
            <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Thesis Details</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Publication Date</label>
                <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">{new Date(thesis.thesis_date).toLocaleDateString()}</div>
                </div>
                <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Physical Copy</label>
                <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                    {thesis.thesis_phys ? (
                    <span>{thesis.thesis_phys}</span>
                    ) : (
                    <span className="text-gray-400 italic">No physical copy available</span>
                    )}
                </div>
                </div>
                <div>
                <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Digital Copy Link</label>
                <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-all">
                    {thesis.thesis_digi ? (
                    <a href={thesis.thesis_digi} target="_blank" rel="noopener noreferrer" className="text-[#1e4db7] hover:underline">
                        {thesis.thesis_digi}
                    </a>
                    ) : (
                    <span className="text-gray-400 italic">No digital copy link provided</span>
                    )}
                </div>
                </div>
            </div>
            </div>

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="pt-4">
                <label className="block text-lg font-oswald font-medium text-[#011638] mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRejectionReason(value);
                    const error = validateRejectionReason(value);
                    setRejectionError(error || "");
                  }}
                  rows={4}
                  maxLength={300}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-white"
                  placeholder="Indicate why this thesis is being rejected..."
                />
                {rejectionError && (
                  <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                    {rejectionError}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
              {!showRejectForm ? (
                <>
                  <button 
                    onClick={() => setShowRejectForm(true)} 
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[#fbfaf8] bg-red-600 rounded-lg hover:bg-red-700 font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={handleApprove} 
                    disabled={isSubmitting} 
                    className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Approving..." : "Approve Thesis"}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                      setRejectionError("");
                    }} 
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[#011638] font-ubuntu-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReject} 
                    disabled={!!rejectionError || !rejectionReason.trim() || isSubmitting} 
                    className="px-4 py-2 text-[#fbfaf8] bg-red-600 rounded-lg hover:bg-red-700 font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Rejecting..." : "Reject Thesis"}
                  </button>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}