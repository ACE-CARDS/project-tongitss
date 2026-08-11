import { createClient } from "@/utils/supabase/server";
import ThesisHeader from "./thesis_header";
import ClientPagination from './client-pagination'; 

// Main export
export default async function ThesisData({
  searchParams, 
}: {
  searchParams: {
    page?: string;      
    query?: string;     
    thematicArea?: string; 
    school?: string;    
    year?: string | string[]; 
  };
}) {
 
  const supabase = await createClient();
  
  // Get page number from URL: if none, start at page 1
  const currentPage = parseInt(searchParams?.page || "1");
  
  // Filter values
  const q = searchParams?.query?.trim();
  const thematicAreaId = searchParams?.thematicArea?.trim(); 
  const schoolId = searchParams?.school?.trim(); 
  const yearParams = searchParams?.year;

  // Year parameter to array
  const selectedYears = yearParams 
    ? Array.isArray(yearParams) 
      ? yearParams.map(y => parseInt(y)).filter(y => !isNaN(y)) // To allow mult years
      : [parseInt(yearParams)].filter(y => !isNaN(y)) // Single year
    : []; // No year filter

  // Fetch thesis dates
  // Fetch thematic areas and schools for the header
  const [thematicAreasResult, schoolsResult] = await Promise.all([
    supabase
      .from("r_thematic_area")
      .select("id, r_thematic_name")
      .order("r_thematic_name", { ascending: true }),
    supabase
      .from("school")
      .select("id, school_name")
      .order("school_name", { ascending: true })
  ]);

  const thematicAreas = thematicAreasResult.data || [];
  const schools = schoolsResult.data || [];

  // Fetch available years
  const { data: yearData } = await supabase
  .from("thesis")
  .select("thesis_date")
  .eq("thesis_status", "accepted");

  const availableYears = yearData && yearData.length > 0
    ? [...new Set(yearData.map(t => t.thesis_date))].sort((a, b) => b - a)
    : [];

  // Fetch thesis keywords for search suggestions
  const { data: keywordsData } = await supabase
    .from("thesis")
    .select("thesis_keyword") // Only need keyword field
    .eq("thesis_status", "accepted");

  // Get keywwords
  const allKeywords = keywordsData
    ?.flatMap(t => t.thesis_keyword?.split(',').map((k: string) => k.trim()).filter(Boolean) || []) //separate by comma
    .filter((value, index, self) => self.indexOf(value) === index) // Unique values
    .sort() || []; // Sort

  // Thesis query
  let query = supabase
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
      r_thematic_area (         
        id,
        r_thematic_name
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
    .eq("thesis_status", "accepted")  // Only show accepted 
    .order("created_at", { ascending: false }); // Newest first

  // If filter selected
  // Thematic Area filter
  if (thematicAreaId) {
     query = query.eq("r_thematic_area", thematicAreaId);
  }

  // School filter
  if (schoolId) {
    query = query.eq("school", schoolId);
  }

  // Fetch theses
  const { data: fetchedTheses, error } = await query;

  let filteredTheses = fetchedTheses || [];

  // Year filtering
  if (selectedYears.length > 0) {
    filteredTheses = filteredTheses.filter((t: any) => {
      return selectedYears.includes(t.thesis_date);
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
      hay += " " + (t.r_thematic_area?.r_thematic_name ?? ""); // Thematic Area name
      hay += " " + (t.school?.school_name ?? "");     // School name
      
      // Author
      if (t.thesis_author && Array.isArray(t.thesis_author)) {
        t.thesis_author.forEach((ta: any) => {
          const b = ta.author;
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
        thematicAreas={thematicAreas}         
        schools={schools}               
        years={availableYears}                
        initialQuery={q || ""}                  
        initialThematicArea={thematicAreaId || ""}     
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