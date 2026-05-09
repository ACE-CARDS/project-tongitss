"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { createClient } from "@/utils/supabase/client";
import BackButton from "@/components/ui/backButton";

// prop types
interface MoveSurveyModalProps {
  survey: any;
  onClose: () => void;
  onMove: (newStatus: string, rejectionReason?: string) => void;
}

export default function MoveSurveyModal({ survey, onClose, onMove }: MoveSurveyModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(survey.survey_status); // to check which status is selected
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // error message
  const [showRejectForm, setShowRejectForm] = useState(false); // show rejection reason form
  const [rejectionReason, setRejectionReason] = useState(survey.rejection_reason || ""); // rejection reason
  const [rejectionError, setRejectionError] = useState<string>(""); // rejection reason error
  const [isSubmitting, setIsSubmitting] = useState(false); // submit state
  const isPastDate = new Date(survey.survey_end) < new Date(); // check if end date is in the past

  // same from edit, prevent bg scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const statuses = [
    { value: "accepted", label: "ACCEPTED", color: "bg-green-100 text-green-800", pingColor: "bg-green-500" },
    { value: "pending", label: "PENDING", color: "bg-yellow-100 text-yellow-800", pingColor: "bg-yellow-500" },
    { value: "archived", label: "ARCHIVED", color: "bg-gray-100 text-gray-800", pingColor: "bg-gray-500" },
    { value: "rejected", label: "REJECTED", color: "bg-red-100 text-red-800", pingColor: "bg-red-500" },
  ];

  // Reset rejection form when selecting rejected status
  useEffect(() => {
    if (selectedStatus === "rejected") {
      setShowRejectForm(true);
    } else {
      setShowRejectForm(false);
      setRejectionReason("");
      setRejectionError("");
    }
  }, [selectedStatus]);

  // define which status can be moved to another
  const canMoveToStatus = (statusValue: string): { allowed: boolean; reason?: string } => {
    const currentStatus = survey.survey_status;
    
    // archived with past date can't be moved to pending or accepted
    if (currentStatus === 'archived' && isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { 
          allowed: false, 
          reason: undefined
        };
      }
    }
    
    // rejected with past date can't be moved to pending or accepted
    if (currentStatus === 'rejected' && isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { 
          allowed: false, 
          reason: undefined
        };
      }
    }
    
    // archived with future date can be moved to pending/accepted
    if (currentStatus === 'archived' && !isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { 
          allowed: true, 
          reason: undefined 
        };
      }
    }
    
    // rejected with future date can be moved to pending/accepted
    if (currentStatus === 'rejected' && !isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { 
          allowed: true, 
          reason: undefined 
        };
      }
    }
    
    // pending with past date cannot be accepted
    if (currentStatus === 'pending' && isPastDate) {
      if (statusValue === 'accepted') {
        return { 
          allowed: false, 
          reason: undefined
        };
      }
    }
    
    // accepted with past date cannot be moved to pending
    if (currentStatus === 'accepted' && isPastDate) {
      if (statusValue === 'pending') {
        return { 
          allowed: false, 
          reason: undefined
        };
      }
    }
    
    // default allow all other transitions
    return { 
      allowed: true, 
      reason: undefined 
    };
  };

  // validate move
  const handleStatusChange = (statusValue: string) => {
    const { allowed, reason } = canMoveToStatus(statusValue);

    // not allowed, show reason
    if (!allowed && reason) {
      setErrorMessage(reason);
      // reset
      setSelectedStatus(survey.survey_status);
      // clear error
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      // allowed, clear error and set status
      setErrorMessage(null);
      setSelectedStatus(statusValue);
    }
  };

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
  if (selectedStatus === "rejected") {
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
  }
  return true;
};

  // call onMove
  const handleMove = async () => {
    if (selectedStatus !== survey.survey_status) {
      // Validate rejection reason if moving to rejected
      if (!validateRejectionReason()) {
        return;
      }

      setIsSubmitting(true);
      
      // If moving to rejected, update rejection_reason
      if (selectedStatus === "rejected") {
        const supabase = createClient();
        const { error } = await supabase
          .from("survey")
          .update({ rejection_reason: rejectionReason.trim() })
          .eq("id", survey.id);
          
        if (error) {
          console.error("Error updating rejection reason:", error);
          setErrorMessage("Failed to update rejection reason. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // If moving from rejected to another status, clear rejection_reason
      if (survey.survey_status === "rejected" && selectedStatus !== "rejected") {
        const supabase = createClient();
        const { error } = await supabase
          .from("survey")
          .update({ rejection_reason: null })
          .eq("id", survey.id);
          
        if (error) {
          console.error("Error clearing rejection reason:", error);
        }
      }
      
      onMove(selectedStatus, selectedStatus === "rejected" ? rejectionReason.trim() : undefined);
      setIsSubmitting(false);
    } else {
      onClose();
    }
  };

  // warning message based on status and date
  const getWarningMessage = () => {
    if (isPastDate) {
      if (survey.survey_status === 'archived') {
        return {
          title: "Archived Survey with Past Date",
          message: "This archived survey has passed its end date. It cannot be moved to Accepted or Pending until the end date is updated to a future date. Only Rejected or Archived status is available."
        };
      }
      if (survey.survey_status === 'rejected') {
        return {
          title: "Rejected Survey with Past Date",
          message: "This rejected survey has passed its end date. It cannot be moved to Accepted or Pending until the end date is updated to a future date. Only Rejected or Archived status is available."
        };
      }
      if (survey.survey_status === 'pending') {
        return {
          title: "Pending Survey with Past Date",
          message: "This survey's end date has passed. It cannot be moved to Accepted. Consider archiving it or updating the end date first."
        };
      }
      if (survey.survey_status === 'accepted') {
        return {
          title: "Accepted Survey with Past Date",
          message: "This accepted survey has passed its end date. It cannot be moved back to Pending. Only Archived or Rejected status is available."
        };
      }
    }
    return null;
  };

  const warning = getWarningMessage();

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      <NavBar />
      <main className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-6">
          <BackButton />
          <h1 className="text-2xl font-oswald font-bold text-[#011638] break-words mt-6">Move Survey</h1>
        </div>

        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 space-y-6">
          {/* Warning banner */}
          {warning && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong className="font-bold">{warning.title}:</strong> {warning.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Change Status */}
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Change Status</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
              <div className="text-[#475569] font-ubuntu-mono mb-4">
                <span>Move "</span>
                <span className="font-bold text-[#011638] break-words">{survey.survey_title}</span>
                <span>" to:</span>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 text-sm font-ubuntu-mono">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3">
                {statuses.map((status) => {
                  const { allowed, reason } = canMoveToStatus(status.value);
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
                          {isDisabled && reason && (
                            <span className="text-xs text-red-600 font-ubuntu-mono ml-2">
                              ⚠️ {reason}
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Rejection Form */}
              {showRejectForm && (
                <div className="pt-4 border-t border-[#011638]">
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
                    Reason for Rejection <span className="text-[#eec643]">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue"
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
                  <span id="rejection-reason-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#011638] font-ubuntu-mono cursor-pointer hover:text-[#1a2a4f] transition-colors"
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
      <Footer />
    </div>
  );
}