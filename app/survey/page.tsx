import NavBar from "@/components/navbar"; // import the nav bar
import Footer from "@/components/footer"; // import the footer
import SurveyData from "./survey_data"; // import the survey data component
import SurveyHeader from "./survey_header"; // import the survey header component
import { createClient } from "@/lib/supabase/server";

//main page (server component by default)
export default async function SurveyPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    school?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: schools }] = await Promise.all([
    supabase
      .from("r_category")
      .select("id, r_category_name")
      .order("r_category_name", { ascending: true }),
    supabase
      .from("school")
      .select("id, school_name")
      .order("school_name", { ascending: true }),
  ]);

  return (
    <div className="">
      <NavBar />

      <div className="container mx-auto py-8 px-4 max-w-7xl bg-[#eff0f2] min-h-screen">
        <SurveyHeader 
          initialQuery={params?.query}
          categories={categories || []}
          schools={schools || []}
          initialCategory={params?.category}
          initialSchool={params?.school} 
        />
        <SurveyData searchParams={params} />
      </div>
      <Footer />
    </div>
  );
}