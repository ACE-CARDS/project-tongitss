"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

interface ReviewThesisModalProps {
  thesis: any;
  onClose: () => void;
  onApprove: (id: string, reason?: string) => void;
  onReject: (id: string, reason: string) => void;
}

export default function ReviewThesisModal({
  thesis,
  onClose,
  onApprove,
  onReject,
}: ReviewThesisModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleApprove = () => onApprove(thesis.id);

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(thesis.id, rejectionReason.trim());
    }
  };

  const keywords = thesis.thesis_keyword
    ? thesis.thesis_keyword
        .split(",")
        .map((k: string) => k.trim())
        .filter((k: string) => k)
    : [];

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
              onClick={onClose}
              className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">
              Review Thesis
            </h1>
          </div>

          <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6 space-y-6">
            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">
                  Basic Information
                </h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Thesis Title
                  </label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">
                    {thesis.thesis_title}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Abstract
                  </label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 whitespace-pre-wrap break-words min-h-[100px]">
                    {thesis.thesis_abstract}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
                    Keywords
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((word: string, i: number) => (
                        <span
                          key={i}
                          className="bg-[#eef2ff] text-[#1e4db7] border border-[#1e4db7] px-2 py-1 rounded text-xs font-ubuntu-mono"
                        >
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 font-ubuntu-mono text-sm italic">
                        No keywords
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Research Category
                  </label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">
                    {thesis.r_category?.r_category_name || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">
                  Author(s) & School
                </h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    School
                  </label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50 break-words">
                    {thesis.school?.school_name || "No School Listed"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-2">
                    Author(s)
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {thesis.thesis_author?.map((ta: any, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-2 border border-[#94a3b8] rounded bg-white"
                      >
                        <p className="font-ubuntu-mono text-[#475569] break-words">
                          {ta.author?.author_fname}{" "}
                          {ta.author?.author_minit &&
                            `${ta.author.author_minit}. `}
                          {ta.author?.author_lname}
                        </p>
                        <p className="text-xs text-[#1e4db7] font-ubuntu-mono break-words">
                          {ta.author?.author_email}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                <h2 className="text-lg font-oswald font-semibold">
                  Thesis Details
                </h2>
              </div>
              <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Publication Date
                  </label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                    {new Date(thesis.thesis_date).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Physical Copy
                  </label>
                  <div className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                    {thesis.thesis_phys ? (
                      thesis.thesis_phys
                    ) : (
                      <span className="text-[#475569]">
                        No physical copy available
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Digital Copy Link
                  </label>
                  <div className="text-[#1e4db7] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded bg-gray-50">
                    {thesis.thesis_digi ? (
                      <a
                        href={thesis.thesis_digi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline break-all"
                      >
                        {thesis.thesis_digi}
                      </a>
                    ) : (
                      <span className="text-[#475569]">
                        No digital copy link provided
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                  placeholder="Indicate why this thesis is being rejected..."
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
              {!showRejectForm ? (
                <>
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="px-4 py-2 text-[#fbfaf8] bg-red-600 border border-red-400 rounded-lg hover:bg-red-700 transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 text-[#fbfaf8] bg-green-600 border border-green-400 rounded-lg hover:bg-green-700 transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve Thesis
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
