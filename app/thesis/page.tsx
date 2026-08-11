import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import ThesisData from "./thesis_data";
import { createClient } from "@/utils/supabase/server";
import BackButton from "@/components/ui/backButton"; // For back button
import ThesisPageClient from "./thesis-page-client";

// Main export
export default async function ThesisPage({
  searchParams, 
}: {
  // Define type for searchParams
  searchParams: Promise<{ 
    page?: string;    
    query?: string;   
    thematicArea?: string; 
    school?: string;  
    year?: string | string[]; // Year filter that can accept mult values
  }>;
}) {
  
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch thematic areas and schools
  const [{ data: thematicAreas }, { data: schools }] = await Promise.all([
    // Thematic Areas
    supabase
      .from("r_thematic_area")           // From 'r_thematic_area' table
      .select("id, r_thematic_name") // Cols
      .order("r_thematic_name", { ascending: true }), // Sort 
    
    // Schools
    supabase
      .from("school")                // From 'school' table
      .select("id, school_name")     // Cols
      .order("school_name", { ascending: true }), // Sort
  ]);

  return (
    <ThesisPageClient>
    <NavBar />
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] overflow-hidden" //default bg 
     style={{
       backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
       backgroundSize: "20px 20px",
       backgroundAttachment: "fixed"
     }}>

      {/* Content */}
      <div className="container mx-auto py-8 px-4 max-w-7xl min-h-screen">
  
        <div className="mb-4">
          <BackButton /> {/* Back Button */}
        </div>

        <ThesisData searchParams={params} />
      </div>

    </div>
    <Footer />
    </ThesisPageClient>
  );
}