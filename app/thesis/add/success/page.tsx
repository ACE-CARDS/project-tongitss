import Link from "next/link";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

// Main export 
export default function SuccessPage() {
  return (
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-screen flex flex-col" //default bg
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
        backgroundSize: "20px 20px" 
      }}>
      
      <NavBar />
      
      <main className="flex-1 container mx-auto py-16 px-4 max-w-2xl text-center">
        
        {/* White card */}
        <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-8">
          
          {/* Green circle with checkmark */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">

            {/* Checkmark SVG */}
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          {/* Heading & Sub */}
          <h1 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
            Thesis Submitted Successfully!
          </h1>
          
          <p className="text-[#475569] font-ubuntu-mono mb-6">
            Your thesis has been added to the collection.
          </p>
          
          {/* For Button */}
          <div className="flex gap-4 justify-center">
            
            {/* Browse Theses */}
            <Link
              href="/thesis" // Bak to thesis landing page
              className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald"
            >
              Browse Theses
            </Link>
            
            {/* Add Another */}
            <Link
              href="/thesis/add" // Link to add thesis form for 2nd input
              className="px-6 py-2 text-[#011638] border border-[#011638] rounded-lg hover:bg-[#f0f0f0] transition-colors font-oswald"
            >
              Add Another
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}