"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import BackButton from "@/components/backButton";

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch survey data based on ID in URL
  useEffect(() => {
    async function fetchSurvey() {
      if (!surveyId) return;
      
      const { data, error } = await supabase
        .from("survey")
        .select(`
          *,
          r_category (r_category_name),
          school (school_name),
          survey_author (
            author (author_fname, author_minit, author_lname, author_email)
          )
        `)
        .eq("id", surveyId)
        .single();

      if (error) {
        console.error("Error fetching survey:", error);
        setSubmitError("Failed to load survey data.");
      } else {
        setSurvey(data);
      }
      setLoading(false);
    }

    fetchSurvey();
  }, [surveyId]);

  const isPastDate = survey ? new Date(survey.survey_end) < new Date() : false;

  // validate rejection reason in real-time
  const validateRejectionReasonInput = (value: string): string => {
    if (!value.trim()) {
      return "Rejection reason is required.";
    }
    if (value.trim().length < 10) {
      return "Rejection reason must be at least 10 characters.";
    }
    if (value.trim().length > 500) {
      return "Rejection reason must not exceed 500 characters.";
    }
    return "";
  };

  // handle rejection reason change
  const handleRejectionReasonChange = (value: string) => {
    setRejectionReason(value);
    const error = validateRejectionReasonInput(value);
    setRejectionError(error);
  };

  // validate rejection reason
const validateRejectionReason = (): boolean => {
    const rejectionReasonInput = document.querySelector('textarea') as HTMLTextAreaElement;
    const errorSpan = document.getElementById('rejection-reason-error');
    
    if (!rejectionReasonInput?.value.trim()) {
      if (errorSpan) {
        errorSpan.textContent = 'Rejection reason is required.';
        errorSpan.style.display = 'block';
      }
      return false;
    }
    if (rejectionReasonInput.value.trim().length < 10) {
      if (errorSpan) {
        errorSpan.textContent = 'Rejection reason must be at least 10 characters.';
        errorSpan.style.display = 'block';
      }
      return false;
    }
    if (rejectionReasonInput.value.trim().length > 500) {
      if (errorSpan) {
        errorSpan.textContent = 'Rejection reason must not exceed 500 characters.';
        errorSpan.style.display = 'block';
      }
      return false;
    }
  return true;
};

  const handleApprove = async () => {
    if (isPastDate) {
      setSubmitError("Cannot approve a survey that has already reached its end date.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from("survey")
        .update({ 
          survey_status: "accepted", // Matching the "accepted" label from your Modal
          rejection_reason: null 
        })
        .eq("id", surveyId);

      if (error) throw error;
      router.push("/dashboard?tab=survey&page=1");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to approve survey.");
      setIsSubmitting(false);
    }
  };

const handleReject = async () => {
    const errorMsg = validateRejection(rejectionReason);
    if (errorMsg) {
      setRejectionError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase
        .from("survey")
        .update({ 
          survey_status: "rejected",
          rejection_reason: rejectionReason.trim() 
        })
        .eq("id", surveyId);

      if (error) throw error;
      router.push("/dashboard?tab=survey&page=1");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to reject survey.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8]">Loading...</div>;
  if (!survey) return <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8]">Survey not found.</div>;

  const keywords = survey.survey_keyword 
    ? survey.survey_keyword.split(',').map((k: string) => k.trim()).filter((k: string) => k) 
    : [];

  return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <BackButton href="/dashboard?tab=survey&page=1" />

          <div className="bg-[#fbfaf8] mt-4 rounded-lg shadow-xl border border-[#e0e7ff] p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Basic Information</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Survey Title</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">{survey.survey_title}</div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Description</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 whitespace-pre-wrap break-words min-h-[100px]">{survey.survey_desc}</div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? keywords.map((word: string, i: number) => (
                      <span key={i} className="bg-[#eef2ff] text-[#1e4db7] border border-[#1e4db7] px-2 py-1 rounded text-xs font-ubuntu-mono">{word}</span>
                    )) : <span className="text-gray-400 font-ubuntu-mono text-sm italic">No keywords</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Author Section */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Author(s) & School</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">School</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">{survey.school?.school_name || "No School Listed"}</div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">Author(s)</label>
                  <div className="grid grid-cols-1 gap-3">
                    {survey.survey_author?.map((sa: any, index: number) => (
                      <div key={index} className="px-3 py-2 border border-[#94a3b8] rounded bg-white">
                        <p className="font-ubuntu-mono text-[#475569]">{sa.author?.author_fname} {sa.author?.author_lname}</p>
                        <p className="text-xs text-[#1e4db7] font-ubuntu-mono">{sa.author?.author_email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Survey Details</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Start Date</label>
                    <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">{new Date(survey.survey_start).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">End Date</label>
                    <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">{new Date(survey.survey_end).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Survey Link</label>
                  <div className="text-[#1e4db7] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 truncate">
                    <a href={survey.survey_link} target="_blank" rel="noopener noreferrer" className="hover:underline">{survey.survey_link}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Form */}
            {showRejectForm && (
              <>
              <div className="pt-4">
                <label className="block text-lg font-oswald font-medium text-[#011638] mb-1">Reason for Rejection <span className="text-red-500">*</span></label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  maxLength={100}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-white"
                  placeholder="Indicate why this survey is being rejected..."
                  onInput={(e) => {
                    const input = e.target as HTMLTextAreaElement;
                    const errorSpan = document.getElementById('rejection-reason-error');
                    if (input.value.length === 0) {
                      errorSpan!.textContent = 'Rejection reason is required.';
                      errorSpan!.style.display = 'block';
                    } else if (input.value.length < 10) {
                      errorSpan!.textContent = 'Rejection reason must be at least 10 characters.';
                      errorSpan!.style.display = 'block';
                    } else {
                      errorSpan!.style.display = 'none';
                    }
                  }}
                />
              </div>
                <span id="rejection-reason-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
              {!showRejectForm ? (
                <>
                  <button onClick={() => setShowRejectForm(true)} className="px-4 py-2 text-[#fbfaf8] bg-red-600 rounded-lg hover:bg-red-700 font-oswald">Reject</button>
                  <button onClick={handleApprove} disabled={isSubmitting} className="px-4 py-2 text-[#fbfaf8] bg-green-600 rounded-lg hover:bg-green-700 font-oswald disabled:opacity-50">Approve Survey</button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowRejectForm(false)} className="px-4 py-2 text-[#011638] font-ubuntu-mono">Cancel</button>
                  <button onClick={handleReject} disabled={!rejectionReason.trim() || isSubmitting} className="px-6 py-2 text-[#fbfaf8] rounded bg-red-600 hover:bg-red-700 font-oswald font-bold disabled:opacity-50">CONFIRM REJECTION</button>
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