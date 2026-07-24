// Same logic as thesis

"use client";

import { useState, useEffect } from "react";
import SurveyDescription from './survey_description';
import SpotlightCard from "@/components/ui/SpotlightCard";
import { useRouter } from "next/navigation";
import PaginationNav from "@/components/ui/pagination";
import GradientLine from "@/components/ui/gradientLine";
import Link from "next/link";

import { LuCircleArrowRight } from "react-icons/lu";
import { FaRegCalendar } from "react-icons/fa6";
import { FaRegAddressBook } from "react-icons/fa6";
import { FaRegFolderClosed } from "react-icons/fa6";
import { FaSchool } from "react-icons/fa6";
import Image from "next/image";

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
      
      return {
        ...author,
        displayName: getAuthorDisplayName(author)
      };
    }).filter((a: any) => a !== null);

    // Sort alphabetically by last name
    authorsWithData.sort((a: any, b: any) => {
      return a.author_lname.localeCompare(b.author_lname);
    });

    return authorsWithData;
  };

  return (
    <>
      {(!paginatedSurveys || paginatedSurveys.length === 0) ? (
        <div className="text-center w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
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
                className="border border-[#011638] rounded-4xl overflow-hidden transition-all duration-300 bg-[#fbfaf8] flex flex-col h-full hover:shadow-xl hover:scale-[1.02] hover:z-10 shadow-sm"
                spotlightColor="rgba(239, 240, 242, 0.16)"
              >
                <div className="px-6 py-4 min-h-[110px] flex flex-col">
                  <h2 className="text-3xl font-oswald font-bold text-[#011638] line-clamp-3 break-words overflow-hidden">
                    {survey.survey_title}
                  </h2>
                  <GradientLine start/>
                </div>


                <div className="px-6 pb-4 flex-col flex">
                  <div className="">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Description
                    </h3>
                    <div>
                      <SurveyDescription description={survey.survey_desc} />
                    </div>
                  </div>

                  <div className="flex flex-col border-y-2 border-[#a6a6a6]">
                    <div className="flex items-center gap-1 border-b-2 border-[#a6a6a6] py-1">
                      <FaRegCalendar className="text-[#011638]" />

                      <span className="border-r-2 border-[#a6a6a6] pr-3 font-oswald uppercase text-[12px] leading-none"> 
                        Deadline 
                      </span>

                      <span className="font-ubuntu-mono pl-1 text-[14px] text-[#011638] flex flex-wrap items-center gap-1">
                        {new Date(survey.survey_start).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      -
                      <span className="font-ubuntu-mono pl-1 text-[14px] text-[#011638] flex flex-wrap items-center gap-1">
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

                    
                    <div className="flex flex-col gap-1 border-b-2 border-[#a6a6a6] py-2">
                      <div className="flex items-center gap-1">
                        <FaRegAddressBook className="text-[#011638]" />

                        <span className="font-oswald uppercase text-[12px] leading-none">
                          Target Respondents 
                          {survey.max_respondents && (
                            <span className="ml-2 text-[#1e4db7] font-normal">
                              (Max: {survey.max_respondents})
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 ml-5">
                        {survey.survey_respondents ? (
                          survey.survey_respondents.split(',').map((criteria: string, index: number) => (
                            <span 
                              key={index} 
                              className="bg-[#1e4db7] text-[#fbfaf8] px-[9px] py-1 rounded-full text-xs font-ubuntu-mono break-words overflow-hidden"
                            >
                              {criteria.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#475569] opacity-50 text-sm font-ubuntu-mono">No specific criteria</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 border-b-2 border-[#a6a6a6] py-1">
                      <FaRegFolderClosed className="text-[#011638]" />
                      
                      <span className="border-r-2 border-[#a6a6a6] pr-3 font-oswald uppercase text-[12px] leading-none"> 
                        Category 
                      </span>

                      <span className="font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal text-[14px] pl-1">
                        {survey.r_category?.r_category_name || "Uncategorized"}
                      </span>
                    </div>

                    
                    <div className="flex items-baseline gap-1 py-1">
                      <span className="items-center flex gap-1">
                        <FaSchool className="text-[#011638] shrink-0" />
                        
                        <span className="font-oswald uppercase text-[12px] leading-none pr-2"> 
                          School 
                        </span>
                      </span>

                      <span className="border-l-2 border-[#a6a6a6] pl-1 font-ubuntu-mono text-[#011638] break-words max-w-full whitespace-normal text-[14px]">
                        {survey.school?.school_name || "No School"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 mb-16 min-h-[60px]">
                    <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">
                      Author(s)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {processedAuthors.length > 0 ? (
                        processedAuthors.map((author: any, index: number) => {
                          const displayInfo = author.displayName;
                          const isAceCards = author.mem_id;
                          
                          return (
                            <a
                          key={`${survey.id}-${author.id || "no-id"}-${index}`}
                          href={`mailto:${displayInfo.email}`}
                          title={`Email: ${displayInfo.email}`}
                          className="
                            relative
                            overflow-hidden
                            bg-[#eec643]
                            text-[#011638]
                            px-3
                            py-1
                            rounded-full
                            text-sm
                            inline-flex
                            items-center
                            gap-2
                            font-ubuntu-mono
                            hover:bg-[#d9b237]
                            hover:shadow-md
                            transition-all
                            duration-300
                            cursor-pointer
                            group
                          "
                        >
                          {/* Shine Effect */}
                          {isAceCards && (
                            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
                              <span
                                className="
                                  absolute
                                  top-0
                                  left-[-150%]
                                  h-full
                                  w-8
                                  rotate-12
                                  bg-white/60
                                  blur-sm
                                  transition-all
                                  duration-700
                                  group-hover:left-[150%]
                                "
                              />
                            </span>
                          )}

                          {isAceCards ? (
                          <Image
                            src="/assets/logos/ACE CARDS logo.png"
                            alt="ACE CARDS"
                            width={18}
                            height={18}
                            className="relative z-10 object-contain shrink-0 transition-all duration-300 group-hover:scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                          />
                        ) : (
                          <svg
                            className="relative z-10 w-4 h-4 group-hover:scale-110 transition-transform"
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
                        )}

                          {/* Author Name */}
                          <span className="relative z-10">
                            {displayInfo.name}
                          </span>
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

                  <Link href={survey.survey_link || "#"} target="_blank" className="mt-4">
                    <div className="group font-bold cursor-pointer absolute rounded-t-4xl text-[15px] bottom-0 left-0 w-full bg-[#011638] text-[#fbfaf8] py-3 items-center justify-between flex gap-2 px-3 pl-6">
                      {survey.survey_link ? (
                        <>
                          <span>Take the Survey</span>
                          <LuCircleArrowRight className="size-10 group-hover:translate-x-1 transition transform duration-200"/>
                        </>
                        ) : (<span>No link available</span>)}

                    </div>
                  </Link>
                </div>
              </SpotlightCard>
            );
            })}
          </div>
          
          {/* Pagination */}
            <PaginationNav currentPage={currentPageLocal} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
        </>
      )}
    </>
  );
}