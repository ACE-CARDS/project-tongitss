"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import BackButton from "@/components/backButton";

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
  memberId?: number | null;
}

interface AddThesisFormProps {
  categories: Category[];
  schools: School[];
  returnTo?: string;
}

export default function AddThesisForm({ categories, schools, returnTo }: AddThesisFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [authors, setAuthors] = useState<Author[]>([{ id: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [searchResults, setSearchResults] = useState<Map<number, Array<{id: number, fname: string, lname: string, minit: string | null, email: string}>>>(new Map());
  const [showSearchDropdown, setShowSearchDropdown] = useState<Map<number, boolean>>(new Map());

  const [returnUrl, setReturnUrl] = useState<string>("/thesis");
  const [availableCategories, setAvailableCategories] = useState<Category[]>(categories);
  const [availableSchools, setAvailableSchools] = useState<School[]>(schools);
  
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const [categoryError, setCategoryError] = useState("");
  const [schoolError, setSchoolError] = useState("");
  const [isCategoryTouched, setIsCategoryTouched] = useState(false);
  const [isSchoolTouched, setIsSchoolTouched] = useState(false);
  const [digitalLinkError, setDigitalLinkError] = useState("");

  // Load current logged-in user's member info
  useEffect(() => {
    const loadCurrentUser = async () => {
      setIsLoadingUser(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUserId(user.id);
        
        // Get member info from users table
        const { data: userData } = await supabase
          .from("users")
          .select("member_id")
          .eq("id", user.id)
          .single();
        
        if (userData?.member_id) {
          const { data: member } = await supabase
            .from("member")
            .select("id, mem_fname, mem_lname, mem_minit, mem_email")
            .eq("id", userData.member_id)
            .single();
          
          if (member) {
            setAuthors([{
              id: 1,
              firstName: member.mem_fname,
              middleInitial: member.mem_minit || "",
              lastName: member.mem_lname,
              email: member.mem_email,
              memberId: member.id
            }]);
          }
        } else {
          // Fallback: try to get from author table by email
          const { data: userEmail } = await supabase.auth.getUser();
          if (userEmail.user?.email) {
            const { data: existingAuthor } = await supabase
              .from("author")
              .select("id, author_fname, author_lname, author_minit, author_email, mem_id")
              .eq("author_email", userEmail.user.email)
              .maybeSingle();
            
            if (existingAuthor) {
              setAuthors([{
                id: 1,
                firstName: existingAuthor.author_fname,
                middleInitial: existingAuthor.author_minit || "",
                lastName: existingAuthor.author_lname,
                email: existingAuthor.author_email,
                memberId: existingAuthor.mem_id
              }]);
            }
          }
        }
      }
      setIsLoadingUser(false);
    };
    
    loadCurrentUser();
  }, [supabase]);

  // Search for members in the database
  const searchMembers = async (firstName: string, lastName: string, middleInitial: string, authorIndex: number) => {
    if (!firstName || firstName.length < 2 || !lastName || lastName.length < 2) {
      setSearchResults(prev => new Map(prev).set(authorIndex, []));
      setShowSearchDropdown(prev => new Map(prev).set(authorIndex, false));
      return;
    }

    let query = supabase
      .from("member")
      .select("id, mem_fname, mem_lname, mem_minit, mem_email");

    query = query.ilike("mem_fname", `%${firstName}%`)
      .ilike("mem_lname", `%${lastName}%`);

    if (middleInitial && middleInitial.length >= 1) {
      query = query.ilike("mem_minit", `${middleInitial.charAt(0)}%`);
    }

    const { data: members, error } = await query.limit(5);

    if (!error && members && members.length > 0) {
      const formattedMembers = members.map(m => ({
        id: m.id,
        fname: m.mem_fname,
        lname: m.mem_lname,
        minit: m.mem_minit,
        email: m.mem_email
      }));
      setSearchResults(prev => new Map(prev).set(authorIndex, formattedMembers));
      setShowSearchDropdown(prev => new Map(prev).set(authorIndex, true));
    } else {
      setSearchResults(prev => new Map(prev).set(authorIndex, []));
      setShowSearchDropdown(prev => new Map(prev).set(authorIndex, false));
    }
  };

  // Select a member from search results
  const selectMember = (member: any, authorIndex: number) => {
    const updatedAuthors = [...authors];
    updatedAuthors[authorIndex] = {
      ...updatedAuthors[authorIndex],
      firstName: member.fname,
      middleInitial: member.minit || "",
      lastName: member.lname,
      email: member.email,
      memberId: member.id
    };
    setAuthors(updatedAuthors);
    setShowSearchDropdown(prev => new Map(prev).set(authorIndex, false));
    
    // Update input fields
    const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[authorIndex] as HTMLInputElement;
    const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[authorIndex] as HTMLInputElement;
    const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[authorIndex] as HTMLInputElement;
    const emailInput = document.querySelectorAll('input[name="email[]"]')[authorIndex] as HTMLInputElement;
    
    if (firstNameInput) firstNameInput.value = member.fname;
    if (middleInitialInput) middleInitialInput.value = member.minit || "";
    if (lastNameInput) lastNameInput.value = member.lname;
    if (emailInput) emailInput.value = member.email;
  };

  // Check duplicate authors on each field
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
          
          // Check middle initials
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

  const checkDuplicateDigitalLink = async (link: string) => {
  if (!link) return;
  
  const supabase = createClient();
  const { data, error } = await supabase
    .from("thesis")
    .select("id")
    .ilike("thesis_digi", link)
    .maybeSingle();
  
  if (data) {
    setDigitalLinkError("This digital link is already in use. Please provide a unique link.");
  } else {
    setDigitalLinkError("");
  }
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
            setIsCategoryTouched(true);
            setCategoryError("");
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
            setIsSchoolTouched(true);
            setSchoolError("");
          }, 100);
        }

        if (draft.authors?.length) {
          setAuthors(draft.authors.map((author: any, index: number) => ({
            id: index + 1,
            firstName: author.firstName,
            middleInitial: author.middleInitial,
            lastName: author.lastName,
            email: author.email,
            memberId: author.memberId
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

  useEffect(() => {
    if (returnTo) {
      // save to sessionStorage
      sessionStorage.setItem("thesisReturnUrl", returnTo);
      setReturnUrl(returnTo);
    } else {
      const storedReturnUrl = sessionStorage.getItem("thesisReturnUrl");
      if (storedReturnUrl) {
        setReturnUrl(storedReturnUrl);
      } else {
        setReturnUrl("/thesis");
      }
    }
  }, [returnTo]);

  const addAuthor = () => {
    setAuthors([...authors, { id: authors.length + 1, memberId: null }]);
  };

  const removeAuthor = (id: number) => {
    if (authors.length > 1) {
      setAuthors(authors.filter(author => author.id !== id));
    }
  };

  const handleAddNewCategory = async () => {
    setCategoryError("");

    if (!newCategoryName.trim()) {
      setCategoryError("Please enter a category name");
      return;
    }

    if (newCategoryName.trim().length < 2) {
      setCategoryError("Category name must be at least 2 characters");
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
        setCategoryError("");
        setIsCategoryTouched(true);
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
        setCategoryError("");
        setIsCategoryTouched(true);
        return;
      }

      const { data: newCategory, error: categoryError } = await supabase
        .from("r_category")
        .insert({ r_category_name: newCategoryName })
        .select("id, r_category_name")
        .single();

      if (categoryError) {
        // Handle database error
        if (categoryError.code === '23505') { // Unique violation
          setCategoryError("This category already exists in the database");
        } else if (categoryError.code === '23514') {
          setCategoryError("Category name is invalid");
        } else {
          setCategoryError(`Database error: ${categoryError.message}`);
        }
        console.error("Error adding category:", categoryError);
        return;
      }

      setAvailableCategories(prev => [...prev, newCategory]);

      setTimeout(() => {
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = newCategory.id;
        }
      }, 100);

      setShowNewCategory(false);
      setNewCategoryName("");
      setCategoryError("");
      setIsCategoryTouched(true);
    } catch (error) {
      console.error("Error adding category:", error);
      setCategoryError("An unexpected error occurred. Please try again.");
    }
  };

  const handleAddNewSchool = async () => {
    setSchoolError("");
    
    if (!newSchoolName.trim()) {
      setSchoolError("Please enter a school name");
      return;
    }

    if (newSchoolName.trim().length < 2) {
      setSchoolError("School name must be at least 2 characters");
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
        setSchoolError("");
        setIsSchoolTouched(true);
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
        setSchoolError("");
        setIsSchoolTouched(true);
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

      if (schoolError) {
        // Handle database error
        if (schoolError.code === '23505') { // Unique violation
          setSchoolError("This school already exists in the database");
        } else if (schoolError.code === '23514') {
          setSchoolError("School name is invalid");
        } else {
          setSchoolError(`Database error: ${schoolError.message}`);
        }
        console.error("Error adding school:", schoolError);
        return;
      }

      setAvailableSchools(prev => [...prev, newSchool]);

      setTimeout(() => {
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = newSchool.id;
        }
      }, 100);

      setShowNewSchool(false);
      setNewSchoolName("");
      setSchoolError("");
      setIsSchoolTouched(true);
    } catch (error) {
      console.error("Error adding school:", error);
      setSchoolError("An unexpected error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate category and school before submission
    const categorySelect = e.currentTarget.elements.namedItem("category") as HTMLSelectElement | null;
    const schoolSelect = e.currentTarget.elements.namedItem("school") as HTMLSelectElement | null;
    
    let hasError = false;
    
    if (!categorySelect?.value) {
      setCategoryError("Please select a category");
      setIsCategoryTouched(true);
      hasError = true;
    }
    
    if (!schoolSelect?.value) {
      setSchoolError("Please select a school");
      setIsSchoolTouched(true);
      hasError = true;
    }
    
    if (hasError) {
      // Scroll to the error
      const errorElement = document.querySelector('.border-red-500');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const form = e.currentTarget;
      
      const titleInput = form.elements.namedItem("title") as HTMLInputElement | null;
      const abstractInput = form.elements.namedItem("abstract") as HTMLTextAreaElement | null;
      const keywordsInput = form.elements.namedItem("keywords") as HTMLInputElement | null;
      const dateInput = form.elements.namedItem("date") as HTMLInputElement | null;
      const physicalInput = form.elements.namedItem("physical") as HTMLInputElement | null;
      const digitalInput = form.elements.namedItem("digital") as HTMLInputElement | null;

      if (!titleInput?.value || !abstractInput?.value || !keywordsInput?.value || !dateInput?.value) {
        throw new Error("Please fill in all required fields");
      }

      // Check duplicate digital link
      if (digitalInput?.value) {
        const { data: existingThesis } = await supabase
          .from("thesis")
          .select("id")
          .ilike("thesis_digi", digitalInput.value)
          .maybeSingle();
        
        if (existingThesis) {
          throw new Error("This digital link is already in use. Please provide a unique link.");
        }
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

        const memberIdFromState = authors[i]?.memberId || null;
        
        // First check if author exists by email
        const { data: existingAuthor } = await supabase
          .from("author")
          .select("id")
          .eq("author_email", emailInputs[i].value)
          .maybeSingle();

        if (existingAuthor) {
          authorIds.push(existingAuthor.id);
        } else {
          // Create new author with mem_id if available
          const { data: newAuthor, error: authorError } = await supabase
            .from("author")
            .insert({
              author_fname: firstNameInputs[i].value,
              author_lname: lastNameInputs[i].value,
              author_email: emailInputs[i].value,
              author_minit: (document.querySelectorAll('input[name="middleInitial[]"]')[i] as HTMLInputElement)?.value || null,
              mem_id: memberIdFromState || null
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
          thesis_status: 'pending',
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
      router.push(`/thesis/add/success?returnTo=${encodeURIComponent(returnUrl)}`);
      
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit thesis");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingUser) {
    return (
      <main className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="flex justify-center items-center h-64">
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-6">
        <BackButton />
        <h1 className="text-2xl font-oswald font-bold text-[#011638] mt-6">Add New Thesis</h1>
      </div>

      <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    maxLength={300}
                    placeholder="Enter thesis title"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    // Error handling
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
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue"
                    // Error handling
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
                    maxLength={300}
                    placeholder="Enter keywords separated by commas"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    // Key Limits
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        return;
                      }

                      if (!/[A-Za-z\s\-'.,]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    // Error handling
                    onInput={(e) => {
                        const input = e.target as HTMLInputElement;
                        const errorSpan = document.getElementById('keywords-error');
                        if (input.value.length === 0) {
                          errorSpan!.textContent = 'Atleast 1 keyword is required.';
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

          <div>
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Authors</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
              {authors.map((author, index) => (
                <div key={author.id} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-oswald text-[#011638]">Author {index + 1}</h3>
                    {authors.length > 1 && index !== 0 && (
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
                          defaultValue={author.firstName || ""}
                          disabled={index === 0}
                          className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          onBlur={() => {
                            if (index !== 0) {
                              const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                              const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                              const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                              
                              if (firstNameInput?.value && lastNameInput?.value) {
                                searchMembers(
                                  firstNameInput.value, 
                                  lastNameInput.value, 
                                  middleInitialInput?.value || "", 
                                  index
                                );
                              }
                            }
                          }}
                          // Key Limits
                          onKeyDown={(e) => {
                            if (index === 0) return;
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }

                            if (!/[A-Za-z\s\-'.]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          // Error handling
                          onInput={(e) => {
                            if (index === 0) return;
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
                          defaultValue={author.middleInitial || ""}
                          disabled={index === 0}
                          className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          onBlur={() => {
                            if (index !== 0) {
                              const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                              const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                              const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                              
                              if (firstNameInput?.value && lastNameInput?.value) {
                                searchMembers(
                                  firstNameInput.value, 
                                  lastNameInput.value, 
                                  middleInitialInput?.value || "", 
                                  index
                                );
                              }
                            }
                          }}
                          onChange={(e) => {
                            if (index === 0) return;
                            let value = e.target.value.toUpperCase();
                            value = value.replace(/[^A-Z.]/g, '');
                            
                            // Format: letter dot letter dot
                            if (value.length === 1 && /[A-Z]/.test(value)) {
                              value = value + '.';
                            } else if (value.length === 2 && value[1] === '.') {

                            } else if (value.length === 2 && /[A-Z]/.test(value[1])) {
                              value = value[0] + '.' + value[1];
                            } else if (value.length === 3 && value[1] === '.' && /[A-Z]/.test(value[2])) {
                              value = value + '.';
                            } else if (value.length >= 4) {

                              value = value.slice(0, 2) + value.slice(2, 3) + '.';
                              if (value.length > 4) value = value.slice(0, 4);
                            }
                            
                            e.target.value = value;
                            
                            const event = new Event('input', { bubbles: true });
                            e.target.dispatchEvent(event);
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
                        defaultValue={author.lastName || ""}
                        disabled={index === 0}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        onBlur={() => {
                          if (index !== 0) {
                            const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                            const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                            const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                            
                            if (firstNameInput?.value && lastNameInput?.value) {
                              searchMembers(
                                firstNameInput.value, 
                                lastNameInput.value, 
                                middleInitialInput?.value || "", 
                                index
                              );
                            }
                          }
                        }}
                        // Key Limits
                        onKeyDown={(e) => {
                          if (index === 0) return;
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }

                          if (!/[A-Za-z\s\-'.]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        // Error handling
                        onInput={(e) => {
                          if (index === 0) return;
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById(`lastname-error-${index}`);
                          const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                          const lastNameInput = input;
                          const emailInput = document.querySelectorAll('input[name="email[]"]')[index] as HTMLInputElement;

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
                          const currentLastName = lastNameInput?.value?.trim();
                          const currentMiddleInitial = (allMiddleInitials[index] as HTMLInputElement)?.value?.trim();

                          const normalizedCurrentMiddle = currentMiddleInitial ? currentMiddleInitial.charAt(0).toUpperCase() : '';

                          for (let i = 0; i < allFirstNames.length; i++) {
                            if (i !== index) {
                              const otherFirstName = (allFirstNames[i] as HTMLInputElement).value?.trim();
                              const otherLastName = (allLastNames[i] as HTMLInputElement).value?.trim();
                              const otherMiddleInitial = (allMiddleInitials[i] as HTMLInputElement)?.value?.trim();
                              
                              const normalizedOtherMiddle = otherMiddleInitial ? otherMiddleInitial.charAt(0).toUpperCase() : '';
                              
                              // Check name fields match
                              if (otherFirstName && otherLastName && currentFirstName && currentLastName) {
                                const firstNameMatch = otherFirstName.toLowerCase() === currentFirstName.toLowerCase();
                                const lastNameMatch = otherLastName.toLowerCase() === currentLastName.toLowerCase();
                                
                                if (firstNameMatch && lastNameMatch) {
                                  // Check middle initial
                                  const middleMatch = normalizedCurrentMiddle === normalizedOtherMiddle;
                                  
                                  if (middleMatch) {
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
                          }

                          // No duplicate
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
                        maxLength={254}
                        placeholder="Email"
                        defaultValue={author.email || ""}
                        disabled={index === 0}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        // Key Limits
                        onKeyUp={(e) => {
                          if (index === 0) return;
                          const input = e.target as HTMLInputElement;
                          const char = e.key;
                          const value = input.value;
                          const atCount = (value.match(/@/g) || []).length;
                          
                          // Prevent second @
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
                        // Search trigger
                        onInput={async (e) => {
                          if (index === 0) return;
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
                      
                      {/* Search Results Dropdown */}
                      {showSearchDropdown.get(index) && searchResults.get(index) && searchResults.get(index)!.length > 0 && index !== 0 && (
                        <div className="absolute z-50 mt-1 w-full bg-[#fbfaf8] border border-[#011638] rounded-lg shadow-xl overflow-hidden" style={{ position: 'relative' }}>
                          <div className="px-4 py-2 bg-[#1e4db7] bg-opacity-20 border-b border-[#011638] rounded-t-lg sticky top-0">
                            <span className="text-xs font-oswald font-semibold text-white">MATCHING MEMBER(S)</span>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                            {searchResults.get(index)!.map((member, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => selectMember(member, index)}
                                className="w-full text-left px-4 py-2 hover:bg-[#e0e7ff] hover:text-[#011638] text-[#475569] font-ubuntu-mono transition-colors border-b last:border-b-0 border-[#011638] border-opacity-20"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{member.fname} {member.minit ? member.minit + '. ' : ''}{member.lname}</span>
                                  <span className="text-xs">{member.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
            <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
              <h2 className="text-lg font-oswald font-semibold">Thesis Details</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Thesis Date <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    min="2022-01-01"
                    max={(() => {
                      const now = new Date();
                      const phTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
                      const year = phTime.getFullYear();
                      const month = String(phTime.getMonth() + 1).padStart(2, '0');
                      const day = String(phTime.getDate()).padStart(2, '0');
                      return `${year}-${month}-${day}`;
                    })()}
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

                <div>
                  <label htmlFor="physical" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                    Physical Copy Location
                  </label>
                  <input
                    type="text"
                    id="physical"
                    name="physical"
                    maxLength={200}
                    placeholder="Enter physical copy location"
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
                    maxLength={300}
                    placeholder="Enter digital copy URL"
                    className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                      digitalLinkError ? 'border-red-500' : 'border-[#94a3b8]'
                    }`}
                    onChange={async (e) => {
                      const input = e.target;
                      const value = input.value;
                      const errorSpan = document.getElementById('digital-link-error');
                      const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
                      
                      setDigitalLinkError("");
                      
                      if (value.length === 0) {
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                        return;
                      }
                      
                      // Check URL format
                      let isValidUrl = false;
                      try {
                        new URL(value);
                        isValidUrl = true;
                      } catch {
                        isValidUrl = false;
                      }
                      
                      if (!isValidUrl) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Please enter a valid URL.';
                          errorSpan.style.display = 'block';
                        }
                        return;
                      }
                      
                      // Hide error if valid
                      if (errorSpan) {
                        errorSpan.style.display = 'none';
                      }
                      
                      // Check for duplicate link
                      const supabase = createClient();
                      const { data: existingThesis } = await supabase
                        .from("thesis")
                        .select("id")
                        .ilike("thesis_digi", value)
                        .maybeSingle();
                      
                      if (existingThesis) {
                        setDigitalLinkError("This digital link is already in use. Please provide a unique link.");
                        if (errorSpan) {
                          errorSpan.textContent = "This digital link is already in use. Please provide a unique link.";
                          errorSpan.style.display = 'block';
                        }
                      } else {
                        setDigitalLinkError("");
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                      }
                    }}
                  />
                  <span id="digital-link-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>
              </div>
            </div>
          </div>

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
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                          isCategoryTouched && categoryError ? 'border-red-500' : 'border-[#94a3b8]'
                        }`}
                        defaultValue=""
                        // Error handling
                        onChange={(e) => {
                          setIsCategoryTouched(true);
                          if (!e.target.value) {
                            setCategoryError("Please select a category");
                          } else {
                            setCategoryError("");
                          }
                        }}
                        onBlur={() => {
                          const select = document.getElementById('category') as HTMLSelectElement;
                          if (!select?.value) {
                            setCategoryError("Please select a category");
                            setIsCategoryTouched(true);
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
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          setCategoryError("");
                        }}
                        placeholder="Enter new category name"
                        maxLength={50}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                          categoryError ? 'border-red-500' : 'border-[#94a3b8]'
                        }`}
                        required
                        // Key Limits
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          
                          if (!/[A-Za-z\s.'-]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        // Error Handling
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
                          setCategoryError("");
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {isCategoryTouched && categoryError && (
                    <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{categoryError}</p>
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
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                          isSchoolTouched && schoolError ? 'border-red-500' : 'border-[#94a3b8]'
                        }`}
                        defaultValue=""
                        // Error handling
                        onChange={(e) => {
                        setIsSchoolTouched(true);
                        if (!e.target.value) {
                            setSchoolError("Please select a school");
                          } else {
                            setSchoolError("");
                          }
                        }}
                        onBlur={() => {
                          const select = document.getElementById('school') as HTMLSelectElement;
                          if (!select?.value) {
                            setSchoolError("Please select a school");
                            setIsSchoolTouched(true);
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
                        onChange={(e) => {
                          setNewSchoolName(e.target.value);
                          setSchoolError("");
                        }}
                        placeholder="Enter new school name"
                        maxLength={50}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                          schoolError ? 'border-red-500' : 'border-[#94a3b8]'
                        }`}
                        required
                        // Key Limits
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          
                          if (!/[A-Za-z\s.'-]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        // Error Handling
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
                          setSchoolError("");
                          const errorSpan = document.getElementById('school-error');
                          if (errorSpan) errorSpan.style.display = 'none';
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {isSchoolTouched && schoolError && (
                    <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{schoolError}</p>
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