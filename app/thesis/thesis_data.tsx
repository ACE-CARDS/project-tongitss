import { createClient } from "@/lib/supabase/server";
import ThesisHeader from "./thesis_header";
import ClientPagination from './client-pagination'; 

// Main export
export default async function ThesisData({
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
  
  // Get page number from URL: if none, start at page 1
  const currentPage = parseInt(searchParams?.page || "1");
  
  // Filter values
  const q = searchParams?.query?.trim();
  const categoryId = searchParams?.category?.trim(); 
  const schoolId = searchParams?.school?.trim(); 
  const yearParams = searchParams?.year;

  // Year parameter to array
  const selectedYears = yearParams 
    ? Array.isArray(yearParams) 
      ? yearParams.map(y => parseInt(y)).filter(y => !isNaN(y)) // To allow mult years
      : [parseInt(yearParams)].filter(y => !isNaN(y)) // Single year
    : []; // No year filter

  // Fetch thesis dates
  const { data: yearData, error: yearError } = await supabase
    .from("thesis") // from thesis table
    .select("thesis_date"); // Cols

  if (yearError) {
    console.error("Error fetching years:", yearError);
  }

  // Unique years and sort descending
  const availableYears = yearData && yearData.length > 0
    ? [...new Set(yearData // 'Set' to remove duplicates
        .map(t => {
          const date = new Date(t.thesis_date);
          return !isNaN(date.getFullYear()) ? date.getFullYear() : null; // Get year
        })
        .filter(year => year !== null) // Remove invalid dates
      )].sort((a, b) => b - a) // Sort
    : []; // Empty if no data

  // Fetch thesis keywords for search suggestions
  const { data: keywordsData } = await supabase
    .from("thesis")
    .select("thesis_keyword"); // Only need keyword field

  // Get keywwords
  const allKeywords = keywordsData
    ?.flatMap(t => t.thesis_keyword?.split(',').map((k: string) => k.trim()).filter(Boolean) || []) //separate by comma
    .filter((value, index, self) => self.indexOf(value) === index) // Unique values
    .sort() || []; // Sort

  // Fetch categories
  const { data: categories } = await supabase
    .from("r_category")
    .select("id, r_category_name") // Get ID and name
    .order("r_category_name"); // Sort alphabetically

  // Fetch schools
  const { data: schools } = await supabase
    .from("school")
    .select("id, school_name") // Get ID and name
    .order("school_name"); // Sort alphabetically

  // Thesis query
  let baseQuery = supabase
    .from("thesis") // Table
    .select( // Cols
      `
      id,                     
      thesis_title,         
      thesis_abstract,        
      thesis_keyword,     
      thesis_date,          
      thesis_phys,      
      thesis_digi,         
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
          mem_id
        )
      )
    `
    )
    .eq("thesis_status", "accepted") 
    .order("thesis_date", { ascending: false }); // Sort

  // If filter selected
  // Category filter
  if (categoryId) {
    baseQuery = baseQuery.eq("r_category", categoryId);
  }

  // School filter
  if (schoolId) {
    baseQuery = baseQuery.eq("school", schoolId); 
  }

  // Fetch theses
  const { data: fetchedTheses, error } = await baseQuery;

  let filteredTheses = fetchedTheses || [];
  
  
  // Collect all unique mem_ids from authors to fetch member data
  const memIds = new Set();
  filteredTheses.forEach((thesis: any) => {
    if (thesis.thesis_author && Array.isArray(thesis.thesis_author)) {
      thesis.thesis_author.forEach((ta: any) => {
        if (ta.author?.mem_id) {
          memIds.add(ta.author.mem_id);
        }
      });
    }
  });

  // Fetch member data for all authors with mem_id
  let membersData: any[] = [];
  if (memIds.size > 0) {
    const { data: members, error: membersError } = await supabase
      .from("member")
      .select("id, mem_fname, mem_lname, mem_minit, mem_email")
      .in("id", Array.from(memIds));
    
    if (!membersError && members) {
      membersData = members;
    } else if (membersError) {
      console.error("Error fetching member data:", membersError);
    }
  }

  // Attach member data to each thesis for easy access
  const thesesWithMemberData = filteredTheses.map((thesis: any) => ({
    ...thesis,
    members_data: membersData
  }));

  filteredTheses = thesesWithMemberData;

  // Year filtering
  if (selectedYears.length > 0) {
    filteredTheses = filteredTheses.filter((t: any) => {
      const thesisDate = new Date(t.thesis_date);
      const thesisYear = thesisDate.getFullYear();
      return !isNaN(thesisYear) && selectedYears.includes(thesisYear); 
    });
  }
  
  // Text search filter
  if (q) {
    // Split query by commas
    const tokens = q
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase());

    // Filter theses containing tokens
    filteredTheses = filteredTheses.filter((t: any) => {

      // Searchable text
      let hay = "";
      hay += t.thesis_title ?? "";                    // Title
      hay += " " + (t.thesis_abstract ?? "");         // Abstract
      hay += " " + (t.thesis_keyword ?? "");          // Keywords
      hay += " " + (t.thesis_phys ?? "");               // Physical copy
      hay += " " + (t.r_category?.r_category_name ?? ""); // Category name
      hay += " " + (t.school?.school_name ?? "");     // School name
      
      // Author
      if (t.thesis_author && Array.isArray(t.thesis_author)) {
        t.thesis_author.forEach((ta: any) => {
          const b = ta.author;
          // Include member data in search if available
          if (b?.mem_id && t.members_data) {
            const member = t.members_data.find((m: any) => m.id === b.mem_id);
            if (member) {
              hay += " " + (member.mem_fname ?? "") + " " + (member.mem_lname ?? "");
            }
          }
          hay += " " + (b?.author_fname ?? "") + " " + (b?.author_lname ?? "");
        });
      }

      // To cater case-insensitive search
      const hayLower = hay.toLowerCase();
      return tokens.some((token) => hayLower.includes(token)); // True if token match
    });
  }

  // Error handling/message
  if (error) {
    console.error("Error fetching theses:", error);
    return (
      <div className="bg-[#b52f3f] bg-opacity-10 border border-[#b52f3f] text-[#9c2929] px-4 py-3 rounded">
        Error loading theses: {error.message}
      </div>
    );
  }

  return (
    <>
      {/* Pass filter data & options to header */}
      <ThesisHeader
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
        allTheses={filteredTheses} 
        currentPage={currentPage} 
      />
    </>
  );
}