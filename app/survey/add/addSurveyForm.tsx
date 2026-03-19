// same logic as thesis
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  r_category_name: string;
}

interface School {
  id: string;
  school_name: string;
}

interface Author {
  id: number;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  email?: string;
}

interface AddSurveyFormProps {
  categories: Category[];
  schools: School[];
}

export default function AddSurveyForm({ categories, schools }: AddSurveyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [authors, setAuthors] = useState<Author[]>([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [availableCategories, setAvailableCategories] = useState<Category[]>(categories);
  const [availableSchools, setAvailableSchools] = useState<School[]>(schools);
  
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  useEffect(() => {
    const savedDraft = sessionStorage.getItem("surveyDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
        const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
        const keywordsInput = document.querySelector('input[name="keywords"]') as HTMLInputElement | null;
        const startDateInput = document.querySelector('input[name="start_date"]') as HTMLInputElement | null;
        const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement | null;
        const surveyLinkInput = document.querySelector('input[name="survey_link"]') as HTMLInputElement | null;
        const respondentsInput = document.querySelector('input[name="respondents"]') as HTMLInputElement | null;
        const maxRespondentsInput = document.querySelector('input[name="max_respondents"]') as HTMLInputElement | null;

        if (titleInput) titleInput.value = draft.title || "";
        if (descriptionInput) descriptionInput.value = draft.description || "";
        if (keywordsInput) keywordsInput.value = draft.keywords || "";
        if (startDateInput) startDateInput.value = draft.start_date || "";
        if (endDateInput) endDateInput.value = draft.end_date || "";
        if (surveyLinkInput) surveyLinkInput.value = draft.survey_link || "";
        if (respondentsInput) respondentsInput.value = draft.respondents || "";
        if (maxRespondentsInput) maxRespondentsInput.value = draft.max_respondents || "";

        if (draft.category) {
          const categoryExists = availableCategories.some(c => c.id === draft.category);
          if (!categoryExists && draft.categoryName) {
            const tempCategory = {
              id: draft.category,
              r_category_name: draft.categoryName
            };
            setAvailableCategories(prev => [...prev, tempCategory]);
          }
          
          setTimeout(() => {
            const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement | null;
            if (categorySelect) categorySelect.value = draft.category;
          }, 100);
        }

        if (draft.school) {
          const schoolExists = availableSchools.some(s => s.id === draft.school);
          if (!schoolExists && draft.schoolName) {
            const tempSchool = {
              id: draft.school,
              school_name: draft.schoolName
            };
            setAvailableSchools(prev => [...prev, tempSchool]);
          }
          
          setTimeout(() => {
            const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement | null;
            if (schoolSelect) schoolSelect.value = draft.school;
          }, 100);
        }

        if (draft.authors?.length) {
          setAuthors(draft.authors.map((author: any, index: number) => ({
            id: index + 1,
            firstName: author.firstName,
            middleInitial: author.middleInitial,
            lastName: author.lastName,
            email: author.email
          })));

          setTimeout(() => {
            const firstNameInputs = document.querySelectorAll('input[name="firstName[]"]') as NodeListOf<HTMLInputElement>;
            const middleInitialInputs = document.querySelectorAll('input[name="middleInitial[]"]') as NodeListOf<HTMLInputElement>;
            const lastNameInputs = document.querySelectorAll('input[name="lastName[]"]') as NodeListOf<HTMLInputElement>;
            const emailInputs = document.querySelectorAll('input[name="email[]"]') as NodeListOf<HTMLInputElement>;

            draft.authors.forEach((author: any, index: number) => {
              if (firstNameInputs[index]) firstNameInputs[index].value = author.firstName || "";
              if (middleInitialInputs[index]) middleInitialInputs[index].value = author.middleInitial || "";
              if (lastNameInputs[index]) lastNameInputs[index].value = author.lastName || "";
              if (emailInputs[index]) emailInputs[index].value = author.email || "";
            });
          }, 100);
        }
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, [availableCategories, availableSchools]);

  const addAuthor = () => {
    setAuthors([...authors, { id: authors.length + 1 }]);
  };

  const removeAuthor = (id: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter(author => author.id !== id));
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const existingCategory = availableCategories.find(
        c => c.r_category_name.toLowerCase() === newCategoryName.toLowerCase()
      );

      if (existingCategory) {
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = existingCategory.id;
        }
        setShowNewCategory(false);
        setNewCategoryName("");
        return;
      }

      const { data: existingCategoryInDb } = await supabase
        .from("r_category")
        .select("id, r_category_name")
        .ilike("r_category_name", newCategoryName)
        .maybeSingle();

      if (existingCategoryInDb) {
        setAvailableCategories(prev => [...prev, existingCategoryInDb]);
        
        setTimeout(() => {
          const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
          if (categorySelect) {
            categorySelect.value = existingCategoryInDb.id;
          }
        }, 100);
        
        setShowNewCategory(false);
        setNewCategoryName("");
        return;
      }

      const { data: newCategory, error: categoryError } = await supabase
        .from("r_category")
        .insert({ r_category_name: newCategoryName })
        .select("id, r_category_name")
        .single();

      if (categoryError) throw categoryError;

      setAvailableCategories(prev => [...prev, newCategory]);

      setTimeout(() => {
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = newCategory.id;
        }
      }, 100);

      setShowNewCategory(false);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  const handleAddNewSchool = async () => {
    if (!newSchoolName.trim()) {
      alert("Please enter a school name");
      return;
    }

    try {
      const existingSchool = availableSchools.find(
        s => s.school_name.toLowerCase() === newSchoolName.toLowerCase()
      );

      if (existingSchool) {
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = existingSchool.id;
        }
        setShowNewSchool(false);
        setNewSchoolName("");
        return;
      }

      const { data: existingSchoolInDb } = await supabase
        .from("school")
        .select("id, school_name")
        .ilike("school_name", newSchoolName)
        .maybeSingle();

      if (existingSchoolInDb) {
        setAvailableSchools(prev => [...prev, existingSchoolInDb]);
        
        setTimeout(() => {
          const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
          if (schoolSelect) {
            schoolSelect.value = existingSchoolInDb.id;
          }
        }, 100);
        
        setShowNewSchool(false);
        setNewSchoolName("");
        return;
      }

      const { data: defaultProvince } = await supabase
        .from("province")
        .select("id")
        .limit(1)
        .single();

      const { data: newSchool, error: schoolError } = await supabase
        .from("school")
        .insert({ 
          school_name: newSchoolName,
          province: defaultProvince?.id || 1
        })
        .select("id, school_name")
        .single();

      if (schoolError) throw schoolError;

      setAvailableSchools(prev => [...prev, newSchool]);

      setTimeout(() => {
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = newSchool.id;
        }
      }, 100);

      setShowNewSchool(false);
      setNewSchoolName("");
    } catch (error) {
      console.error("Error adding school:", error);
      alert("Failed to add school. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      
      const titleInput = form.elements.namedItem("title") as HTMLInputElement | null;
      const descriptionInput = form.elements.namedItem("description") as HTMLTextAreaElement | null;
      const keywordsInput = form.elements.namedItem("keywords") as HTMLInputElement | null;
      const startDateInput = form.elements.namedItem("start_date") as HTMLInputElement | null;
      const endDateInput = form.elements.namedItem("end_date") as HTMLInputElement | null;
      const surveyLinkInput = form.elements.namedItem("survey_link") as HTMLInputElement | null;
      const respondentsInput = form.elements.namedItem("respondents") as HTMLInputElement | null;
      const maxRespondentsInput = form.elements.namedItem("max_respondents") as HTMLInputElement | null;
      const categorySelect = form.elements.namedItem("category") as HTMLSelectElement | null;
      const schoolSelect = form.elements.namedItem("school") as HTMLSelectElement | null;

      if (!titleInput?.value || !descriptionInput?.value || !keywordsInput?.value || 
          !startDateInput?.value || !endDateInput?.value || !surveyLinkInput?.value || !respondentsInput?.value) {
        throw new Error("Please fill in all required fields");
      }

      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      const minStartDate = new Date('2022-01-01');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < minStartDate) {
        throw new Error("Start date must be from 2022 onwards");
      }

      if (endDate <= startDate) {
        throw new Error("End date must be after start date");
      }

      if (!categorySelect?.value) {
        throw new Error("Please select a category");
      }
      const categoryId = categorySelect.value;

      if (!schoolSelect?.value) {
        throw new Error("Please select a school");
      }
      const schoolId = schoolSelect.value;

      const firstNameInputs = form.querySelectorAll('input[name="firstName[]"]') as NodeListOf<HTMLInputElement>;
      const lastNameInputs = form.querySelectorAll('input[name="lastName[]"]') as NodeListOf<HTMLInputElement>;
      const emailInputs = form.querySelectorAll('input[name="email[]"]') as NodeListOf<HTMLInputElement>;

      let validAuthors = 0;
      for (let i = 0; i < firstNameInputs.length; i++) {
        if (firstNameInputs[i]?.value && lastNameInputs[i]?.value && emailInputs[i]?.value) {
          validAuthors++;
        }
      }

      if (validAuthors === 0) {
        throw new Error("Please add at least one author with complete information");
      }

      const authorIds: string[] = [];
      for (let i = 0; i < firstNameInputs.length; i++) {
        if (!firstNameInputs[i]?.value || !lastNameInputs[i]?.value || !emailInputs[i]?.value) continue;

        const { data: existingAuthor } = await supabase
          .from("author")
          .select("id")
          .eq("author_email", emailInputs[i].value)
          .maybeSingle();

        if (existingAuthor) {
          authorIds.push(existingAuthor.id);
        } else {
          const { data: newAuthor, error: authorError } = await supabase
            .from("author")
            .insert({
              author_fname: firstNameInputs[i].value,
              author_lname: lastNameInputs[i].value,
              author_email: emailInputs[i].value,
              author_minit: null,
            })
            .select("id")
            .single();

          if (authorError) throw authorError;
          authorIds.push(newAuthor.id);
        }
      }

      const { data: survey, error: surveyError } = await supabase
        .from("survey")
        .insert({
          survey_title: titleInput.value,
          survey_desc: descriptionInput.value,
          survey_keyword: keywordsInput.value,
          survey_start: startDateInput.value,
          survey_end: endDateInput.value,
          survey_link: surveyLinkInput.value,
          survey_respondents: respondentsInput.value,
          max_respondents: maxRespondentsInput?.value ? parseInt(maxRespondentsInput.value) : null,
          r_category: parseInt(categoryId),
          school: parseInt(schoolId),
          survey_status: 'accepted',
        })
        .select("id")
        .single();

      if (surveyError) throw surveyError;

      const surveyAuthorInserts = authorIds.map(authorId => ({
        survey: survey.id,
        author: parseInt(authorId),
      }));

      const { error: linkError } = await supabase
        .from("survey_author")
        .insert(surveyAuthorInserts);

      if (linkError) throw linkError;

      sessionStorage.removeItem("surveyDraft");
      router.push("/survey/add/success");

    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit survey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/survey"
          className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
          onClick={() => sessionStorage.removeItem("surveyDraft")}
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Add New Survey</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Basic Information</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Survey Title <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={100}
                    placeholder="Enter survey title"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Description <span className="text-[#eec643]">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={4}
                    maxLength={1500}
                    placeholder="Enter survey description"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>

                <div>
                  <label htmlFor="keywords" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Keywords <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="text"
                    id="keywords"
                    name="keywords"
                    required
                    maxLength={100}
                    placeholder="Enter keywords separated by commas"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Authors</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
              {authors.map((author, index) => (
                <div key={author.id} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-oswald text-[#011638]">Author {index + 1}</h3>
                    {authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(author.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                          First Name <span className="text-[#eec643]">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName[]"
                          required
                          maxLength={20}
                          placeholder="First Name"
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                          Middle Initial
                        </label>
                        <input
                          type="text"
                          name="middleInitial[]"
                          maxLength={4}
                          placeholder="M.I."
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Last Name <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName[]"
                        required
                        maxLength={20}
                        placeholder="Last Name"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Email <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email[]"
                        required
                        maxLength={30}
                        placeholder="Email"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      />
                    </div>
                  </div>
                  {index < authors.length - 1 && <hr className="my-4 border-[#e0e7ff]" />}
                </div>
              ))}
              
              <button
                type="button"
                onClick={addAuthor}
                className="text-[#1e4db7] hover:text-[#011638] mt-4 font-ubuntu-mono"
              >
                + Add another author
              </button>
            </div>
          </div>

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Survey Details</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Start Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      required
                      min="2022-01-01"
                      max={new Date().toISOString().split('T')[0]}
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      onChange={(e) => {
                        const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                        if (endDateInput) {
                          endDateInput.min = e.target.value;
                          if (endDateInput.value && endDateInput.value < e.target.value) {
                            endDateInput.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      End Date <span className="text-[#eec643]">*</span>
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      required
                      min="2022-01-01"
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="survey_link" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Survey Link <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="url"
                    id="survey_link"
                    name="survey_link"
                    required
                    maxLength={200}
                    placeholder="Enter survey URL"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>

                <div>
                  <label htmlFor="respondents" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Target Respondents <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="text"
                    id="respondents"
                    name="respondents"
                    required
                    maxLength={34}
                    placeholder="Enter respondent criteria separated by commas"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>

                <div>
                  <label htmlFor="max_respondents" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Maximum Respondents
                  </label>
                  <input
                    type="number"
                    id="max_respondents"
                    name="max_respondents"
                    min="1"
                    max="10000"
                    placeholder="e.g., 100"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Classification</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Category <span className="text-[#eec643]">*</span>
                  </label>
                  {!showNewCategory ? (
                    <div className="flex gap-2">
                      <select
                        id="category"
                        name="category"
                        required
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a category</option>
                        {availableCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.r_category_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewCategory(true)}
                        className="px-3 py-2 text-[#1e4db7] border border-[#1e4db7] rounded hover:bg-[#1e4db7] hover:text-white transition-colors font-ubuntu-mono whitespace-nowrap"
                      >
                        + New
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        maxLength={20}
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-3 py-2 text-white bg-[#1e4db7] rounded hover:bg-[#0d21a1] transition-colors font-ubuntu-mono"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName("");
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="school" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    School <span className="text-[#eec643]">*</span>
                  </label>
                  {!showNewSchool ? (
                    <div className="flex gap-2">
                      <select
                        id="school"
                        name="school"
                        required
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        defaultValue=""
                      >
                        <option value="" disabled>Select a school</option>
                        {availableSchools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.school_name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewSchool(true)}
                        className="px-3 py-2 text-[#1e4db7] border border-[#1e4db7] rounded hover:bg-[#1e4db7] hover:text-white transition-colors font-ubuntu-mono whitespace-nowrap"
                      >
                        + New
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                        placeholder="Enter new school name"
                        maxLength={34}
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleAddNewSchool}
                        className="px-3 py-2 text-white bg-[#1e4db7] rounded hover:bg-[#0d21a1] transition-colors font-ubuntu-mono"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSchool(false);
                          setNewSchoolName("");
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                required
                className="peer appearance-none w-4 h-4 border border-gray-400 rounded-sm checked:border-[#eec643] focus:ring-0 focus:outline-none"
              />
              <span className="absolute inset-0 flex items-center justify-center text-[#eec643] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none text-sm">
                ♠
              </span>
            </div>
            <label htmlFor="privacy" className="text-sm text-[#475569] font-ubuntu-mono">
              I acknowledge and consent that the organization will collect,
              use, and process the information provided in this form for
              research documentation and archival purposes, in accordance with
              the Data Privacy Act.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
            <Link
              href="/survey"
              className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
              onClick={() => sessionStorage.removeItem("surveyDraft")}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}