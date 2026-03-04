import { createClient } from "@/lib/supabase/server"; // supabase client
import Link from "next/link";

// fetch thesis data
export default async function ThesisData({
  searchParams,
}: {
  searchParams: {
    page?: string;
    query?: string;
    category?: string;
    school?: string;
  };
}) {
  const supabase = await createClient();

  // apply search filter when query parameter is present
  const q = searchParams?.query?.trim();
  const categoryId = searchParams?.category?.trim();
  const schoolId = searchParams?.school?.trim();

  // fetch all theses from the DB (we'll filter in-memory when a query is present)
  let baseQuery = supabase
    .from("thesis") //table
    .select(
      `
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
    `,
    ) //fields
    .order("thesis_date", { ascending: false }); // sort

  if (categoryId) {
    baseQuery = baseQuery.eq("r_category", categoryId);
  }

  if (schoolId) {
    baseQuery = baseQuery.eq("school", schoolId);
  }

  const { data: fetchedTheses, error } = await baseQuery;

  // if there's a search query, perform a case-insensitive in-memory search
  let theses = fetchedTheses || [];
  if (q && theses.length) {
    // support multiple comma-separated search tokens; treat tokens as OR
    const tokens = q
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.toLowerCase());

    theses = theses.filter((t: any) => {
      let hay = "";
      hay += t.thesis_title ?? "";
      hay += " " + (t.thesis_abstract ?? "");
      hay += " " + (t.thesis_keyword ?? "");
      hay += " " + (t.r_category?.r_category_name ?? "");
      hay += " " + (t.school?.school_name ?? "");
      if (t.thesis_author && Array.isArray(t.thesis_author)) {
        t.thesis_author.forEach((ta: any) => {
          const a = ta.author;
          hay += " " + (a?.author_fname ?? "") + " " + (a?.author_lname ?? "");
        });
      }

      const hayLower = hay.toLowerCase();
      return tokens.some((token) => hayLower.includes(token));
    });
  }

  if (error) {
    console.error("Error fetching theses:", error);
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading theses: {error.message}
      </div>
    );
  }

  // case hwen theses is empty
  if (!theses || theses.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No theses found.</div>
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
                      const middleInitial = author.author_minit
                        ? ` ${author.author_minit}.`
                        : "";
                      return (
                        <div
                          key={author.id}
                          className="bg-[#eec643] text-[#011638] px-3 py-1 rounded-full text-sm inline-flex items-center gap-1 font-medium"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {author.author_fname} {middleInitial}{" "}
                          {author.author_lname}
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-[#141414] opacity-50 text-sm">
                      No authors listed
                    </span>
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
                    {thesis.thesis_abstract || "No abstract available"}
                  </p>
                  {thesis.thesis_abstract &&
                    thesis.thesis_abstract.length > 150 && (
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
                  {thesis.thesis_keyword
                    ?.split(",")
                    .map((keyword: string, index: number) => (
                      <span
                        key={index}
                        className="bg-[#0d21a1] text-[#eff0f2] px-2 py-1 rounded text-xs"
                      >
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
                      {new Date(thesis.thesis_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#141414] block">Category:</span>
                    <span className="font-medium text-[#011638]">
                      {thesis.r_category?.r_category_name || "Uncategorized"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#141414] block">School:</span>
                    <span className="font-medium text-[#011638]">
                      {thesis.school?.school_name || "No School"}
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
                      <span className="text-[#141414] opacity-50">
                        Not Available
                      </span>
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
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-[#141414] opacity-50">
                        Not Available
                      </span>
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
