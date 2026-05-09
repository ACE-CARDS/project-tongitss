// Same logic as thesis

import { createClient } from "@/lib/supabase/server";
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

  const { data: yearData, error: yearError } = await supabase
    .from("survey")
    .select("survey_start");

  if (yearError) {
    console.error("Error fetching years:", yearError);
  }

  const availableYears = yearData && yearData.length > 0
    ? [...new Set(yearData
        .map(s => {
          const date = new Date(s.survey_start);
          return !isNaN(date.getFullYear()) ? date.getFullYear() : null;
        })
        .filter(year => year !== null)
      )].sort((a, b) => b - a)
    : [];

  const { data: keywordsData } = await supabase
    .from("survey")
    .select("survey_keyword")
    .eq("survey_status", "accepted");

  const allKeywords = keywordsData
    ?.flatMap(s => s.survey_keyword?.split(',').map((k: string) => k.trim()).filter(Boolean) || [])
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort() || [];

  const { data: categories } = await supabase
    .from("r_category")
    .select("id, r_category_name")
    .order("r_category_name");

  const { data: schools } = await supabase
    .from("school")
    .select("id, school_name")
    .order("school_name");

  let baseQuery = supabase
    .from("survey")
    .select(
      `
      id,
      survey_title,
      survey_desc,
      survey_keyword,
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
          author_email
        )
      )
    `
    )
    .eq("survey_status", "accepted")  // Show ongoing survyes
    .order("survey_start", { ascending: false });

  if (categoryId) {
    baseQuery = baseQuery.eq("r_category", categoryId);
  }

  if (schoolId) {
    baseQuery = baseQuery.eq("school", schoolId);
  }

  const { data: fetchedSurveys, error } = await baseQuery;

  console.log("Fetched surveys:", fetchedSurveys);
  console.log("Error:", error);

  let filteredSurveys = fetchedSurveys || [];
  
  if (selectedYears.length > 0) {
    filteredSurveys = filteredSurveys.filter((s: any) => {
      const surveyDate = new Date(s.survey_start);
      const surveyYear = surveyDate.getFullYear();
      return !isNaN(surveyYear) && selectedYears.includes(surveyYear);
    });
  }
  
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
      hay += " " + (s.survey_keyword ?? "");
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
    return (
      <div className="bg-[#b52f3f] bg-opacity-10 border border-[#b52f3f] text-[#9c2929] px-4 py-3 rounded">
        Error loading surveys: {error.message}
      </div>
    );
  }

  return (
    <>
      <SurveyHeader
        categories={categories || []}
        schools={schools || []}
        years={availableYears}
        initialQuery={q || ""}
        initialCategory={categoryId || ""}
        initialSchool={schoolId || ""}
        initialYears={selectedYears}
        availableKeywords={allKeywords}
      />

      <ClientPagination 
        allSurveys={filteredSurveys} 
        currentPage={currentPage} 
      />
    </>
  );
}
