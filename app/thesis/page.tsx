import NavBar from "@/components/navbar"; // import the nav bar
import Footer from "@/components/footer"; // import the footer
import ThesisData from "./thesis_data"; // import the thesis data component
import ThesisHeader from "./thesis_header"; // import the thesis header component
import { createClient } from "@/lib/supabase/server";

//main page (server component by default)
export default async function ThesisPage({
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
        <ThesisHeader
          initialQuery={params?.query}
          categories={categories || []}
          schools={schools || []}
          initialCategory={params?.category}
          initialSchool={params?.school}
        />
        <ThesisData searchParams={params} />
      </div>
      <Footer />
    </div>
  );
}
