import NavBar from "@/components/navbar"; // import the nav bar
import Footer from "@/components/footer"; // import the footer
import ThesisData from "./thesis_data"; // import the thesis data component
import ThesisHeader from "./thesis_header"; // import the thesis header component

//main page (server component by default)
export default async function ThesisPage({ searchParams }: { searchParams: Promise<{ page?: string; query?: string }> }) {
  const params = await searchParams;

  return (
    <div className="">
      <NavBar />

      <div className="container mx-auto py-8 px-4 max-w-7xl bg-[#eff0f2] min-h-screen">
        <ThesisHeader initialQuery={params?.query} />
        <ThesisData searchParams={params} />
      </div>
      <Footer />
    </div>
  );
}