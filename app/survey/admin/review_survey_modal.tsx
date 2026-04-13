"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

// define props
interface ReviewSurveyModalProps {
  survey: any;
  onClose: () => void;
  onApprove: (id: string, reason?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function ReviewSurveyModal({ survey, onClose, onApprove, onReject }: ReviewSurveyModalProps) {
  const [rejectionReason, setRejectionReason] = useState(""); // for reject reason input
  const [showRejectForm, setShowRejectForm] = useState(false); // for reject reason input form (hidden muna)

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []); // no bg scroll

  const handleApprove = () => onApprove(survey.id); // approve lang no reason
  
  // reject need reason
  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(survey.id, rejectionReason.trim());
    }
  };

  // keywords
  const keywords = survey.survey_keyword 
    ? survey.survey_keyword.split(',').map((k: string) => k.trim()).filter((k: string) => k) 
    : [];

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-6">
            <button
              onClick={onClose}
              className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
            >
              ← Back to List
            </button>
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">Review Survey</h1>
          </div>

          <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 space-y-6">

            {/* Basic Information */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Basic Information</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Survey Title</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">
                    {survey.survey_title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Description</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 whitespace-pre-wrap break-words min-h-[100px]">
                    {survey.survey_desc}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((word: string, i: number) => (
                        <span key={i} className="bg-[#eef2ff] text-[#1e4db7] border border-[#1e4db7] px-2 py-1 rounded text-xs font-ubuntu-mono">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 font-ubuntu-mono text-sm italic">No keywords</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Research Category</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">
                    {survey.r_category?.r_category_name || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            {/* Authors & School */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Author(s) & School</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">School</label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">
                    {survey.school?.school_name || "No School Listed"}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">Author(s)</label>
                  <div className="grid grid-cols-1 gap-3">
                    {survey.survey_author?.map((sa: any, index: number) => (
                      <div key={index} className="px-3 py-2 border border-[#94a3b8] rounded bg-white">
                        <p className="font-ubuntu-mono text-[#475569] break-words">
                          {sa.author?.author_fname} {sa.author?.author_minit && `${sa.author.author_minit}. `}{sa.author?.author_lname}
                        </p>
                        <p className="text-xs text-[#1e4db7] font-ubuntu-mono break-words">{sa.author?.author_email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Survey Details */}
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">Survey Details</h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Start Date</label>
                    <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                      {new Date(survey.survey_start).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">End Date</label>
                    <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                      {new Date(survey.survey_end).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">Survey Link</label>
                  <div className="text-[#1e4db7] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                    <a 
                      href={survey.survey_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline break-all"
                    >
                      {survey.survey_link}
                    </a>
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
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  maxLength={100}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none bg-white"
                  placeholder="Indicate why this survey is being rejected..."
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)} // show reject reason form
                    className="px-4 py-2 text-[#fbfaf8] bg-red-600 border border-red-400 rounded-lg hover:bg-red-700 transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 text-[#fbfaf8] bg-green-600 border border-green-400 rounded-lg hover:bg-green-700 transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Survey
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                    className="px-4 py-2 text-[#011638] font-ubuntu-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                    className={`px-6 py-2 text-[#fbfaf8] rounded transition-colors font-oswald font-bold shadow-md ${
                      !rejectionReason.trim()
                        ? "bg-red-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    CONFIRM REJECTION
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