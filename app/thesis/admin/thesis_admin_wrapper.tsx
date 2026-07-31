"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import AdminThesisHeader from "./admin_thesis_header";
import AdminClientPagination from "./admin_client_pagination";

interface Category {
  id: string;
  r_category_name: string;
}

interface School {
  id: string;
  school_name: string;
}

export default function ThesisAdminWrapper() {
  const supabase = createClient();

  const [theses, setTheses] = useState<any[]>([]);
  const [allTheses, setAllTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);

  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [categoriesRes, schoolsRes, yearsRes, keywordsRes] = await Promise.all([
        supabase.from("r_category").select("id, r_category_name").order("r_category_name"),
        supabase.from("school").select("id, school_name").order("school_name"),
        supabase.from("thesis").select("thesis_date"),
        supabase.from("thesis").select("thesis_keyword"),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (schoolsRes.data) setSchools(schoolsRes.data);

      if (yearsRes.data && yearsRes.data.length > 0) {
        const years = [...new Set(
          yearsRes.data
            .map((s: any) => {
              const date = new Date(s.thesis_date);
              return !isNaN(date.getFullYear()) ? date.getFullYear() : null;
            })
            .filter((year: number | null) => year !== null)
        )].sort((a, b) => b - a);
        setAvailableYears(years);
      }

      if (keywordsRes.data) {
        const keywords = keywordsRes.data
          ?.flatMap((s: any) =>
            s.thesis_keyword?.split(",").map((k: string) => k.trim()).filter(Boolean) || []
          )
          .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index)
          .sort();
        setAvailableKeywords(keywords);
      }
    };

    fetchInitialData();
  }, [supabase]);

  useEffect(() => {
    const fetchAllTheses = async () => {
      setLoading(true);

      let query = supabase
        .from("thesis")
        .select(
          `
          id,
          thesis_title,
          thesis_abstract,
          thesis_keyword,
          thesis_date,
          thesis_phys,
          thesis_digi,
          thesis_status,
          rejection_reason,
          r_category (
            id,
            r_category_name
          ),
          school (
            id,
            school_name
          ),
          thesis_author (
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

      const { data: fetchedTheses, error } = await query;

      if (error) {
        console.error("Error fetching theses:", error);
        setAllTheses([]);
        setTheses([]);
      } else {
        setAllTheses(fetchedTheses || []);
        setTheses(fetchedTheses || []);
        calculateCounts(fetchedTheses || []);
      }
      
      setLoading(false);
    };

    fetchAllTheses();
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

    let baseTheses = [...data];
    
    if (selectedCategory) {
      baseTheses = baseTheses.filter((t: any) => t.r_category?.id === selectedCategory);
    }
    if (selectedSchool) {
      baseTheses = baseTheses.filter((t: any) => t.school?.id === selectedSchool);
    }
    if (selectedYears.length > 0) {
      baseTheses = baseTheses.filter((t: any) => {
        const thesisDate = new Date(t.thesis_date);
        const thesisYear = thesisDate.getFullYear();
        return !isNaN(thesisYear) && selectedYears.includes(thesisYear);
      });
    }
    if (searchQuery) {
      const tokens = searchQuery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      baseTheses = baseTheses.filter((t: any) => {
        let hay = "";
        hay += t.thesis_title ?? "";
        hay += " " + (t.thesis_abstract ?? "");
        hay += " " + (t.thesis_keyword ?? "");
        hay += " " + (t.thesis_phys ?? "");
        hay += " " + (t.r_category?.r_category_name ?? "");
        hay += " " + (t.school?.school_name ?? "");
        if (t.thesis_author && Array.isArray(t.thesis_author)) {
          t.thesis_author.forEach((ta: any) => {
            const a = ta.author;
            hay += " " + (a?.author_fname ?? "") + " " + (a?.author_lname ?? "");
          });
        }
        const hayLower = hay.toLowerCase();
        return tokens.some((token) => hayLower.includes(token));
      });
    }
    
    setPendingCount(baseTheses.filter((t: any) => t.thesis_status === "pending").length);
    setAcceptedCount(baseTheses.filter((t: any) => t.thesis_status === "accepted").length);
    setRejectedCount(baseTheses.filter((t: any) => t.thesis_status === "rejected").length);
    setArchivedCount(baseTheses.filter((t: any) => t.thesis_status === "archived").length);
  };

  // Apply filters
  useEffect(() => {
    if (!allTheses.length) return;

    // Filter theses with status filter
    let filteredTheses = [...allTheses];

    if (selectedCategory) {
      filteredTheses = filteredTheses.filter((t: any) => t.r_category?.id === selectedCategory);
    }
    if (selectedSchool) {
      filteredTheses = filteredTheses.filter((t: any) => t.school?.id === selectedSchool);
    }
    if (selectedStatuses.length > 0) {
      filteredTheses = filteredTheses.filter((t: any) => 
        selectedStatuses.includes(t.thesis_status)
      );
    }
    if (selectedYears.length > 0) {
      filteredTheses = filteredTheses.filter((t: any) => {
        const thesisDate = new Date(t.thesis_date);
        const thesisYear = thesisDate.getFullYear();
        return !isNaN(thesisYear) && selectedYears.includes(thesisYear);
      });
    }
    if (searchQuery) {
      const tokens = searchQuery
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase());

      filteredTheses = filteredTheses.filter((t: any) => {
        let hay = "";
        hay += t.thesis_title ?? "";
        hay += " " + (t.thesis_abstract ?? "");
        hay += " " + (t.thesis_keyword ?? "");
        hay += " " + (t.thesis_phys ?? "");
        hay += " " + (t.r_category?.r_category_name ?? "");
        hay += " " + (t.school?.school_name ?? "");
        if (t.thesis_author && Array.isArray(t.thesis_author)) {
          t.thesis_author.forEach((ta: any) => {
            const a = ta.author;
            hay += " " + (a?.author_fname ?? "") + " " + (a?.author_lname ?? "");
          });
        }
        const hayLower = hay.toLowerCase();
        return tokens.some((token) => hayLower.includes(token));
      });
    }

    setTheses(filteredTheses);
    
    // Calculate counts
    calculateCounts(allTheses);
  }, [allTheses, selectedCategory, selectedSchool, selectedStatuses, selectedYears, searchQuery]);

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
    setCurrentPage(1);
  };

  return (
    <div className="w-full">
      <AdminThesisHeader
        categories={categories}
        schools={schools}
        years={availableYears}
        initialQuery={searchQuery}
        initialCategory={selectedCategory}
        initialSchool={selectedSchool}
        initialYears={selectedYears}
        initialStatuses={selectedStatuses}
        availableKeywords={availableKeywords}
        pendingCount={pendingCount}
        acceptedCount={acceptedCount}
        rejectedCount={rejectedCount}
        archivedCount={archivedCount}
        onFilterChange={handleFilterChange}
      />

      <AdminClientPagination
        allTheses={theses}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}