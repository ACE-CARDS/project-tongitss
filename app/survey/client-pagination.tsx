// Same logic as thesis

"use client";

import { useState, useEffect } from "react";
import SurveyDescription from './survey_description';
import SpotlightCard from "@/components/SpotlightCard";
import { useRouter } from "next/navigation";

interface ClientPaginationProps {
  allSurveys: any[];
  currentPage: number;
}

const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 6;
  
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

export default function ClientPagination({ allSurveys, currentPage }: ClientPaginationProps) {
  const router = useRouter();
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [mounted, setMounted] = useState(false);
  
  // Local state
  const [currentPageLocal, setCurrentPageLocal] = useState(currentPage);

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync local page with prop when URL changes
  useEffect(() => {
    setCurrentPageLocal(currentPage);
  }, [currentPage]);

  const totalItems = allSurveys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPageLocal), totalPages || 1);
  
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSurveys = allSurveys.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
     if (page < 1 || page > totalPages) return;
    setCurrentPageLocal(page);
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    
    const scrollPosition = window.scrollY;
    router.replace(`?${params.toString()}`, { scroll: false });
    
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  // Get author display name from member or author table
  const getAuthorDisplayName = (author: any) => {
    if (author.mem_id && author.member) {
      const member = author.member;
      const middleInitial = member.mem_minit ? ` ${member.mem_minit}.` : "";
      return {
        name: `${member.mem_fname}${middleInitial} ${member.mem_lname}`,
        email: member.mem_email
      };
    }
    
    // Fallback to author table data
    const middleInitial = author.author_minit ? ` ${author.author_minit}.` : "";
    return {
      name: `${author.author_fname}${middleInitial} ${author.author_lname}`,
      email: author.author_email
    };
  };

  const getProcessedAuthors = (survey: any) => {
    if (!survey.survey_author || survey.survey_author.length === 0) {
      return [];
    }

    const authorsWithData = survey.survey_author.map((sa: any) => {
      const author = sa.author;
      if (!author) return null;
      
      let memberData = null;
      if (author.mem_id && survey.members_data) {
        memberData = survey.members_data.find((m: any) => m.id === author.mem_id);
      }
      
      return {
        ...author,
        member: memberData,
        displayName: getAuthorDisplayName({ ...author, member: memberData })
      };
    }).filter((a: any) => a !== null);

    // Sort alphabetically
    authorsWithData.sort((a: any, b: any) => {
      const lastNameA = a.member?.mem_lname || a.author_lname;
      const lastNameB = b.member?.mem_lname || b.author_lname;
      return lastNameA.localeCompare(lastNameB);
    });

    return authorsWithData;
  };

  return (
    <>
      {(!paginatedSurveys || paginatedSurveys.length === 0) ? (
        <div className="text-center text-[#475569] py-8 font-ubuntu-mono">
          No surveys found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {paginatedSurveys.map((survey: any) => {
              const processedAuthors = getProcessedAuthors(survey);
              
              return (
              <SpotlightCard
                key={survey.id}
                className="border border-[#011638] rounded-xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm"
                spotlightColor="rgba(239, 240, 242, 0.16)"
              >
                <div className="bg-[#011638] px-6 py-4 min-h-[110px] flex items-center">
                  <h2 className="text-xl font-oswald font-bold text-[#fbfaf8] line-clamp-3 break-words overflow-hidden">
                    {survey.survey_title}
                  </h2>
                </div>

                <div className="px-6 py-4 flex flex-col flex-1">
                  <div className="mb-4 min-h-[60px]">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Author(s)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {processedAuthors.length > 0 ? (
                        processedAuthors.map((author: any, index: number) => {
                          const displayInfo = author.displayName;
                          
                          return (
                            <a
                              key={`${survey.id}-${author.id || 'no-id'}-${index}`}
                              href={`mailto:${displayInfo.email}`}
                              className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-ubuntu-mono hover:bg-[#d9b237] hover:shadow-md transition-all duration-200 cursor-pointer group"
                              title={`Email: ${displayInfo.email}`}
                            >
                              <svg
                                className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                              {displayInfo.name}
                            </a>
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
                      Description
                    </h3>
                    <div>
                      <SurveyDescription description={survey.survey_desc} />
                    </div>
                  </div>

                  <div className="mb-4 min-h-[70px]">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Keywords
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {survey.survey_keyword
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
                        <span className="text-[#475569] block font-ubuntu-mono">Start Date:</span>
                        <span className="font-ubuntu-mono text-[#011638]">
                          {new Date(survey.survey_start).toLocaleDateString(
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
                        <span className="text-[#475569] block font-ubuntu-mono">End Date:</span>
                        <span className="font-ubuntu-mono text-[#011638]">
                          {new Date(survey.survey_end).toLocaleDateString(
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
                          {survey.r_category?.r_category_name || "Uncategorized"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#475569] block font-ubuntu-mono">School:</span>
                        <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal">
                          {survey.school?.school_name || "No School"}
                        </span>
                      </div>
                    </div>
                  </div>

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
                          <span 
                            key={index} 
                            className="bg-[#1e4db7] text-[#fbfaf8] px-2 py-1 rounded text-xs font-ubuntu-mono"
                          >
                            {criteria.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-[#475569] opacity-50 text-sm font-ubuntu-mono">No specific criteria</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Survey Link
                    </h3>
                    <div>
                      {survey.survey_link ? (
                        <a
                          href={survey.survey_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono"
                        >
                          Take Survey
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
                        <span className="text-[#475569] opacity-50 font-ubuntu-mono">
                          No link available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            );
            })}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 mb-2 gap-2">
            <p className="text-[#475569] font-ubuntu-mono text-sm">
              Showing {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} surveys
            </p>
            <p className="text-[#475569] font-ubuntu-mono text-sm">
              Page {validCurrentPage} of {totalPages || 1}
            </p>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center space-x-2 mt-8 mb-4">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
                  validCurrentPage === 1
                    ? "text-[#94a3b8]"
                    : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638] cursor-pointer"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];

                  if (totalPages <= 4) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    const showLeft = validCurrentPage <= 2;
                    const showRight = validCurrentPage >= totalPages - 1;

                    if (showLeft) {
                      pages.push(1, 2, "...", totalPages);
                    } else if (showRight) {
                      pages.push(1, "...", totalPages - 1, totalPages);
                    } else {
                      pages.push(
                        1,
                        "...",
                        validCurrentPage,
                        "...",
                        totalPages
                      );
                    }
                  }

                  return pages.map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
                          page === validCurrentPage
                            ? "bg-[#011638] text-[#fbfaf8] font-bold cursor-pointer"
                            : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638] cursor-pointer"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  );
                })()}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className={`px-3 py-2 rounded-lg font-ubuntu-mono text-sm transition-colors ${
                  validCurrentPage === totalPages
                    ? "text-[#94a3b8]"
                    : "text-[#011638] hover:bg-[#eec643] hover:text-[#011638] cursor-pointer"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}