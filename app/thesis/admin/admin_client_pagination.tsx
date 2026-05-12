"use client";

import { useState, useEffect } from "react";
import ThesisAbstract from "../thesis_abstract";
import { useRouter } from "next/navigation";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Pagination from "@/components/ui/pagination";
import { createClient } from "@/utils/supabase/client";
import EditThesisModal from "./edit_thesis_modal";
import MoveThesisModal from "./move_thesis_modal";

interface ClientPaginationProps {
  allTheses: any[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onPendingCountChange?: (count: number) => void;
}

const getItemsPerPage = () => {
  if (typeof window === "undefined") return 6;

  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

export default function AdminClientPagination({ allTheses, currentPage, onPageChange, onPendingCountChange }: ClientPaginationProps) {
  const router = useRouter();
  const supabase = createClient();
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [mounted, setMounted] = useState(false);
  const [editingThesis, setEditingThesis] = useState<any>(null);
  const [movingThesis, setMovingThesis] = useState<any>(null);
  const [theses, setTheses] = useState(allTheses);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (onPendingCountChange) {
      const pendingCount = theses.filter(
        (t: any) => t.thesis_status === "pending"
      ).length;
      onPendingCountChange(pendingCount);
    }
  }, [theses, onPendingCountChange]);

  useEffect(() => {
    setTheses(sortTheses(allTheses));
  }, [allTheses]);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItems = theses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTheses = theses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  const sortTheses = (thesesArray: any[]) => {
    const statusOrder = {
      pending: 1,
      accepted: 2,
      archived: 3,
      rejected: 4
    };
    
    return [...thesesArray].sort((a, b) => {
      const statusDiff = (statusOrder[a.thesis_status as keyof typeof statusOrder] || 5) - 
                        (statusOrder[b.thesis_status as keyof typeof statusOrder] || 5);
      
      if (statusDiff !== 0) return statusDiff;
      
      const dateA = new Date(a.thesis_date).getTime();
      const dateB = new Date(b.thesis_date).getTime();
      
      return dateB - dateA;
    });
  };

  const handleApprove = async (thesisId: string, rejectionReason?: string) => {
    const updateData: any = { thesis_status: "accepted" };
    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    
    const { error } = await supabase
      .from("thesis")
      .update(updateData)
      .eq("id", thesisId);

    if (error) {
      console.error("Error approving thesis:", error);
      alert("Failed to approve thesis");
    } else {
      setTheses((prev) => {
        const updated = prev.map((t) =>
          t.id === thesisId ? { ...t, thesis_status: "accepted", rejection_reason: rejectionReason } : t
        );
        return sortTheses(updated);
      });
    }
  };

  const handleReject = async (thesisId: string, rejectionReason: string) => {
    const { error } = await supabase
      .from("thesis")
      .update({ thesis_status: "rejected", rejection_reason: rejectionReason })
      .eq("id", thesisId);

    if (error) {
      console.error("Error rejecting thesis:", error);
      alert("Failed to reject thesis");
    } else {
      setTheses((prev) => {
        const updated = prev.map((t) =>
          t.id === thesisId ? { ...t, thesis_status: "rejected", rejection_reason: rejectionReason } : t
        );
        return sortTheses(updated);
      });
    }
  };

