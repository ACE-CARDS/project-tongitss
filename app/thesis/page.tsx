import { createClient } from "@/lib/supabase/server"; // supabase client
import Link from "next/link"; // to link to another page
import NavBar from "@/components/navbar"; // import the nav bar

// fetch thesis data
async function ThesisData({}: {searchParams: {page?: string}}) {
  const supabase = await createClient();

  const { data: theses, error } = await supabase
    .from("thesis") //table
    .select(`
      id,
      thesis_title,
      thesis_abstract,
      thesis_keyword,
      thesis_date,
      thesis_phys,
      thesis_digi,
      r_category (
        id,
        r_category_name
      ),
      school (
        id,
        school_name
      ),
      thesis_author (
        author (
          id,
          author_fname,
          author_lname,
          author_minit,
          author_email
        )
      )
    `) //fields
    .order('thesis_date', {ascending: false}) // sort

  if (error) {
    console.error('Error fetching theses:', error);
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading theses: {error.message}
      </div>
    );
  }

  // case hwen theses is empty
  if (!theses || theses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No theses found.
      </div>
    );
  }

  //thesis card grid
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {theses.map((thesis: any) => (

          //for each card
          <div 
            key={thesis.id} 
            className="border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 bg-[white] flex flex-col h-full hover:scale-102 hover:z-10"
          >
            {/*header with title*/}
            <div className="bg-[#011638] px-6 py-4 min-h-[90px] flex items-center">
              <h2 className="text-xl font-semibold text-[#eff0f2] line-clamp-2">
                {thesis.thesis_title}
              </h2>
            </div>

            {/*content*/}
            <div className="px-6 py-4 flex flex-col flex-1">
              {/*author*/}
              <div className="mb-4 min-h-[60px]">
                <h3 className="text-xs font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Author(s)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {thesis.thesis_author && thesis.thesis_author.length > 0 ? (
                    thesis.thesis_author.map((ta: any, index: number) => {
                      const author = ta.author;
                      const middleInitial = author.author_minit ? ` ${author.author_minit}.` : '';
                      return (
                        <div 
                          key={author.id}
                          className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          {author.author_fname} {middleInitial} {author.author_lname}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[#141414] opacity-50 text-sm">No authors listed</span>
                  )}
                </div>
              </div>

              {/*abstract*/}
              <div className="mb-4 flex-1">
                <h3 className="text-xs font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Abstract
                </h3>
                <div className="relative">
                  <p className="text-sm text-[#141414] line-clamp-3 leading-relaxed min-h-[63px]">
                    {thesis.thesis_abstract || 'No abstract available'}
                  </p>
                  {thesis.thesis_abstract && thesis.thesis_abstract.length > 150 && (
                    <Link
                      href="/thesis/readmore"
                      className="text-[#0d21a1] text-xs font-medium hover:text-[#011638] mt-1 inline-block transition-colors"
                    >
                      Read more →
                    </Link>
                  )}
                </div>
              </div>

              {/*keywords*/}
              <div className="mb-4 min-h-[70px]">
                <h3 className="text-xs font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-1">
                  {thesis.thesis_keyword?.split(',').map((keyword: string, index: number) => (
                    <span key={index} className="bg-[#0d21a1] text-[#eff0f2] px-2 py-1 rounded text-xs">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/*details*/}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">

                  <div>
                    <span className="text-[#141414] block">Thesis Date:</span>
                    <span className="font-medium text-[#011638]">
                      {new Date(thesis.thesis_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#141414] block">Category:</span>
                    <span className="font-medium text-[#011638]">
                      {thesis.r_category?.r_category_name || 'Uncategorized'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#141414] block">School:</span>
                    <span className="font-medium text-[#011638]">
                      {thesis.school?.school_name || 'No School'}
                    </span>
                  </div>

                </div>
              </div>

              {/*copies*/}
              <div className="mt-auto">
                <h3 className="text-xs font-semibold text-[#011638] uppercase tracking-wide mb-2">
                  Available Copies
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-[#141414] block">Physical Copy:</span>
                    {thesis.thesis_phys ? (
                      <div className="text-[#141414] font-medium">
                        <span className="text-[#141414]">
                          {thesis.thesis_phys}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#141414] opacity-50">Not Available</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[#141414] block">Digital Copy:</span>
                    {thesis.thesis_digi ? (
                      <a 
                        href={thesis.thesis_digi} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#0d21a1] hover:text-[#011638] underline inline-flex items-center gap-1 transition-colors"
                      >
                        View Digital Copy
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    ) : (
                      <span className="text-[#141414] opacity-50">Not Available</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

//filter
async function FilterButton() {
  
  return ( //SOURCE: https://codepen.io/mattlake/pen/GRNzqoO
          // https://flowbite.com/docs/customize/icons/
          // https://www.w3schools.com/graphics/svg_stroking.asp
      <button className="bg-[#011638] text-[#eff0f2] px-4 py-2 rounded-lg hover:bg-[#0d21a1] transition-colors flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
        </svg>
        Filter
      </button>
  );
}

//main page
export default function ThesisPage({searchParams}: {searchParams: {page?:string}}) {
  return (
    <div className="">
      <NavBar/> 

      <div className="container mx-auto py-8 px-4 max-w-7xl bg-[#eff0f2] min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#011638]">Scholar Theses Collection</h1>
          <p className="text-[#141414] mt-2">Browse all available theses</p>
          
          {/*filter, search, and add*/}
          <div className="flex items-center gap-3 mt-4">
            <FilterButton/> 

            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search theses..."
                  //SOURCE: https://codepen.io/mattlake/pen/GRNzqoO
                  // https://flowbite.com/docs/customize/icons/
                  // https://www.w3schools.com/graphics/svg_stroking.asp
                  className="w-full px-4 py-2 pl-10 border border-[#0d21a1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#011638] bg-white text-[#141414]"/>
                <svg className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>

            <Link
              href="/thesis/add"
              className="bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b43c] transition-colors flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Thesis
            </Link>
          </div>
        </div>
        
        <ThesisData searchParams={searchParams}/>
      </div>
    </div>
  );
}