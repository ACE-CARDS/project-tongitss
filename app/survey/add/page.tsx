import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import NavBar from "@/components/navbar";

//FOR DROPDOWN
//fetch categories
async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("r_category")
    .select("id, r_category_name")
    .order("r_category_name");

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
    .from("school")
    .select("id, school_name")
    .order("school_name");

  if (error) {
    console.error("Error fetching schools:", error);
    return [];
  }

  return schools || [];
}

//main page
export default async function AddSurveyPage() {
  const categories = await getCategories();
  const schools = await getSchools();

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar/>
      
      <main className="container mx-auto py-8 px-4 max-w-3xl">
        {/*header*/}
        <div className="mb-6">
          <Link href="/survey" className="text-[#011638] hover:text-[#141414] inline-block mb-2">
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Survey</h1>
        </div>

        {/*form*/}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form className="space-y-6">

            {/*basic info*/}
            <div>
              <div 
                style={{ backgroundColor: '#011638', color: '#eff0f2' }} 
                className="p-3 rounded-t-md">
                <h2 className="text-lg font-semibold">Basic Information</h2>
              </div>
              
              <div style={{ borderColor: '#011638' }} className="border-2 border-t-2 rounded-b-md p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Title <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      maxLength={100}
                      placeholder="Enter survey title"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-[#eec643]">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      maxLength={1000}
                      placeholder="Enter survey description"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>

                  <div>
                    <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
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
              
            {/*author - same simple format as thesis*/}
            <div>
              <div 
                style={{ backgroundColor: '#011638', color: '#eff0f2' }} 
                className="p-3 rounded-t-md">
                <h2 className="text-lg font-semibold">Author</h2>
              </div>
              
              <div style={{ borderColor: '#011638' }} className="border-2 border-t-2 rounded-b-md p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="First Name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="First Name"
                      maxLength={50}
                      className="text-gray-700 w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                    
                    <label htmlFor="Last Name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      maxLength={50}
                      className="text-gray-700 w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                    
                    <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      maxLength={100}
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>
                </div>
                
                {/* Add button */}
                <button 
                  type="button"
                  className="text-[#0d21a1] hover:text-[#011638] mt-2">
                  + Add another author
                </button>
              </div>
            </div>

            {/*survey details - new section for survey-specific fields*/}
            <div>
              <div 
                style={{ backgroundColor: '#011638', color: '#eff0f2' }} 
                className="p-3 rounded-t-md">
                <h2 className="text-lg font-semibold">Survey Details</h2>
              </div>
              
              <div style={{ borderColor: '#011638' }} className="border-2 border-t-2 rounded-b-md p-4">
                <div className="space-y-4">
                  {/* Date Range */}
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>

                  {/* Survey Link */}
                  <div>
                    <label htmlFor="survey_link" className="block text-sm font-medium text-gray-700 mb-1">
                      Survey Link <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="text"
                      id="survey_link"
                      name="survey_link"
                      maxLength={200}
                      placeholder="Enter survey URL"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>

                  {/* Target Respondents */}
                  <div>
                    <label htmlFor="respondents" className="block text-sm font-medium text-gray-700 mb-1">
                      Target Respondents <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="text"
                      id="respondents"
                      name="respondents"
                      maxLength={200}
                      placeholder="Enter respondent criteria separated by commas"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>

                  {/* Max Respondents */}
                  <div>
                    <label htmlFor="max_respondents" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Respondents
                    </label>
                    <input
                      type="number"
                      id="max_respondents"
                      name="max_respondents"
                      min="1"
                      placeholder="e.g., 100"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/*classification*/}
            <div>
              <div 
                style={{ backgroundColor: '#011638', color: '#eff0f2' }} 
                className="p-3 rounded-t-md">
                <h2 className="text-lg font-semibold">Classification</h2>
              </div>
              
              <div style={{ borderColor: '#011638' }} className="border-2 border-t-2 rounded-b-md p-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-[#eec643]">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.r_category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                      School <span className="text-[#eec643]">*</span>
                    </label>
                    <select
                      id="school"
                      name="school"
                      className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#011638]"
                      defaultValue=""
                    >
                      <option value="" disabled>Select a school</option>
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

            {/*privacy checkbox*/}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                className="mt-1 accent-[#eec643]"
              />
              <label htmlFor="privacy" className="text-sm text-gray-600">
                I acknowledge and consent that the organization will collect, use, and process the information provided in this form for research documentation and archival purposes, in accordance with the Data Privacy Act.
              </label>
            </div>

            {/*end buttons*/}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Link
                href="/survey"
                className="px-4 py-2 text-[#011638] hover:text-[#141414]">
                Cancel
              </Link>

              <button
                type="submit"
                className="px-4 py-2 bg-[#0d21a1] text-[#eff0f2] rounded hover:bg-[#141414] font-semibold">
                <Link href="/survey/add/confirm">
                  Submit Survey
                </Link>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}