import { createClient } from "@/lib/supabase/server";
import Link from "next/link"; //link to new page
import NavBar from "@/components/navbar"; //import navbar

//FOR DROPDOWN
//fetch categories
async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("r_category") //table
    .select("id, r_category_name") //fields
    .order("r_category_name"); //sort

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories || [];
}

//fetch schools
async function getSchools() {
  const supabase = await createClient();

  const { data: schools, error } = await supabase
    .from("school") //table
    .select("id, school_name") //fields
    .order("school_name"); //sort

  if (error) {
    console.error("Error fetching schools:", error);
    return [];
  }

  return schools || [];
}

//main page
export default async function AddThesisPage() {
  const categories = await getCategories();
  const schools = await getSchools();

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar />

      <main className="container mx-auto py-8 px-4 max-w-3xl">
        {/*header*/}
        <div className="mb-6">
          <Link
            href="/thesis"
            className="text-[#011638] hover:text-[#141414] inline-block mb-2"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Thesis</h1>
        </div>

        {/*form*/}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form className="space-y-6">
            {/*basic info*/}
            <div>
              <div>
                <div
                  style={{ backgroundColor: "#011638", color: "#eff0f2" }}
                  className="p-3 rounded-t-md"
                >
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                </div>

                <div
                  style={{ borderColor: "#011638" }}
                  className="border-2 border-t-2 rounded-b-md p-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="thesis-title"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Thesis Title <span className="text-[#eec643]">*</span>
                        </label>
                        <input
                          type="text"
                          id="thesis-title"
                          name="thesis-title"
                          maxLength={100}
                          placeholder="Enter thesis title"
                          className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="abstract"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Abstract <span className="text-[#eec643]">*</span>
                        </label>
                        <textarea
                          id="abstract"
                          name="abstract"
                          rows={4}
                          maxLength={1000}
                          placeholder="Enter thesis abstract"
                          className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="keywords"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Keywords <span className="text-[#eec643]">*</span>
                        </label>
                        <input
                          type="text"
                          id="keywords"
                          name="keywords"
                          maxLength={50}
                          placeholder="Enter keywords separated by commas"
                          className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*author*/}
            <div>
              <div>
                <div
                  style={{ backgroundColor: "#011638", color: "#eff0f2" }}
                  className="p-3 rounded-t-md"
                >
                  <h2 className="text-lg font-semibold">Author</h2>
                </div>

                <div
                  style={{ borderColor: "#011638" }}
                  className="border-2 border-t-2 rounded-b-md p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="First Name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        First Name <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="First Name"
                        maxLength={50}
                        className="text-gray-700 w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      />
                      <label
                        htmlFor="Last Name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Last Name <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        maxLength={50}
                        className="text-gray-700 w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      />
                      <label
                        htmlFor="Email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Email"
                        maxLength={100}
                        className="text-gray-700 w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      />
                    </div>
                  </div>
                  {/* Add button */}
                  <button
                    type="button"
                    className="text-[#0d21a1] hover:text-[#011638] mt-2"
                  >
                    + Add another author
                  </button>
                </div>
              </div>
            </div>

            {/*classification*/}
            <div>
              <div>
                <div
                  style={{ backgroundColor: "#011638", color: "#eff0f2" }}
                  className="p-3 rounded-t-md"
                >
                  <h2 className="text-lg font-semibold">Classification</h2>
                </div>

                <div
                  style={{ borderColor: "#011638" }}
                  className="border-2 border-t-2 rounded-b-md p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Category <span className="text-[#eec643]">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.r_category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="school"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        School <span className="text-[#eec643]">*</span>
                      </label>
                      <select
                        id="school"
                        name="school"
                        className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a school
                        </option>
                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.school_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*date*/}
            <div>
              <div>
                <div
                  style={{ backgroundColor: "#011638", color: "#eff0f2" }}
                  className="p-3 rounded-t-md"
                >
                  <h2 className="text-lg font-semibold">Date</h2>
                </div>

                <div
                  style={{ borderColor: "#011638" }}
                  className="border-2 border-t-2 rounded-b-md p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Thesis Date <span className="text-[#eec643]">*</span>
                      </label>

                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*location*/}
            <div>
              <div>
                <div
                  style={{ backgroundColor: "#011638", color: "#eff0f2" }}
                  className="p-3 rounded-t-md"
                >
                  <h2 className="text-lg font-semibold">Location</h2>
                </div>

                <div
                  style={{ borderColor: "#011638" }}
                  className="border-2 border-t-2 rounded-b-md p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="physical"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Physical Copy Location
                      </label>

                      <input
                        type="text"
                        id="physical"
                        name="physical"
                        maxLength={20}
                        placeholder="e.g., Library Section A"
                        className="text-gray-700 w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      />

                      <label
                        htmlFor="digital"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Digital Copy Link
                      </label>

                      <input
                        type="text"
                        id="digital"
                        name="digital"
                        maxLength={20}
                        placeholder="e.g., www.researchgate.com"
                        className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/*privacy checkbox*/}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                className="mt-1 accent-[#eec643]"
              />
              <label htmlFor="privacy" className="text-sm text-gray-600">
                I acknowledge and consent that the organization will collect,
                use, and process the information provided in this form for
                research documentation and archival purposes, in accordance with
                the Data Privacy Act.
              </label>
            </div>

            {/*end buttons*/}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Link
                href="/thesis"
                className="px-4 py-2 text-[#011638] hover:text-[#141414]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="px-4 py-2 bg-[#0d21a1] text-[#eff0f2] rounded hover:bg-[#141414] font-semibold"
              >
                <Link href="/thesis/add/confirm">Submit Thesis</Link>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
