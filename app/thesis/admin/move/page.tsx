"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";
import { sendThesisMoveEmail } from "@/app/actions/email-actions";

function MoveThesisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const thesisId = searchParams.get("id");

  const [thesis, setThesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThesis() {
      if (!thesisId) return;
      
      const { data, error } = await supabase
        .from("thesis")
        .select(`
          *,
          r_thematic_area (r_thematic_name),
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
        setSelectedStatus(data.thesis_status);
        setRejectionReason(data.rejection_reason || "");
      }
      setLoading(false);
    }

    fetchThesis();
  }, [thesisId]);

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

  const handleStatusChange = (statusValue: string) => {
    setSelectedStatus(statusValue);
    setErrorMessage(null);
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
    if (selectedStatus !== thesis.thesis_status) {
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
        const oldStatus = thesis.thesis_status;
        const updateData: any = { thesis_status: selectedStatus };
        
        if (selectedStatus === "rejected") {
          updateData.rejection_reason = rejectionReason.trim();
        } else {
          updateData.rejection_reason = null;
        }
        
        const { error } = await supabase
          .from("thesis")
          .update(updateData)
          .eq("id", thesis.id);
          
        if (error) throw error;
        
        // Send move notif email
        const emailResult = await sendThesisMoveEmail(
          Number(thesisId), 
          oldStatus, 
          selectedStatus,
          selectedStatus === "rejected" ? rejectionReason.trim() : undefined
        );
        if (emailResult.success) {
          console.log(`Move email sent for thesis ${thesisId} from ${oldStatus} to ${selectedStatus}`);
        } else {
          console.warn(`Move email failed for thesis ${thesisId}:`, emailResult.error);
        }
        
        router.push("/thesis/admin/move/success");
      } catch (err: any) {
        setSubmitError(err.message || "Failed to move thesis.");
        setIsSubmitting(false);
      }
    } else {
      router.push("/dashboard?tab=thesis&page=1");
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

  return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div>
            <BackButton href="/dashboard?tab=thesis&page=1" />
            <div className="mt-5">
              <h1 className="text-3xl font-oswald font-bold text-[#011638]">
                Move Thesis
              </h1>
              <p className="text-[#475569] font-ubuntu-mono mt-2 break-words">
                Move "<span className="font-bold italic text-[#011638] break-words">{thesis.thesis_title}</span>" to a different status category.
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
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 text-sm font-ubuntu-mono">{errorMessage}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {statuses.map((status) => {
                    return (
                      <div key={status.value} className="relative">
                        <label
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedStatus === status.value
                              ? "border-[#1e4db7] bg-[#e0e7ff] shadow-sm"
                              : "border-[#94a3b8] hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="status"
                            value={status.value}
                            checked={selectedStatus === status.value}
                            onChange={() => handleStatusChange(status.value)}
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
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
              <button
                onClick={() => router.push("/dashboard?tab=thesis&page=1")}
                className="px-4 py-2 text-[#011638] font-ubuntu-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={selectedStatus === thesis.thesis_status || isSubmitting || (selectedStatus === "rejected" && !!rejectionError)}
                className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Moving..." : "Move Thesis"}
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function MoveThesisPage() {
  return (
    <Suspense>
      <MoveThesisContent />
    </Suspense>
  );
}