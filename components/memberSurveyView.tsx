"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "./context/userContext";
import SurveyDescription from '@/app/survey/survey_description';
import SpotlightCard from "./SpotlightCard";
import Pagination from "./pagination";

// Helper function for responsive items per page
const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 6;
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

// Extendable Card Component
function ExtendableSurveyCard({ survey }: { survey: any }) {
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
          {survey.survey_title}
        </h2>
      </div>

      <div className="px-6 py-4 flex flex-col flex-1">

        {/* STATUS Section */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            STATUS
          </h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(survey.survey_status)} inline-flex items-center gap-2 shadow-sm`}>
            <span className="relative flex size-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingColor(survey.survey_status)} opacity-75`}></span>
              <span className={`relative inline-flex size-2 rounded-full ${getPingColor(survey.survey_status)}`}></span>
            </span>
            {survey.survey_status?.toUpperCase()}
          </div>
        </div>

        {/* REJECTION REASON Section */}
        <div className="mb-4 min-h-[80px]">
          {survey.survey_status === 'rejected' && survey.rejection_reason ? (
            <>
              <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                REJECTION REASON
              </h3>
              <p className="text-red-600 font-ubuntu-mono text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {survey.rejection_reason}
              </p>
            </>
          ) : (
            <div className="invisible h-full">
              <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                REJECTION REASON
              </h3>
              <p className="text-red-600 font-ubuntu-mono text-sm bg-red-50 p-3 rounded-lg border border-red-200 opacity-0">
                Placeholder
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            Description
          </h3>
          <div className={!isExpanded ? "line-clamp-2" : ""}>
            <SurveyDescription description={survey.survey_desc} />
          </div>
        </div>

        {/* Author(s) */}
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
            Author(s)
          </h3>
          <div className="flex flex-wrap gap-2">
            {survey.survey_author && survey.survey_author.length > 0 ? (
              survey.survey_author.slice(0, isExpanded ? undefined : 2).map((sa: any, index: number) => {
                const author = sa.author;
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
            {!isExpanded && survey.survey_author && survey.survey_author.length > 2 && (
              <span className="text-[#475569] text-sm font-ubuntu-mono">
                +{survey.survey_author.length - 2} more
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
            {survey.survey_keyword
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
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">Start Date:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {new Date(survey.survey_start).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">End Date:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {new Date(survey.survey_end).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">Category:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {survey.r_category?.r_category_name || "Uncategorized"}
                  </span>
                </div>
                <div>
                  <span className="text-[#475569] block font-ubuntu-mono text-xs">School:</span>
                  <span className="font-ubuntu-mono text-[#011638] text-sm">
                    {survey.school?.school_name || "No School"}
                  </span>
                </div>
              </div>
            </div>

            {/* Target Respondents */}
            <div className="mb-4">
              <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                Target Respondents
                {survey.max_respondents && (
                  <span className="ml-2 text-[#1e4db7] font-normal">
                    (Max: {survey.max_respondents})
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-1">
                {survey.survey_respondents ? (
                  survey.survey_respondents.split(',').map((criteria: string, index: number) => (
                    <span key={index} className="bg-[#1e4db7] text-[#fbfaf8] px-2 py-1 rounded text-xs font-ubuntu-mono">
                      {criteria.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-[#475569] opacity-50 text-sm font-ubuntu-mono">No specific criteria</span>
                )}
              </div>
            </div>

            {/* Survey Link */}
            <div className="mt-auto pt-2">
              <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                Survey Link
              </h3>
              {survey.survey_link ? (
                <a
                  href={survey.survey_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono break-all"
                >
                  Take Survey
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span className="text-[#475569] opacity-50 font-ubuntu-mono text-sm">No link available</span>
              )}
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

export default function MemberSurveyView() {
  const { user } = useUser();
  const supabase = createClient();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<any[]>([]);
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
      fetchUserSurveys();
    }
  }, [user]);

  useEffect(() => {
    // Filter surveys based on search query
    if (searchQuery.trim() === "") {
      setFilteredSurveys(surveys);
    } else {
      const filtered = surveys.filter(survey =>
        survey.survey_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.survey_desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        survey.survey_keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSurveys(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, surveys]);

  const fetchUserSurveys = async () => {
    try {
      const { data: author } = await supabase
        .from("author")
        .select("id")
        .eq("author_email", user?.email)
        .single();

      if (author) {
        const { data: surveyLinks, error } = await supabase
          .from("survey_author")
          .select(`
            survey:survey(
              *,
              r_category:r_category(*),
              school:school(*),
              survey_author:survey_author(
                author:author(*)
              )
            )
          `)
          .eq("author", author.id);

        if (error) throw error;
        
        if (surveyLinks) {
          const fetchedSurveys = surveyLinks.map(link => link.survey);
          setSurveys(fetchedSurveys);
          setFilteredSurveys(fetchedSurveys);
        }
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalItems = filteredSurveys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Surveys</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted surveys
          </p>
        </div>

        {/* Search Bar and Add Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, description, or keywords..."
              disabled
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
            Add Survey
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
          <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Surveys</h1>
          <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
            View and manage your submitted surveys
          </p>
        </div>

        {/* Search Bar and Add Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by title, description, or keywords..."
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
            href="/survey/add?returnTo=/dashboard?tab=survey"
            className="w-full sm:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Survey
          </Link>
        </div>

        {/* Surveys Grid */}
        {!mounted ? (
          <div className="text-center text-[#475569] py-8 font-ubuntu-mono">
            Loading...
          </div>
        ) : paginatedSurveys.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[#475569] font-ubuntu-mono">
                {searchQuery ? "No surveys found." : "You haven't submitted any surveys yet."}
              </p>
              {!searchQuery && (
                <Link 
                  href="/survey/add"
                  className="inline-block mt-4 text-[#1e4db7] hover:text-[#011638] font-oswald"
                >
                  Create your first survey →
                </Link>
              )}
            </div>
          ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {paginatedSurveys.map((survey) => (
                <ExtendableSurveyCard key={survey.id} survey={survey} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-2 gap-2">
              <p className="text-[#475569] font-ubuntu-mono text-sm">
                Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} surveys
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
      </div>
    </>
  );
}