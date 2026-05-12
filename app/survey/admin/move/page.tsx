"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";

function MoveSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
            author (
              author_fname,
              author_minit,
              author_lname,
              author_email
            )
          )
        `)
        .eq("id", surveyId)
        .single();

      if (error) {
        console.error("Error fetching survey:", error);
        setSubmitError("Failed to load survey data.");
      } else {
        setSurvey(data);
        setSelectedStatus(data.survey_status);
        setRejectionReason(data.rejection_reason || "");
      }
      setLoading(false);
    }

    fetchSurvey();
  }, [surveyId]);

  const isPastDate = survey ? new Date(survey.survey_end) < new Date() : false;

  const statuses = [
    { value: "accepted", label: "ACCEPTED", color: "bg-green-100 text-green-800", pingColor: "bg-green-500" },
    { value: "pending", label: "PENDING", color: "bg-yellow-100 text-yellow-800", pingColor: "bg-yellow-500" },
    { value: "archived", label: "ARCHIVED", color: "bg-gray-100 text-gray-800", pingColor: "bg-gray-500" },
    { value: "rejected", label: "REJECTED", color: "bg-red-100 text-red-800", pingColor: "bg-red-500" },
  ];

  useEffect(() => {
    if (selectedStatus === "rejected") {
      setShowRejectForm(true);
    } else {
      setShowRejectForm(false);
      setRejectionReason("");
      setRejectionError("");
    }
  }, [selectedStatus]);

  const canMoveToStatus = (statusValue: string): { allowed: boolean; reason?: string } => {
    const currentStatus = survey?.survey_status;
    
    if (currentStatus === 'archived' && isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { allowed: false, reason: undefined };
      }
    }
    
    if (currentStatus === 'rejected' && isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { allowed: false, reason: undefined };
      }
    }
    
    if (currentStatus === 'archived' && !isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { allowed: true, reason: undefined };
      }
    }
    
    if (currentStatus === 'rejected' && !isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { allowed: true, reason: undefined };
      }
    }
    
    if (currentStatus === 'pending' && isPastDate) {
      if (statusValue === 'accepted') {
        return { allowed: false, reason: undefined };
      }
    }
    
    if (currentStatus === 'accepted' && isPastDate) {
      if (statusValue === 'pending') {
        return { allowed: false, reason: undefined };
      }
    }
    
    return { allowed: true, reason: undefined };
  };

  const handleStatusChange = (statusValue: string) => {
    const { allowed, reason } = canMoveToStatus(statusValue);

    if (!allowed && reason) {
      setErrorMessage(reason);
      setSelectedStatus(survey.survey_status);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setErrorMessage(null);
      setSelectedStatus(statusValue);
    }
  };

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

  const handleMove = async () => {
    if (selectedStatus !== survey.survey_status) {
      if (selectedStatus === "rejected") {
        const errorMsg = validateRejectionReason(rejectionReason);
        if (errorMsg) {
          setRejectionError(errorMsg);
          return;
        }
      }

      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const updateData: any = { survey_status: selectedStatus };
        
        if (selectedStatus === "rejected") {
          updateData.rejection_reason = rejectionReason.trim();
        } else {
          updateData.rejection_reason = null;
        }
        
        const { error } = await supabase
          .from("survey")
          .update(updateData)
          .eq("id", survey.id);
          
        if (error) throw error;
        
        router.push("/survey/admin/move/success");
      } catch (err: any) {
        setSubmitError(err.message || "Failed to move survey.");
        setIsSubmitting(false);
      }
    } else {
      router.push("/dashboard?tab=survey&page=1");
    }
  };

  const getWarningMessage = () => {
    if (isPastDate) {
      if (survey?.survey_status === 'archived') {
        return {
          title: "Archived Survey with Past Date",
          message: "This archived survey has passed its end date. It cannot be moved to Accepted or Pending until the end date is updated to a future date. Only Rejected or Archived status is available."
        };
      }
      if (survey?.survey_status === 'rejected') {
        return {
          title: "Rejected Survey with Past Date",
          message: "This rejected survey has passed its end date. It cannot be moved to Accepted or Pending until the end date is updated to a future date. Only Rejected or Archived status is available."
        };
      }
      if (survey?.survey_status === 'pending') {
        return {
          title: "Pending Survey with Past Date",
          message: "This survey's end date has passed. It cannot be moved to Accepted. Consider archiving it or updating the end date first."
        };
      }
      if (survey?.survey_status === 'accepted') {
        return {
          title: "Accepted Survey with Past Date",
          message: "This accepted survey has passed its end date. It cannot be moved back to Pending. Only Archived or Rejected status is available."
        };
      }
    }
    return null;
  };

  const warning = getWarningMessage();

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
  
  if (!survey) return <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8]">Survey not found.</div>;

  return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div>
            <BackButton href="/dashboard?tab=survey&page=1" />
            <div className="mt-5">
              <h1 className="text-3xl font-oswald font-bold text-[#011638]">
                Move Survey
              </h1>
              <p className="text-[#475569] font-ubuntu-mono mt-2">
                Move "<span className="font-bold italic text-[#011638]">{survey.survey_title}</span>" to a different status category.
              </p>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <div className="bg-[#fbfaf8] mt-4 rounded-lg shadow-xl border border-[#e0e7ff] p-6 space-y-6">
            {/* Change Status */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Change Status</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                {warning && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <strong>{warning.title}:</strong> {warning.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-ubuntu-mono">{errorMessage}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {statuses.map((status) => {
                    const { allowed } = canMoveToStatus(status.value);
                    const isDisabled = !allowed;
                    
                    return (
                      <div key={status.value} className="relative">
                        <label
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedStatus === status.value
                              ? "border-[#1e4db7] bg-[#e0e7ff] shadow-sm"
                              : isDisabled
                              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                              : "border-[#94a3b8] hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status.value}
                            checked={selectedStatus === status.value}
                            onChange={() => handleStatusChange(status.value)}
                            disabled={isDisabled}
                            className="mr-3 accent-[#1e4db7] shrink-0"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.color} shrink-0`}>
                              {status.label}
                            </span>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>

                {/* Rejection Form */}
                {showRejectForm && (
                  <div className="pt-4">
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Reason for Rejection <span className="text-[#eec643]">*</span>
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
                      placeholder="Indicate why this survey is being rejected..."
                    />
                    {rejectionError && (
                      <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                        {rejectionError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
              <button
                onClick={() => router.push("/dashboard?tab=survey&page=1")}
                className="px-4 py-2 text-[#011638] font-ubuntu-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={selectedStatus === survey.survey_status || isSubmitting || (selectedStatus === "rejected" && !!rejectionError)}
                className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Moving..." : "Move Survey"}
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function MoveSurveyPage() {
  return (
    <Suspense>
      <MoveSurveyContent />
    </Suspense>
  );
}