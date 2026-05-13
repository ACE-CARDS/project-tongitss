"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/context/userContext";
import SurveyDescription from '@/app/survey/survey_description';
import SpotlightCard from "@/components/ui/SpotlightCard";
import PaginationNav from "@/components/ui/pagination"; // Updated import

// Helper function for responsive items per page
const getItemsPerPage = () => {
  if (typeof window === 'undefined') return 6;
  const width = window.innerWidth;
  if (width < 640) return 2;
  if (width < 1024) return 4;
  return 6;
};

// Extendable Card Component (Logic remains the same)
function ExtendableSurveyCard({ survey }: { survey: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPingColor = (status: string) => {
    switch (status) {
      case "accepted": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      case "archived": return "bg-gray-500";
      default: return "bg-gray-500";
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
        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">STATUS</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(survey.survey_status)} inline-flex items-center gap-2 shadow-sm`}>
            <span className="relative flex size-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${getPingColor(survey.survey_status)} opacity-75`}></span>
              <span className={`relative inline-flex size-2 rounded-full ${getPingColor(survey.survey_status)}`}></span>
            </span>
            {survey.survey_status?.toUpperCase()}
          </div>
        </div>

        <div className="mb-4 min-h-[80px]">
          {survey.survey_status === 'rejected' && survey.rejection_reason ? (
            <>
              <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">REJECTION REASON</h3>
              <p className="text-red-600 font-ubuntu-mono text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {survey.rejection_reason}
              </p>
            </>
          ) : <div className="invisible h-full" />}
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">Description</h3>
          <div className={!isExpanded ? "line-clamp-2" : ""}>
            <SurveyDescription description={survey.survey_desc} />
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-oswald font-semibold text-[#011638] uppercase tracking-wide mb-2">Author(s)</h3>
          <div className="flex flex-wrap gap-2">
            {survey.survey_author?.slice(0, isExpanded ? undefined : 2).map((sa: any, index: number) => {
              const author = sa.author;
              if (!author) return null;
              return (
                <div key={author.id || index} className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-ubuntu-mono">
                  {author.author_fname} {author.author_lname}
                </div>
              );
            })}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[#475569] block font-ubuntu-mono text-xs">Category:</span>
                <span className="font-ubuntu-mono text-[#011638] text-sm">{survey.r_category?.r_category_name || "Uncategorized"}</span>
              </div>
              <div>
                <span className="text-[#475569] block font-ubuntu-mono text-xs">School:</span>
                <span className="font-ubuntu-mono text-[#011638] text-sm">{survey.school?.school_name || "No School"}</span>
              </div>
            </div>
            {survey.survey_link && (
              <a href={survey.survey_link} target="_blank" rel="noopener noreferrer" className="text-[#0d21a1] hover:text-[#011638] text-sm underline inline-flex items-center gap-1 transition-colors font-ubuntu-mono">
                Take Survey
              </a>
            )}
          </div>
        )}

        <button onClick={() => setIsExpanded(!isExpanded)} className="mt-4 text-[#1e4db7] hover:text-[#011638] text-sm flex items-center gap-1 self-start">
          {isExpanded ? "View Less" : "View More"}
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
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.email) fetchUserSurveys();
  }, [user]);

  useEffect(() => {
    const filtered = searchQuery.trim() === "" 
      ? surveys 
      : surveys.filter(s => 
          s.survey_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.survey_desc.toLowerCase().includes(searchQuery.toLowerCase())
        );
    setFilteredSurveys(filtered);
    setCurrentPage(1);
  }, [searchQuery, surveys]);

  const fetchUserSurveys = async () => {
    try {
      const { data: author } = await supabase.from("author").select("id").eq("author_email", user?.email).single();
      if (author) {
        const { data, error } = await supabase
          .from("survey_author")
          .select(`survey:survey(*, r_category:r_category(*), school:school(*), survey_author:survey_author(author:author(*)))`)
          .eq("author", author.id);
        if (error) throw error;
        const fetched = data?.map(link => link.survey) || [];
        setSurveys(fetched);
        setFilteredSurveys(fetched);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const totalItems = filteredSurveys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const paginatedSurveys = filteredSurveys.slice(startIndex, startIndex + itemsPerPage);

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
            Add Survey
          </button>
        </div>

        {/* Blank */}
        <div className="min-h-[400px] w-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div>
        <h1 className="text-3xl font-oswald font-bold text-[#011638]">My Surveys</h1>
        <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">View and manage your submitted surveys</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-[#011638] rounded-lg bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
          />
          <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Link href="/survey/add?returnTo=/dashboard?tab=survey" className="bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg font-oswald flex items-center justify-center gap-2 transition-colors hover:bg-[#d9b237]">
          Add Survey
        </Link>
      </div>

      {/* Grid */}
      {!mounted ? (
        <p className="text-center py-8 font-ubuntu-mono">Loading...</p>
      ) : paginatedSurveys.length === 0 ? (
        <div className="text-center py-16 font-ubuntu-mono text-[#475569]">No surveys found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {paginatedSurveys.map((survey) => (
              <ExtendableSurveyCard key={survey.id} survey={survey} />
            ))}
          </div>

          {/* Integrated Pagination Component */}
          <PaginationNav
            currentPage={validCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}