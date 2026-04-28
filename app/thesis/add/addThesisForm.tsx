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

interface AddThesisFormProps {
  categories: Category[];
  schools: School[];
}

export default function AddThesisForm({ categories, schools }: AddThesisFormProps) {
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

  // Check duplicate authors
  const checkDuplicateAuthors = () => {
    const firstNameInputs = document.querySelectorAll('input[name="firstName[]"]') as NodeListOf<HTMLInputElement>;
    const lastNameInputs = document.querySelectorAll('input[name="lastName[]"]') as NodeListOf<HTMLInputElement>;
    const middleInitialInputs = document.querySelectorAll('input[name="middleInitial[]"]') as NodeListOf<HTMLInputElement>;
    const emailInputs = document.querySelectorAll('input[name="email[]"]') as NodeListOf<HTMLInputElement>;
    
    for (let i = 0; i < emailInputs.length; i++) {
      for (let j = i + 1; j < emailInputs.length; j++) {
        // Check duplicate emails
        if (emailInputs[i]?.value && emailInputs[j]?.value && 
            emailInputs[i].value.toLowerCase() === emailInputs[j].value.toLowerCase()) {
          return `Author ${i + 1} and Author ${j + 1} have the same email address.`;
        }
        
        // Check duplicate names
        if (firstNameInputs[i]?.value && lastNameInputs[i]?.value && 
            firstNameInputs[j]?.value && lastNameInputs[j]?.value &&
            firstNameInputs[i].value.toLowerCase() === firstNameInputs[j].value.toLowerCase() &&
            lastNameInputs[i].value.toLowerCase() === lastNameInputs[j].value.toLowerCase()) {
          
          const middleI = (middleInitialInputs[i]?.value || '').toLowerCase();
          const middleJ = (middleInitialInputs[j]?.value || '').toLowerCase();
          
          if (middleI === middleJ) {
            return `Author ${i + 1} and Author ${j + 1} have the same full name.`;
          }
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const savedDraft = sessionStorage.getItem("thesisDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
        const abstractInput = document.querySelector('textarea[name="abstract"]') as HTMLTextAreaElement | null;
        const keywordsInput = document.querySelector('input[name="keywords"]') as HTMLInputElement | null;
        const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement | null;
        const physicalInput = document.querySelector('input[name="physical"]') as HTMLInputElement | null;
        const digitalInput = document.querySelector('input[name="digital"]') as HTMLInputElement | null;

        if (titleInput) titleInput.value = draft.title || "";
        if (abstractInput) abstractInput.value = draft.abstract || "";
        if (keywordsInput) keywordsInput.value = draft.keywords || "";
        if (dateInput) dateInput.value = draft.date || "";
        if (physicalInput) physicalInput.value = draft.physical || "";
        if (digitalInput) digitalInput.value = draft.digital || "";

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
      const abstractInput = form.elements.namedItem("abstract") as HTMLTextAreaElement | null;
      const keywordsInput = form.elements.namedItem("keywords") as HTMLInputElement | null;
      const dateInput = form.elements.namedItem("date") as HTMLInputElement | null;
      const physicalInput = form.elements.namedItem("physical") as HTMLInputElement | null;
      const digitalInput = form.elements.namedItem("digital") as HTMLInputElement | null;
      const categorySelect = form.elements.namedItem("category") as HTMLSelectElement | null;
      const schoolSelect = form.elements.namedItem("school") as HTMLSelectElement | null;

      if (!titleInput?.value || !abstractInput?.value || !keywordsInput?.value || !dateInput?.value) {
        throw new Error("Please fill in all required fields");
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

      // Check duplicate authors
      const duplicateError = checkDuplicateAuthors();
      if (duplicateError) {
        throw new Error(duplicateError);
      }

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

      const { data: thesis, error: thesisError } = await supabase
        .from("thesis")
        .insert({
          thesis_title: titleInput.value,
          thesis_abstract: abstractInput.value,
          thesis_keyword: keywordsInput.value,
          thesis_date: dateInput.value,
          thesis_phys: physicalInput?.value || null,
          thesis_digi: digitalInput?.value || null,
          r_category: parseInt(categoryId),
          school: parseInt(schoolId),
          thesis_status: 'accepted',
        })
        .select("id")
        .single();

      if (thesisError) throw thesisError;

      const thesisAuthorInserts = authorIds.map(authorId => ({
        thesis: thesis.id,
        author: parseInt(authorId),
      }));

      const { error: linkError } = await supabase
        .from("thesis_author")
        .insert(thesisAuthorInserts);

      if (linkError) throw linkError;

      sessionStorage.removeItem("thesisDraft");
      router.push("/thesis/add/success");

    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit thesis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => {
            sessionStorage.removeItem("thesisDraft");
            router.back();
          }}
          className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono cursor-pointer"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">Add New Thesis</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Basic Information</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Thesis Title <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={100}
                    placeholder="Enter thesis title"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('title-error');
                      if (input.value.length === 0) {
                        errorSpan!.textContent = 'Title is required.';
                        errorSpan!.style.display = 'block';
                      } else if (input.value.length < 5) {
                        errorSpan!.textContent = 'Title must be at least 5 characters.';
                        errorSpan!.style.display = 'block';
                      } else {
                        errorSpan!.style.display = 'none';
                      }
                    }}
                  />
                  <span id="title-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>

                <div>
                  <label htmlFor="abstract" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Abstract <span className="text-[#eec643]">*</span>
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    required
                    rows={4}
                    maxLength={1500}
                    placeholder="Enter thesis abstract"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('abstract-error');
                      if (input.value.length === 0) {
                        errorSpan!.textContent = 'Abstract is required.';
                        errorSpan!.style.display = 'block';
                      } else if (input.value.length < 10) {
                        errorSpan!.textContent = 'Abstract must be at least 10 characters.';
                        errorSpan!.style.display = 'block';
                      } else {
                        errorSpan!.style.display = 'none';
                      }
                    }}
                  />
                  <span id="abstract-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        return;
                      }
                      if (!/[A-Za-z\s\-'.,]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('keywords-error');
                      if (input.value.length === 0) {
                        errorSpan!.textContent = 'At least 1 keyword is required.';
                        errorSpan!.style.display = 'block';
                      } else if (input.value.length < 2) {
                        errorSpan!.textContent = 'Keywords must be at least 2 characters.';
                        errorSpan!.style.display = 'block';
                      } else {
                        errorSpan!.style.display = 'none';
                      }
                    }}
                  />
                  <span id="keywords-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Authors Section */}
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Authors</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
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
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }
                            if (!/[A-Za-z\s\-'.]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            const errorSpan = document.getElementById(`firstname-error-${index}`);
                            if (input.value.length === 0) {
                              if (errorSpan) {
                                errorSpan.textContent = 'First Name is required.';
                                errorSpan.style.display = 'block';
                              }
                            } else if (input.value.length < 2) {
                              if (errorSpan) {
                                errorSpan.textContent = 'First Name must be at least 2 characters.';
                                errorSpan.style.display = 'block';
                              }
                            } else {
                              if (errorSpan) {
                                errorSpan.style.display = 'none';
                              }
                            }
                          }}
                        />
                        <span id={`firstname-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }
                            if (!/[A-Za-z\s.]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          if (!/[A-Za-z\s\-'.]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById(`lastname-error-${index}`);
                          const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                          
                          if (input.value.length === 0) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Last Name is required.';
                              errorSpan.style.display = 'block';
                            }
                            return;
                          } else if (input.value.length < 2) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Last Name must be at least 2 characters.';
                              errorSpan.style.display = 'block';
                            }
                            return;
                          }

                          // Check duplicate authors
                          const allFirstNames = document.querySelectorAll('input[name="firstName[]"]');
                          const allLastNames = document.querySelectorAll('input[name="lastName[]"]');
                          const allMiddleInitials = document.querySelectorAll('input[name="middleInitial[]"]');

                          const currentFirstName = firstNameInput?.value?.trim();
                          const currentLastName = input.value?.trim();
                          const currentMiddleInitial = (allMiddleInitials[index] as HTMLInputElement)?.value?.trim();
                          const normalizedCurrentMiddle = currentMiddleInitial ? currentMiddleInitial.charAt(0).toUpperCase() : '';

                          for (let i = 0; i < allFirstNames.length; i++) {
                            if (i !== index) {
                              const otherFirstName = (allFirstNames[i] as HTMLInputElement).value?.trim();
                              const otherLastName = (allLastNames[i] as HTMLInputElement).value?.trim();
                              const otherMiddleInitial = (allMiddleInitials[i] as HTMLInputElement)?.value?.trim();
                              const normalizedOtherMiddle = otherMiddleInitial ? otherMiddleInitial.charAt(0).toUpperCase() : '';
                              
                              if (otherFirstName && otherLastName && currentFirstName && currentLastName) {
                                const firstNameMatch = otherFirstName.toLowerCase() === currentFirstName.toLowerCase();
                                const lastNameMatch = otherLastName.toLowerCase() === currentLastName.toLowerCase();
                                
                                if (firstNameMatch && lastNameMatch && normalizedCurrentMiddle === normalizedOtherMiddle) {
                                  if (errorSpan) {
                                    const authorName = `${currentFirstName} ${normalizedCurrentMiddle ? normalizedCurrentMiddle + '. ' : ''}${currentLastName}`;
                                    errorSpan.textContent = `Author with the same name "${authorName}" already exists (Author ${i + 1}).`;
                                    errorSpan.style.display = 'block';
                                  }
                                  return;
                                }
                              }
                            }
                          }

                          if (errorSpan) {
                            errorSpan.style.display = 'none';
                          }
                        }}
                      />
                      <span id={`lastname-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                        onKeyUp={(e) => {
                          const input = e.target as HTMLInputElement;
                          const char = e.key;
                          const value = input.value;
                          const atCount = (value.match(/@/g) || []).length;
                          
                          if (char === '@' && atCount >= 1) {
                            e.preventDefault();
                            return;
                          }
                          
                          if (!value.includes('@')) {
                            if (!/[a-zA-Z0-9.]/.test(char) && char !== '@') {
                              e.preventDefault();
                            }
                          }
                        }}
                        onInput={async (e) => {
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById(`email-error-${index}`);
                          const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                          const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                          if (input.value.length === 0) {
                            errorSpan!.textContent = 'Email is required.';
                            errorSpan!.style.display = 'block';
                            return;
                          }
                          
                          if (!emailRegex.test(input.value)) {
                            errorSpan!.textContent = 'Please enter a valid email address.';
                            errorSpan!.style.display = 'block';
                            return;
                          }

                          // Check duplicate emails
                          const allEmails = document.querySelectorAll('input[name="email[]"]');
                          for (let i = 0; i < allEmails.length; i++) {
                            if (i !== index) {
                              const otherEmail = (allEmails[i] as HTMLInputElement).value;
                              if (otherEmail && otherEmail.toLowerCase() === input.value.toLowerCase()) {
                                errorSpan!.textContent = `This email is already used for Author ${i + 1}.`;
                                errorSpan!.style.display = 'block';
                                return;
                              }
                            }
                          }

                          // Check existing author
                          const supabase = createClient();
                          const { data: existing } = await supabase
                            .from("author")
                            .select("id, author_fname, author_lname")
                            .eq("author_email", input.value)
                            .maybeSingle();
                          
                          if (existing) {
                            const firstNameMatch = existing.author_fname?.toLowerCase() === firstNameInput?.value?.toLowerCase();
                            const lastNameMatch = existing.author_lname?.toLowerCase() === lastNameInput?.value?.toLowerCase();
                            
                            if (firstNameMatch && lastNameMatch) {
                              errorSpan!.style.display = 'none';
                            } else {
                              errorSpan!.textContent = 'This email is already registered to a different author.';
                              errorSpan!.style.display = 'block';
                            }
                          } else {
                            errorSpan!.style.display = 'none';
                          }
                        }}
                      />
                      <span id={`email-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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

          {/* Classification */}
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Classification</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
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
                        onChange={(e) => {
                          const errorSpan = document.getElementById('category-error');
                          if (!e.target.value) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Please select a category.';
                              errorSpan.style.display = 'block';
                            }
                          } else {
                            if (errorSpan) {
                              errorSpan.style.display = 'none';
                            }
                          }
                        }}
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
                        maxLength={30}
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        required
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          if (!/[A-Za-z\s.'-]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById('category-error');
                          
                          if (!input.value.trim()) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Category name is required.';
                              errorSpan.style.display = 'block';
                            }
                          } else if (input.value.length < 2) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Category name must be at least 2 characters.';
                              errorSpan.style.display = 'block';
                            }
                          } else {
                            if (errorSpan) {
                              errorSpan.style.display = 'none';
                            }
                          }
                        }}
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
                          const errorSpan = document.getElementById('category-error');
                          if (errorSpan) errorSpan.style.display = 'none';
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <span id="category-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                        onChange={(e) => {
                          const errorSpan = document.getElementById('school-error');
                          if (!e.target.value) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Please select a school.';
                              errorSpan.style.display = 'block';
                            }
                          } else {
                            if (errorSpan) {
                              errorSpan.style.display = 'none';
                            }
                          }
                        }}
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
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          if (!/[A-Za-z\s.'-]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById('school-error');
                          
                          if (!input.value.trim()) {
                            if (errorSpan) {
                              errorSpan.textContent = 'School name is required.';
                              errorSpan.style.display = 'block';
                            }
                          } else if (input.value.length < 2) {
                            if (errorSpan) {
                              errorSpan.textContent = 'School name must be at least 2 characters.';
                              errorSpan.style.display = 'block';
                            }
                          } else {
                            if (errorSpan) {
                              errorSpan.style.display = 'none';
                            }
                          }
                        }}
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
                          const errorSpan = document.getElementById('school-error');
                          if (errorSpan) errorSpan.style.display = 'none';
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <span id="school-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Date</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
              <div>
                <label htmlFor="date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                  Thesis Date <span className="text-[#eec643]">*</span>
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    const errorSpan = document.getElementById('date-error');
                    if (!input.value) {
                      errorSpan!.textContent = 'Date is required.';
                      errorSpan!.style.display = 'block';
                    } else {
                      errorSpan!.style.display = 'none';
                    }
                  }}
                />
                <span id="date-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
              <h2 className="text-lg font-oswald font-semibold">Location</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="physical" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Physical Copy Location
                  </label>
                  <input
                    type="text"
                    id="physical"
                    name="physical"
                    maxLength={20}
                    placeholder="e.g., Library Section A"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                  />
                </div>

                <div>
                  <label htmlFor="digital" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Digital Copy Link
                  </label>
                  <input
                    type="url"
                    id="digital"
                    name="digital"
                    maxLength={200}
                    placeholder="Enter thesis URL"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('digital-error');
                      if (input.value && !input.value.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i)) {
                        errorSpan!.textContent = 'Please enter a valid URL.';
                        errorSpan!.style.display = 'block';
                      } else {
                        errorSpan!.style.display = 'none';
                      }
                    }}
                  />
                  <span id="digital-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Consent */}
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

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("thesisDraft");
                router.back();
              }}
              className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Thesis"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}