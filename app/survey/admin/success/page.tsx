// same code as /survey/admin/success/page.tsx 

import Link from "next/link";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import SuccessPageWrapper from "@/components/SuccessPageWrapper";

export default function SuccessPage() {
  return (
    <SuccessPageWrapper>
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
            Survey Edited Successfully!
          </h1>
          
          {/* 1 option only after submitting */}
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard#survey" // back to dashboard survey tab
              className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald"
            >
              Browse All Surveys
            </Link>
            
          </div>
        </div>
      </main>
    </div>
    <Footer />
    </>
    </SuccessPageWrapper>
  );
}