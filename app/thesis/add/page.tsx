import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AddThesisForm from "./addThesisForm";

// Main export
export default async function AddThesisPage() {
  const supabase = await createClient();
  
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
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8]" //default bg
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}>

      <NavBar />
      
      <AddThesisForm categories={categories || []} schools={schools || []} />

      <Footer />
    </div>
  );
}