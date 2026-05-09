import { createClient } from "@/utils/supabase/server";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import AddThesisForm from "./addThesisForm";

// Main export
export default async function AddThesisPage({ searchParams, }: { searchParams: Promise<{ returnTo?: string }> }) {
  const supabase = await createClient();
  const { returnTo } = await searchParams; // Get returnTo from URL
  
  // Fetch categories
  const { data: categories } = await supabase
    .from("r_category")                    // From 'r_category' table
    .select("id, r_category_name")         // Cols
    .order("r_category_name");              // Sort 

  // Fetch schools
  const { data: schools } = await supabase
    .from("school")                         // From 'school' table
    .select("id, school_name")              // Cols
    .order("school_name");                   // Sort

  return (
    <div className="min-h-screen flex flex-col items-center">
        <NavBar />
        <div 
          className="w-full max-w-[1920px] flex flex-col min-h-screen bg-[#fbfaf8]"
          style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: "20px 20px",
            backgroundAttachment: 'fixed'
          }}>
          <main className="flex-grow w-full">
            {/* Pass returnTo component */}
            <AddThesisForm 
              categories={categories || []} 
              schools={schools || []} 
              returnTo={returnTo}
            />
          </main>
        </div>
        <Footer />
      </div>
      );
    }