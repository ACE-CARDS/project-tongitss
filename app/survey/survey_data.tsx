// Same logic as thesis

import { createClient } from "@/utils/supabase/server";
import SurveyHeader from "./survey_header";
import ClientPagination from './client-pagination';

export default async function SurveyData({
  searchParams,
}: {
  searchParams: {
    page?: string;
    query?: string;
    category?: string;
    school?: string;
    year?: string | string[];
  };
}) {
  const supabase = await createClient();
  
  await supabase.rpc('archive_expired_surveys');
  
  const currentPage = parseInt(searchParams?.page || "1");
  
  const q = searchParams?.query?.trim();
  const categoryId = searchParams?.category?.trim();
  const schoolId = searchParams?.school?.trim();
  
  const yearParams = searchParams?.year;
  const selectedYears = yearParams 
    ? Array.isArray(yearParams) 
      ? yearParams.map(y => parseInt(y)).filter(y => !isNaN(y))
      : [parseInt(yearParams)].filter(y => !isNaN(y))
    : [];

  // Fetch categories and schools for the header
  const [categoriesResult, schoolsResult] = await Promise.all([
    supabase
      .from("r_category")
      .select("id, r_category_name")
      .order("r_category_name", { ascending: true }),
    supabase
      .from("school")
      .select("id, school_name")
      .order("school_name", { ascending: true })
  ]);

  const categories = categoriesResult.data || [];
  const schools = schoolsResult.data || [];

  // Fetch available years
  const { data: yearData } = await supabase
    .from("survey")
    .select("survey_start");

  const availableYears = yearData && yearData.length > 0
    ? [...new Set(yearData
        .map(s => {
          const date = new Date(s.survey_start);
          return !isNaN(date.getFullYear()) ? date.getFullYear() : null;
        })
        .filter(year => year !== null)
      )].sort((a, b) => b - a)
    : [];

  // Build the query - same as admin but only show "accepted" surveys
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
    .eq("survey_status", "accepted")  // Only show accepted surveys
    .order("created_at", { ascending: false }); // Same as admin - newest first

  // Apply filters - same logic as admin
  if (categoryId) {
    query = query.eq("r_category", categoryId);
  }
  if (schoolId) {
    query = query.eq("school", schoolId);
  }

  const { data: fetchedSurveys, error } = await query;

  let filteredSurveys = fetchedSurveys || [];

  // Filter by years - same as admin
  if (selectedYears.length > 0) {
    filteredSurveys = filteredSurveys.filter((s: any) => {
      const surveyDate = new Date(s.survey_start);
      const surveyYear = surveyDate.getFullYear();
      return !isNaN(surveyYear) && selectedYears.includes(surveyYear);
    });
  }

  // Search filtering - same as admin
  if (q) {
    const tokens = q
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

  if (error) {
    console.error("Error fetching surveys:", error);
  }

  return (
    <>
      <SurveyHeader
        categories={categories}
        schools={schools}
        years={availableYears}
        initialQuery={q || ""}
        initialCategory={categoryId || ""}
        initialSchool={schoolId || ""}
        initialYears={selectedYears}
      />

      <ClientPagination 
        allSurveys={filteredSurveys} 
        currentPage={currentPage} 
      />
    </>
  );
}