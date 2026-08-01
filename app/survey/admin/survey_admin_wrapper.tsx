// for dashboard tab
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import AdminSurveyHeader from "./admin_survey_header";
import AdminClientPagination from "./admin_client_pagination";

// type definitions
interface Category {
  id: string;
  r_category_name: string;
}

interface School {
  id: string;
  school_name: string;
}

export default function SurveyAdminWrapper() {
  const supabase = createClient(); // supa client

  const [surveys, setSurveys] = useState<any[]>([]); // to store fetched surveys
  const [allSurveys, setAllSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // loading state

  // filter dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Counts for all statuses
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  
  // Filter states
  const [currentPage, setCurrentPage] = useState(1); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // fetch data
  useEffect(() => {
    const fetchInitialData = async () => {
      const [categoriesRes, schoolsRes, yearsRes] = await Promise.all([
        supabase.from("r_category").select("id, r_category_name").order("r_category_name"),
        supabase.from("school").select("id, school_name").order("school_name"),
        supabase.from("survey").select("survey_start"),
        supabase.from("survey").select("survey_title, survey_desc"),
      ]);

      // set for dropdown
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (schoolsRes.data) setSchools(schoolsRes.data);

      if (yearsRes.data && yearsRes.data.length > 0) {
        const years = [...new Set(
          yearsRes.data
            .map((s: any) => {
              const date = new Date(s.survey_start);
              return !isNaN(date.getFullYear()) ? date.getFullYear() : null;
            })
            .filter((year: number | null) => year !== null)
        )].sort((a, b) => b - a);
        setAvailableYears(years);
      }
    };

    fetchInitialData();
  }, [supabase]);

  // fetch all surveys for counting
  useEffect(() => {
    const fetchAllSurveys = async () => {
      setLoading(true);

      let query = supabase
        .from("survey")
        .select(
          `
          id,
          survey_title,
          survey_desc,
          survey_start,
          survey_end,
          survey_link,
          survey_respondents,
          max_respondents,
          survey_status,
          rejection_reason,
          r_category (
            id,
            r_category_name
          ),
          school (
            id,
            school_name
          ),
          survey_author (
            author (
              id,
              author_fname,
              author_lname,
              author_minit,
              author_email,
              mem_id,
              scholar
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      const { data: fetchedSurveys, error } = await query;

      if (error) {
        console.error("Error fetching surveys:", error);
        setAllSurveys([]);
        setSurveys([]);
      } else {
        setAllSurveys(fetchedSurveys || []);
        setSurveys(fetchedSurveys || []);
        calculateCounts(fetchedSurveys || []);
      }
      
      setLoading(false);
    };

    fetchAllSurveys();
  }, [supabase]);

  // Calculate counts
  const calculateCounts = (data: any[]) => {
    if (!data || data.length === 0) {
      setPendingCount(0);
      setAcceptedCount(0);
      setRejectedCount(0);
      setArchivedCount(0);
      return;
    }

    let baseSurveys = [...data];
    
    if (selectedCategory) {
      baseSurveys = baseSurveys.filter((s: any) => s.r_category?.id === selectedCategory);
    }
    if (selectedSchool) {
      baseSurveys = baseSurveys.filter((s: any) => s.school?.id === selectedSchool);
    }
    if (selectedYears.length > 0) {
      baseSurveys = baseSurveys.filter((s: any) => {
        const surveyDate = new Date(s.survey_start);
        const surveyYear = surveyDate.getFullYear();
        return !isNaN(surveyYear) && selectedYears.includes(surveyYear);
      });
    }
    if (searchQuery) {
      const tokens = searchQuery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      baseSurveys = baseSurveys.filter((s: any) => {
        let hay = "";
        hay += s.survey_title ?? "";
        hay += " " + (s.survey_desc ?? "");
        hay += " " + (s.r_category?.r_category_name ?? "");
        hay += " " + (s.school?.school_name ?? "");
        hay += " " + (s.survey_respondents ?? "");
        if (s.survey_author && Array.isArray(s.survey_author)) {
          s.survey_author.forEach((sa: any) => {
            const a = sa.author;
            hay += " " + (a?.author_fname ?? "") + " " + (a?.author_lname ?? "");
          });
        }
        const hayLower = hay.toLowerCase();
        return tokens.some((token) => hayLower.includes(token));
      });
    }
    
    setPendingCount(baseSurveys.filter((s: any) => s.survey_status === "pending").length);
    setAcceptedCount(baseSurveys.filter((s: any) => s.survey_status === "accepted").length);
    setRejectedCount(baseSurveys.filter((s: any) => s.survey_status === "rejected").length);
    setArchivedCount(baseSurveys.filter((s: any) => s.survey_status === "archived").length);
  };

  // Apply filters
  useEffect(() => {
    if (!allSurveys.length) return;

    // Filter surveys with status filter
    let filteredSurveys = [...allSurveys];

    if (selectedCategory) {
      filteredSurveys = filteredSurveys.filter((s: any) => s.r_category?.id === selectedCategory);
    }
    if (selectedSchool) {
      filteredSurveys = filteredSurveys.filter((s: any) => s.school?.id === selectedSchool);
    }
    if (selectedStatuses.length > 0) {
      filteredSurveys = filteredSurveys.filter((s: any) => 
        selectedStatuses.includes(s.survey_status)
      );
    }
    if (selectedYears.length > 0) {
      filteredSurveys = filteredSurveys.filter((s: any) => {
        const surveyDate = new Date(s.survey_start);
        const surveyYear = surveyDate.getFullYear();
        return !isNaN(surveyYear) && selectedYears.includes(surveyYear);
      });
    }
    if (searchQuery) {
      const tokens = searchQuery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      filteredSurveys = filteredSurveys.filter((s: any) => {
        let hay = "";
        hay += s.survey_title ?? "";
        hay += " " + (s.survey_desc ?? "");
        hay += " " + (s.r_category?.r_category_name ?? "");
        hay += " " + (s.school?.school_name ?? "");
        hay += " " + (s.survey_respondents ?? "");
        if (s.survey_author && Array.isArray(s.survey_author)) {
          s.survey_author.forEach((sa: any) => {
            const a = sa.author;
            hay += " " + (a?.author_fname ?? "") + " " + (a?.author_lname ?? "");
          });
        }
        const hayLower = hay.toLowerCase();
        return tokens.some((token) => hayLower.includes(token));
      });
    }

    setSurveys(filteredSurveys);
    
    calculateCounts(allSurveys);
  }, [allSurveys, selectedCategory, selectedSchool, selectedStatuses, selectedYears, searchQuery]);

  // reset filters on change
  const handleFilterChange = useCallback(
  (filters: {
    query?: string;
    category?: string;
    school?: string;
    years?: number[];
    statuses?: string[];
  }) => {
    if (filters.query !== undefined) setSearchQuery(filters.query);
    if (filters.category !== undefined) setSelectedCategory(filters.category);
    if (filters.school !== undefined) setSelectedSchool(filters.school);
    if (filters.years !== undefined) setSelectedYears(filters.years);
    if (filters.statuses !== undefined) setSelectedStatuses(filters.statuses);

    setCurrentPage(1);
  },
  []
);

  return (
    <div className="w-full">
      {/* header with filters */}
      <AdminSurveyHeader
        categories={categories}
        schools={schools}
        years={availableYears}
        initialQuery={searchQuery}
        initialCategory={selectedCategory}
        initialSchool={selectedSchool}
        initialYears={selectedYears}
        initialStatuses={selectedStatuses}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        rejectedCount={rejectedCount}
        archivedCount={archivedCount}
        onFilterChange={handleFilterChange}
      />

      {/* pagination */}
      <AdminClientPagination
        allSurveys={surveys}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}