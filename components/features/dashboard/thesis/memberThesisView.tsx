"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import SpotlightCard from "@/components/ui/SpotlightCard";
import Pagination from "@/components/ui/pagination";

// Helper function for responsive items per page
const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 6;
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

// Extendable Card Component for Thesis
function ExtendableThesisCard({ thesis }: { thesis: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <SpotlightCard
      className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm"
      spotlightColor="rgba(239, 240, 242, 0.16)"
    >
      <div className="bg-[#011638] px-6 py-4 min-h-[110px] flex items-center">
        <h2 className="text-xl font-oswald font-bold text-[#fbfaf8] line-clamp-3 break-words overflow-hidden">
          {thesis.thesis_title}
        </h2>
      </div>

      <div className="px-6 py-4 flex flex-col flex-1">

        {/* STATUS Section */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            STATUS
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(thesis.thesis_status)} inline-flex items-center gap-2 shadow-sm`}>
            <span className="relative flex size-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingColor(thesis.thesis_status)} opacity-75`}></span>
              <span className={`relative inline-flex size-2 rounded-full ${getPingColor(thesis.thesis_status)}`}></span>
            </span>
            {thesis.thesis_status?.toUpperCase()}
          </div>
        </div>

        {/* REJECTION REASON Section */}
        {thesis.thesis_status === 'rejected' && thesis.rejection_reason && (
          <div className="mb-4">
            <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
              REJECTION REASON
            </h3>
            <p className="text-red-600 font-ubuntu-mono text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {thesis.rejection_reason}
            </p>
          </div>
        )}

        {/* Abstract */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            Abstract
          </h3>
          <div className={!isExpanded ? "line-clamp-3" : ""}>
            <p className="text-[#475569] font-ubuntu-mono text-sm leading-relaxed">
              {thesis.thesis_abstract}
            </p>
          </div>
        </div>

        {/* Author(s) */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            Author(s)
          </h3>
          <div className="flex flex-wrap gap-2">
            {thesis.thesis_author && thesis.thesis_author.length > 0 ? (
              thesis.thesis_author.slice(0, isExpanded ? undefined : 2).map((ta: any, index: number) => {
                const author = ta.author;
                if (!author) return null;
                
                const middleInitial = author.author_minit
                  ? ` ${author.author_minit}.`
                  : "";
                return (
                  <div
                    key={author.id || index}
                    className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-ubuntu-mono"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {author.author_fname} {middleInitial} {author.author_lname}
                  </div>
                );
              })
            ) : (
              <span className="text-[#475569] opacity-50 text-sm">No authors listed</span>
            )}
            {!isExpanded && thesis.thesis_author && thesis.thesis_author.length > 2 && (
              <span className="text-[#475569] text-sm font-ubuntu-mono">
                +{thesis.thesis_author.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Keywords */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            Keywords
          </h3>
          <div className="flex flex-wrap gap-1">
            {thesis.thesis_keyword
              ?.split(",")
              .map((keyword: string, index: number) => (
                <span key={index} className="bg-[#1e4db7] text-[#fbfaf8] px-2 py-1 rounded text-xs font-ubuntu-mono">
                  {keyword.trim()}
                </span>
              ))}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <>
            {/* Details */}
            <div className="mb-4">
              <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">Date:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {new Date(thesis.thesis_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">Category:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {thesis.r_category?.r_category_name || "Uncategorized"}
                  </span>
                </div>
                <div>
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">School:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {thesis.school?.school_name || "No School"}
                  </span>
                </div>
              </div>
            </div>

            {/* Access Links */}
            <div className="mb-4 space-y-3">
              <div>
                <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Physical Copy Access
                </h3>
                {thesis.thesis_phys ? (
                  <a
                    href={thesis.thesis_phys}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-all"
                  >
                    View Physical Copy Details
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-[#475569] opacity-50 font-ubuntu-mono text-sm">No physical copy information available</span>
                )}
              </div>
              <div>
                <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Digital Copy Access
                </h3>
                {thesis.thesis_digi ? (
                  <a
                    href={thesis.thesis_digi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-all"
                  >
                    Access Digital Copy
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ) : (
                  <span className="text-[#475569] opacity-50 font-ubuntu-mono text-sm">No digital copy available</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* View More & View Less Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-[#1e4db7] hover:text-[#011638] text-sm transition-colors flex items-center gap-1 self-start font-normal"
        >
          {isExpanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              View Less
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              View More
            </>
          )}
        </button>
      </div>
    </SpotlightCard>
  );
}

export default function MemberThesisView() {
  const { user } = useUser();
  const supabase = createClient();
  const [theses, setTheses] = useState<any[]>([]);
  const [filteredTheses, setFilteredTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.email) {
      fetchUserTheses();
    }
  }, [user]);

  useEffect(() => {
    // Filter theses based on search query
    if (searchQuery.trim() === "") {
      setFilteredTheses(theses);
    } else {
      const filtered = theses.filter(thesis =>
        thesis.thesis_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.thesis_abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.thesis_keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTheses(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, theses]);

  const fetchUserTheses = async () => {
    try {
      const { data: author } = await supabase
        .from("author")
        .select("id")
        .eq("author_email", user?.email)
        .single();

      if (author) {
        const { data: thesisLinks, error } = await supabase
          .from("thesis_author")
          .select(`
            thesis:thesis(
              *,
              r_category:r_category(*),
              school:school(*),
              thesis_author:thesis_author(
                author:author(*)
              )
            )
          `)
          .eq("author", author.id);

        if (error) throw error;
        
        if (thesisLinks) {
          const fetchedTheses = thesisLinks.map(link => link.thesis);
          setTheses(fetchedTheses);
          setFilteredTheses(fetchedTheses);
        }
      }
    } catch (error) {
      console.error("Error fetching theses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalItems = filteredTheses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTheses = filteredTheses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Theses</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted theses
          </p>
        </div>

        {/* Search Bar and Add Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, abstract, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg bg-[#fbfaf8] text-[#475569] font-ubuntu-mono opacity-50"
            />
            <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            disabled
            className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Thesis
          </button>
        </div>

        {/* Blank */}
        <div className="min-h-[400px] w-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Theses</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted theses
          </p>
        </div>

        {/* Search Bar and Add Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, abstract, or keywords..."
              value={searchQuery ?? ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
            />
            <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#475569] hover:text-[#011638]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <Link
            href="/thesis/add?returnTo=/dashboard?tab=thesis"
            className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Thesis
          </Link>
        </div>

        {/* Theses Grid */}
        {!mounted ? (
          <div className="text-center text-[#475569] py-8 font-ubuntu-mono">
            Loading...
          </div>
        ) : paginatedTheses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#475569] font-ubuntu-mono">
                {searchQuery ? "No theses found." : "You haven't submitted any theses yet."}
              </p>
              {!searchQuery && (
                <Link 
                  href="/thesis/add"
                  className="inline-block mt-4 text-[#1e4db7] hover:text-[#011638] font-oswald"
                >
                  Submit your first thesis →
                </Link>
              )}
            </div>
          ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {paginatedTheses.map((thesis) => (
                <ExtendableThesisCard key={thesis.id} thesis={thesis} />
              ))}
            </div>

          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages || 1}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
          </>
        )}
      </div>
    </>
  );
}