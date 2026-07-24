// for dashboard tab
"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(true); // loading state

  // filter dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // count of pending surveys
  const [pendingCount, setPendingCount] = useState(0);
  
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

  // fetch surveys based on filters
  useEffect(() => {
    const fetchSurveys = async () => {
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

      if (selectedCategory) {
        query = query.eq("r_category", selectedCategory);
      }
      if (selectedSchool) {
        query = query.eq("school", selectedSchool);
      }
      if (selectedStatuses.length > 0) {
        query = query.in("survey_status", selectedStatuses);
      }

      const { data: fetchedSurveys, error } = await query;

      if (error) {
        console.error("Error fetching surveys:", error);
      } else {
        let filteredSurveys = fetchedSurveys || [];

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
        
        const pending = fetchedSurveys?.filter((s: any) => s.survey_status === "pending").length || 0;
        setPendingCount(pending);
      }
      
      setLoading(false);
    };

    fetchSurveys();
  }, [supabase, selectedCategory, selectedSchool, selectedStatuses, selectedYears, searchQuery]);

  // update count
  const handlePendingCountChange = (newCount: number) => {
    setPendingCount(newCount);
  };

  // reset filters on change
  const handleFilterChange = (filters: {
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
    setCurrentPage(1); // back to first page
  };

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
        onFilterChange={handleFilterChange}
      />

      {/* pagination */}
      <AdminClientPagination
        allSurveys={surveys}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPendingCountChange={handlePendingCountChange}
      />
    </div>
  );
}