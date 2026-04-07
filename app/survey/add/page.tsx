// Same logic as thesis

import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AddSurveyForm from "./addSurveyForm"; 

export default async function AddSurveyPage() {
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from("r_category")
    .select("id, r_category_name")
    .order("r_category_name");

  const { data: schools } = await supabase
    .from("school")
    .select("id, school_name")
    .order("school_name");

  return (
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8]" 
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}>
      <NavBar />
      <AddSurveyForm categories={categories || []} schools={schools || []} />
      <Footer />
    </div>
  );
}