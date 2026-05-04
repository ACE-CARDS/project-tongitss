import Link from "next/link";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function SuccessPage() {
  return (
    <>
    <NavBar />
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col" 
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}>
      
      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center">
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] overflow-hidden">
          <div className="h-2 bg-[#011638]" />

          <div className="p-10">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          
          <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
            Survey Submitted Successfully!
          </h1>
          
          <p className="text-[#475569] font-ubuntu-mono mb-6">
            Your survey will be reviewed and published shortly.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/survey"
              className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald"
            >
              Browse Surveys
            </Link>
            
            <Link
              href="/survey/add"
              className="px-6 py-2 text-[#011638] border border-[#011638] rounded-lg hover:bg-[#f0f0f0] transition-colors font-oswald"
            >
              Add Another
            </Link>
          </div>
        </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}