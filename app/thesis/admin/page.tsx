import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import BackButton from "@/components/backButton";
import ThesisAdminWrapper from "./thesis_admin_wrapper";

export default async function AdminThesisPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    school?: string;
    year?: string | string[];
    status?: string;
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
    <>
    <NavBar />
    <div
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8]"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: 'fixed'
      }}
    >

      <div className="container mx-auto py-8 px-4 max-w-7xl min-h-screen">
        <div className="mb-4">
          <BackButton />
        </div>
        <ThesisAdminWrapper />
      </div>
    </div>
    <Footer />
    </>
  );
}