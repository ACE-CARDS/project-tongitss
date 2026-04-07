"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

interface MoveThesisModalProps {
  thesis: any;
  onClose: () => void;
  onMove: (newStatus: string) => void;
}

export default function MoveThesisModal({ thesis, onClose, onMove }: MoveThesisModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(thesis.thesis_status);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const statuses = [
    { value: "accepted", label: "Accepted", color: "bg-green-100 text-green-800", pingColor: "bg-green-500" },
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", pingColor: "bg-yellow-500" },
    { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-800", pingColor: "bg-gray-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800", pingColor: "bg-red-500" },
  ];

  const handleStatusChange = (statusValue: string) => {
    setSelectedStatus(statusValue);
  };

  const handleMove = () => {
    if (selectedStatus !== thesis.thesis_status) {
      onMove(selectedStatus);
    } else {
      onClose();
    }
  };

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
          <button
            onClick={onClose}
            className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          >
            ← Back to List
          </button>
          <h1 className="text-2xl font-oswald font-bold text-[#011638] break-words">Move Thesis</h1>
        </div>

        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6 space-y-6">
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Change Status</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
              <div className="text-[#475569] font-ubuntu-mono mb-4">
                <span>Move "</span>
                <span className="font-bold text-[#011638] break-words">{thesis.thesis_title}</span>
                <span>" to:</span>
              </div>

              <div className="space-y-3">
                {statuses.map((status) => (
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
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#e0e7ff]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#011638] font-ubuntu-mono"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={selectedStatus === thesis.thesis_status}
              className={`px-6 py-2 text-[#fbfaf8] rounded transition-colors font-oswald font-bold shadow-md ${
                selectedStatus === thesis.thesis_status
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#1e4db7] hover:bg-[#0d21a1]"
              }`}
            >
              MOVE THESIS
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}