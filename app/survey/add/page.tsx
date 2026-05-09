// Same logic as thesis

import { createClient } from "@/utils/supabase/server";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AddSurveyForm from "./addSurveyForm"; 

export default async function AddSurveyPage({ searchParams, }: { searchParams: Promise<{ returnTo?: string }> }) {
  const supabase = await createClient();
  const { returnTo } = await searchParams; // Get returnTo from URL
  
  const { data: categories } = await supabase
    .from("r_category")
    .select("id, r_category_name")
    .order("r_category_name");

  const { data: schools } = await supabase
    .from("school")
    .select("id, school_name")
    .order("school_name");

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
        <AddSurveyForm 
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