  const handleUpdateStatus = async (thesisId: string, newStatus: string) => {
    const { error } = await supabase
      .from("thesis")
      .update({ thesis_status: newStatus })
      .eq("id", thesisId);

    if (error) {
      console.error("Error updating thesis status:", error);
      alert("Failed to update thesis status");
    } else {
      setTheses((prev) => {
        const updated = prev.map((t) =>
          t.id === thesisId ? { ...t, thesis_status: newStatus } : t
        );
        return sortTheses(updated);
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPingColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      {isLoading ? (
      <div className="min-h-[400px]"></div>  // ← Blank
    ) : (!paginatedTheses || paginatedTheses.length === 0) ? (
      <div className="text-center text-[#475569] py-8 font-ubuntu-mono">
        No theses found.
      </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {paginatedTheses.map((thesis: any) => (
              <SpotlightCard
                key={thesis.id}
                className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm relative"
                spotlightColor="rgba(239, 240, 242, 0.16)"
              >
                <div className="flex flex-col h-full">
                  <div className="absolute top-4 left-0 right-0 flex justify-between items-center z-10 px-6">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(thesis.thesis_status)} flex items-center gap-2 shadow-sm`}>
                      <span className="relative flex size-2">
                        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingColor(thesis.thesis_status)} opacity-75`}></span>
                        <span className={`relative inline-flex size-2 rounded-full ${getPingColor(thesis.thesis_status)}`}></span>
                      </span>
                      {thesis.thesis_status?.toUpperCase()}
                    </div>

                    <div className="flex gap-2 -mr-1" onClick={(e) => e.stopPropagation()}>
                      {thesis.thesis_status === "pending" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/thesis/admin/review?id=${thesis.id}`); 
                          }}
                          className="text-[#fbfaf8] hover:text-[#eec643] transition-all duration-200 hover:scale-110"
                          title="Review"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                          </svg>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingThesis(thesis);
                            }}
                            className="text-[#fbfaf8] hover:text-[#eec643] transition-all duration-200 hover:scale-110"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMovingThesis(thesis);
                            }}
                            className="text-[#fbfaf8] hover:text-[#eec643] transition-all duration-200 hover:scale-110"
                            title="Move"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-[#011638] pt-12 pb-4 px-6 flex items-center h-[150px]">
                    <h2 className="text-xl font-oswald font-bold text-[#fbfaf8] line-clamp-3 break-words overflow-hidden pr-12">
                      {thesis.thesis_title}
                    </h2>
                  </div>

                  <div className="px-6 py-4 flex flex-col flex-1">
                    <div className="mb-4 min-h-[60px]">
                      <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                        Author(s)
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {thesis.thesis_author && thesis.thesis_author.length > 0 ? (
                          thesis.thesis_author.map((ta: any, index: number) => {
                            const author = ta.author;
                            if (!author) return null;

                            const middleInitial = author.author_minit
                              ? ` ${author.author_minit}.`
                              : "";
                            return (
                              <div
                                key={`${thesis.id}-${author.id || 'no-id'}-${index}`}
                                className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-ubuntu-mono break-words max-w-full whitespace-normal"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                {author.author_fname} {middleInitial} {author.author_lname}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[#475569] opacity-50 text-sm">
                            No authors listed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex-1">
                      <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                        Abstract
                      </h3>
                      <div>
                        <ThesisAbstract abstract={thesis.thesis_abstract} />
                      </div>
                    </div>

                    <div className="mb-4 min-h-[70px]">
                      <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                        Keywords
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {thesis.thesis_keyword
                          ?.split(",")
                          .map((keyword: string, index: number) => (
                            <span
                              key={index}
                              className="bg-[#1e4db7] text-[#fbfaf8] px-2 py-1 rounded text-xs font-ubuntu-mono break-words max-w-full whitespace-normal"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                        Details
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-[#475569] block font-ubuntu-mono">Publication Date:</span>
                          <span className="font-ubuntu-mono text-[#011638]">
                            {new Date(thesis.thesis_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#475569] block font-ubuntu-mono">Category:</span>
                          <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal">
                            {thesis.r_category?.r_category_name || "Uncategorized"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#475569] block font-ubuntu-mono">School:</span>
                          <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal">
                            {thesis.school?.school_name || "No School"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Files
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Physical Copy */}
                      <div>
                        <h4 className="text-sm text-[#475569] block font-ubuntu-mono">
                          Physical Copy:
                        </h4>
                        <div>
                          {thesis.thesis_phys ? (
                            <span className="text-[#011638] text-sm font-ubuntu-mono break-words max-w-full whitespace-normal">
                              {thesis.thesis_phys}
                            </span>
                          ) : (
                            <span className="text-[#475569] text-sm opacity-50 font-ubuntu-mono">
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Digital Copy */}
                      <div>
                        <h4 className="text-sm text-[#475569] block font-ubuntu-mono">
                          Digital Copy:
                        </h4>
                        <div>
                          {thesis.thesis_digi ? (
                            <a
                              href={thesis.thesis_digi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono"
                            >
                              View Digital Copy
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-[#475569] text-sm opacity-50 font-ubuntu-mono">
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-2 gap-2">
            <p className="text-[#475569] font-ubuntu-mono text-sm">
              Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} theses
            </p>
            <p className="text-[#475569] font-ubuntu-mono text-sm">
              Page {validCurrentPage} of {totalPages || 1}
            </p>
          </div>

          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {editingThesis && (
        <EditThesisModal
          thesis={editingThesis}
          onClose={() => setEditingThesis(null)}
          onUpdate={(updatedThesis) => {
            setTheses((prev) => {
              const updated = prev.map((t) =>
                t.id === updatedThesis.id ? updatedThesis : t
              );
              return sortTheses(updated);
            });
            setEditingThesis(null);
          }}
        />
      )}

      {movingThesis && (
        <MoveThesisModal
          thesis={movingThesis}
          onClose={() => setMovingThesis(null)}
          onMove={(newStatus) => {
            handleUpdateStatus(movingThesis.id, newStatus);
            setMovingThesis(null);
          }}
        />
      )}
    </>
  );
}