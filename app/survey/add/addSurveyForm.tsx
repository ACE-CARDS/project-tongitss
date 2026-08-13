// same logic as thesis
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import BackButton from "@/components/ui/backButton";

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
  isScholar?: boolean;
}

interface AddSurveyFormProps {
  categories: Category[];
  schools: School[];
  returnTo?: string;
}

export default function AddSurveyForm({ categories, schools, returnTo }: AddSurveyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [authors, setAuthors] = useState<Author[]>([{ id: 1, isScholar: true }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [searchResults, setSearchResults] = useState<Map<number, Array<{id: number, fname: string, lname: string, minit: string | null, email: string}>>>(new Map());
  const [showSearchDropdown, setShowSearchDropdown] = useState<Map<number, boolean>>(new Map());
  const [emailSuggestions, setEmailSuggestions] = useState<Map<number, Array<{email: string, memberId: number, fname: string, lname: string, minit: string | null}>>>(new Map());
  const [showScholarDialog, setShowScholarDialog] = useState<Map<number, boolean>>(new Map());

  const [returnUrl, setReturnUrl] = useState<string>("/survey");
  const [availableCategories, setAvailableCategories] = useState<Category[]>(categories);
  const [availableSchools, setAvailableSchools] = useState<School[]>(schools);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");

  const [categoryError, setCategoryError] = useState("");
  const [schoolError, setSchoolError] = useState("");
  const [isCategoryTouched, setIsCategoryTouched] = useState(false);
  const [isSchoolTouched, setIsSchoolTouched] = useState(false);
  const [surveyLinkError, setSurveyLinkError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [pendingNewCategories, setPendingNewCategories] = useState<Category[]>([]);
  const [pendingNewSchools, setPendingNewSchools] = useState<School[]>([]);
  const formSubmittedRef = useRef(false);

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
              memberId: member.id,
              isScholar: true // Members are automatically scholars
            }]);
          }
        } else {
          // Fallback: try to get from author table by email
          const { data: userEmail } = await supabase.auth.getUser();
          if (userEmail.user?.email) {
            const { data: existingAuthor } = await supabase
              .from("author")
              .select("id, author_fname, author_lname, author_minit, author_email, mem_id, scholar")
              .eq("author_email", userEmail.user.email)
              .maybeSingle();
            
            if (existingAuthor) {
              setAuthors([{
                id: 1,
                firstName: existingAuthor.author_fname,
                middleInitial: existingAuthor.author_minit || "",
                lastName: existingAuthor.author_lname,
                email: existingAuthor.author_email,
                memberId: existingAuthor.mem_id,
                isScholar: existingAuthor.scholar || false
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
  const searchMembers = async (searchTerm: string, authorIndex: number) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults(prev => new Map(prev).set(authorIndex, []));
      return;
    }

    const { data: members, error } = await supabase
      .from("member")
      .select("id, mem_fname, mem_lname, mem_minit, mem_email")
      .or(`mem_fname.ilike.%${searchTerm}%,mem_lname.ilike.%${searchTerm}%,mem_email.ilike.%${searchTerm}%`)
      .limit(5);

    if (!error && members) {
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
    }
  };

  const searchMembersByFullName = async (firstName: string, lastName: string, middleInitial: string, authorIndex: number) => {
    if (!firstName || !lastName) {
      setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));
      return;
    }

    const normalizedMiddle = middleInitial ? middleInitial.charAt(0).toUpperCase() : '';
    
    const { data: members, error } = await supabase
      .from("member")
      .select("id, mem_fname, mem_lname, mem_minit, mem_email")
      .ilike("mem_fname", firstName)
      .ilike("mem_lname", lastName)
      .limit(3);

    if (!error && members) {
      const matchingMembers = members.filter(m => {
        const memberMiddle = m.mem_minit ? m.mem_minit.charAt(0).toUpperCase() : '';
        return memberMiddle === normalizedMiddle;
      });
      
      if (matchingMembers.length > 0) {
        setEmailSuggestions(prev => new Map(prev).set(authorIndex, matchingMembers.map(m => ({
          email: m.mem_email,
          memberId: m.id,
          fname: m.mem_fname,
          lname: m.mem_lname,
          minit: m.mem_minit
        }))));
      } else {
        setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));
      }
    } else {
      setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));
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
      memberId: member.id,
      isScholar: true // Members are automatically scholars
    };
    setAuthors(updatedAuthors);
    setShowSearchDropdown(prev => new Map(prev).set(authorIndex, false));
    setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));
    
    // Update input fields
    const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[authorIndex] as HTMLInputElement;
    const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[authorIndex] as HTMLInputElement;
    const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[authorIndex] as HTMLInputElement;
    const emailInput = document.querySelectorAll('input[name="email[]"]')[authorIndex] as HTMLInputElement;
    
    if (firstNameInput) firstNameInput.value = member.fname;
    if (middleInitialInput) middleInitialInput.value = member.minit || "";
    if (lastNameInput) lastNameInput.value = member.lname;
    if (emailInput) emailInput.value = member.email;
    
    validateForm();
  };

  // Select email suggestion
  const selectEmailSuggestion = (suggestion: {email: string, memberId: number, fname: string, lname: string, minit: string | null}, authorIndex: number) => {
    setAuthors(prev =>
      prev.map((author, index) =>
        index === authorIndex
          ? {
              ...author,
              email: suggestion.email,
              memberId: suggestion.memberId,
              firstName: suggestion.fname,
              lastName: suggestion.lname,
              middleInitial: suggestion.minit || "",
              isScholar: true // Members are automatically scholars
            }
          : author
      )
    );

    setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));

    const errorSpan = document.getElementById(`email-error-${authorIndex}`);
    if (errorSpan) {
      errorSpan.style.display = "none";
    }

    setTimeout(() => {
      validateForm();
    }, 0);
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
        
        if (firstNameInputs[i]?.value && lastNameInputs[i]?.value && 
            firstNameInputs[j]?.value && lastNameInputs[j]?.value &&
            firstNameInputs[i].value.toLowerCase() === firstNameInputs[j].value.toLowerCase() &&
            lastNameInputs[i].value.toLowerCase() === lastNameInputs[j].value.toLowerCase()) {
          
          const middleI = (middleInitialInputs[i]?.value || '').trim().charAt(0).toUpperCase();
          const middleJ = (middleInitialInputs[j]?.value || '').trim().charAt(0).toUpperCase();
          
          if (middleI === middleJ) {
            return `Author ${i + 1} and Author ${j + 1} have the same full name.`;
          }
        }
      }
    }
    return null;
  };

  const checkDuplicateSurveyLink = async (link: string) => {
    if (!link) return;
    
    const supabase = createClient();
    const { data, error } = await supabase
      .from("survey")
      .select("id")
      .ilike("survey_link", link) // .ilike for case-insensitivity
      .maybeSingle();
    
    if (data) {
      setSurveyLinkError("This survey link is already in use. Please provide a unique link.");
    } else {
      setSurveyLinkError("");
    }
    validateForm();
  };

  // Validate entire form
  const validateForm = () => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const titleValid = titleInput?.value && titleInput.value.length >= 5;
    const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const descriptionValid = descriptionInput?.value && descriptionInput.value.length >= 10;
    const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
    const categoryValid = !!categorySelect?.value && !categoryError;
    const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
    const schoolValid = !!schoolSelect?.value && !schoolError;
    const surveyLinkValid = !surveyLinkError;
    const respondentsInput = document.querySelector('input[name="respondents"]') as HTMLInputElement;
    const respondentsValid = respondentsInput?.value && respondentsInput.value.length >= 2;
    const datesValid = !!startDate && !!endDate && !dateError;
    const firstNameInputs = document.querySelectorAll<HTMLInputElement>('input[name="firstName[]"]');
    const lastNameInputs = document.querySelectorAll<HTMLInputElement>('input[name="lastName[]"]');
    const emailInputs = document.querySelectorAll<HTMLInputElement>('input[name="email[]"]');

    let hasValidAuthor = false;
    for (let i = 0; i < firstNameInputs.length; i++) {
      if (firstNameInputs[i]?.value && lastNameInputs[i]?.value && emailInputs[i]?.value) {
        hasValidAuthor = true;
        break;
      }
    }
    
    let hasDuplicateAuthor = false;
    for (let i = 0; i < emailInputs.length; i++) {
      for (let j = i + 1; j < emailInputs.length; j++) {
        if (emailInputs[i]?.value && emailInputs[j]?.value && 
            emailInputs[i].value.toLowerCase() === emailInputs[j].value.toLowerCase()) {
          hasDuplicateAuthor = true;
          break;
        }
        
        if (firstNameInputs[i]?.value && lastNameInputs[i]?.value && 
            firstNameInputs[j]?.value && lastNameInputs[j]?.value &&
            firstNameInputs[i].value.toLowerCase() === firstNameInputs[j].value.toLowerCase() &&
            lastNameInputs[i].value.toLowerCase() === lastNameInputs[j].value.toLowerCase()) {
          
          const middleInitialsInputs = document.querySelectorAll<HTMLInputElement>('input[name="middleInitial[]"]');
          const middleI = (middleInitialsInputs[i]?.value || '').trim().charAt(0).toUpperCase();
          const middleJ = (middleInitialsInputs[j]?.value || '').trim().charAt(0).toUpperCase();
          
          if (middleI === middleJ) {
            hasDuplicateAuthor = true;
            break;
          }
        }
      }
      if (hasDuplicateAuthor) break;
    }
    
    // If non-member hasn't selected scholar status
    let hasScholarStatusSelected = true;
    for (let i = 0; i < authors.length; i++) {
      if (!authors[i].memberId && authors[i].isScholar === undefined) {
        hasScholarStatusSelected = false;
        break;
      }
    }
    
    const privacyCheckbox = document.querySelector('input[name="privacy"]') as HTMLInputElement;
    const privacyValid = privacyCheckbox?.checked;
    
    const hasErrors = !titleValid || !descriptionValid || !categoryValid || 
                      !schoolValid || !surveyLinkValid || !respondentsValid || !datesValid || 
                      !hasValidAuthor || !!categoryError || !!schoolError || hasDuplicateAuthor || 
                      !privacyValid || !hasScholarStatusSelected;
    
    setIsFormValid(!hasErrors);
  };

  useEffect(() => {
    const savedDraft = sessionStorage.getItem("surveyDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        
        const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement | null;
        const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null;
        const startDateInput = document.querySelector('input[name="start_date"]') as HTMLInputElement | null;
        const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement | null;
        const surveyLinkInput = document.querySelector('input[name="survey_link"]') as HTMLInputElement | null;
        const respondentsInput = document.querySelector('input[name="respondents"]') as HTMLInputElement | null;
        const maxRespondentsInput = document.querySelector('input[name="max_respondents"]') as HTMLInputElement | null;

        if (titleInput) titleInput.value = draft.title || "";
        if (descriptionInput) descriptionInput.value = draft.description || "";
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
            setIsCategoryTouched(true);
            setCategoryError("");
            validateForm();
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
            validateForm();
          }, 100);
        }

        if (draft.authors?.length) {
          setAuthors(draft.authors.map((author: any, index: number) => ({
            id: index + 1,
            firstName: author.firstName,
            middleInitial: author.middleInitial,
            lastName: author.lastName,
            email: author.email,
            memberId: author.memberId,
            isScholar: author.isScholar || false
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
            validateForm();
          }, 100);
        }
        
        setTimeout(() => {
          validateForm();
        }, 200);
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  }, [availableCategories, availableSchools]);

  useEffect(() => {
    if (returnTo) {
      sessionStorage.setItem("surveyReturnUrl", returnTo);
      setReturnUrl(returnTo);
    } else {
      const storedReturnUrl = sessionStorage.getItem("surveyReturnUrl");
      if (storedReturnUrl) {
        setReturnUrl(storedReturnUrl);
      } else {
        setReturnUrl("/survey");
      }
    }
  }, [returnTo]);

  // Validate form when states change
  useEffect(() => {
    validateForm();
  }, [startDate, endDate, dateError, surveyLinkError, categoryError, schoolError, authors]);

  const addAuthor = () => {
    const newId = authors.length + 1;
    setAuthors([...authors, { 
      id: newId, 
      firstName: "",
      middleInitial: "",
      lastName: "",
      email: "",
      memberId: null,
      isScholar: undefined
    }]);
  };

  const removeAuthor = (id: number) => {
    if (authors.length > 1) {
      const updatedAuthors = authors.filter(author => author.id !== id);
      const reindexedAuthors = updatedAuthors.map((author, idx) => ({ 
        ...author, 
        id: idx + 1
      }));
      setAuthors(reindexedAuthors);
      
      // Clean up search results for removed author
      setSearchResults(prev => {
        const newMap = new Map(prev);
        const authorIndex = authors.findIndex(a => a.id === id);
        if (authorIndex !== -1) {
          newMap.delete(authorIndex);
          setEmailSuggestions(prevMap => {
            const newEmailMap = new Map(prevMap);
            newEmailMap.delete(authorIndex);
            return newEmailMap;
          });
          setShowSearchDropdown(prevMap => {
            const newShowMap = new Map(prevMap);
            newShowMap.delete(authorIndex);
            return newShowMap;
          });
          setShowScholarDialog(prevMap => {
            const newDialogMap = new Map(prevMap);
            newDialogMap.delete(authorIndex);
            return newDialogMap;
          });
        }
        return newMap;
      });
    }
  };

  const updateAuthor = (id: number, field: keyof Author, value: string | boolean | undefined) => {
    setAuthors(prev => prev.map(auth => 
      auth.id === id ? { ...auth, [field]: value } : auth
    ));
  };

  const handleScholarResponse = (authorIndex: number, isScholar: boolean) => {
    const updatedAuthors = [...authors];
    updatedAuthors[authorIndex].isScholar = isScholar;
    setAuthors(updatedAuthors);
    setShowScholarDialog(prev => new Map(prev).set(authorIndex, false));
    validateForm();
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
        setSelectedCategory(existingCategory.id);
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = existingCategory.id;
        }
        setShowNewCategory(false);
        setNewCategoryName("");
        setCategoryError("");
        setIsCategoryTouched(true);
        validateForm();
        return;
      }

      const existingPending = pendingNewCategories.find(
        c => c.r_category_name.toLowerCase() === newCategoryName.toLowerCase()
      );

      if (existingPending) {
        setSelectedCategory(existingPending.id);
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = existingPending.id;
        }
        setShowNewCategory(false);
        setNewCategoryName("");
        setCategoryError("");
        setIsCategoryTouched(true);
        validateForm();
        return;
      }

      const { data: existingCategoryInDb } = await supabase
        .from("r_category")
        .select("id, r_category_name")
        .ilike("r_category_name", newCategoryName)
        .maybeSingle();

      if (existingCategoryInDb) {
        console.log("Existing category found in DB:", existingCategoryInDb);
        setAvailableCategories(prev => [...prev, existingCategoryInDb]);
        setSelectedCategory(existingCategoryInDb.id);
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = existingCategoryInDb.id;
        }
        setShowNewCategory(false);
        setNewCategoryName("");
        setCategoryError("");
        setIsCategoryTouched(true);
        validateForm();
        return;
      }

      // Temporary category with a temporary ID
      const tempId = `temp-cat-${Date.now()}`;
      const tempCategory: Category = {
        id: tempId,
        r_category_name: newCategoryName.trim()
      };

      // Add to list
      setPendingNewCategories(prev => [...prev, tempCategory]);
      setAvailableCategories(prev => [...prev, tempCategory]);
      setSelectedCategory(tempId);
      
      // Update select element
      const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
      if (categorySelect) {
        categorySelect.value = tempId;
      }

      setShowNewCategory(false);
      setNewCategoryName("");
      setCategoryError("");
      setIsCategoryTouched(true);
      validateForm();
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
        setSelectedSchool(existingSchool.id);
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = existingSchool.id;
        }
        setShowNewSchool(false);
        setNewSchoolName("");
        setSchoolError("");
        setIsSchoolTouched(true);
        validateForm();
        return;
      }

      const existingPending = pendingNewSchools.find(
        s => s.school_name.toLowerCase() === newSchoolName.toLowerCase()
      );

      if (existingPending) {
        setSelectedSchool(existingPending.id);
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = existingPending.id;
        }
        setShowNewSchool(false);
        setNewSchoolName("");
        setSchoolError("");
        setIsSchoolTouched(true);
        validateForm();
        return;
      }

      const { data: existingSchoolInDb } = await supabase
        .from("school")
        .select("id, school_name")
        .ilike("school_name", newSchoolName)
        .maybeSingle();

      if (existingSchoolInDb) {
        setAvailableSchools(prev => [...prev, existingSchoolInDb]);
        setSelectedSchool(existingSchoolInDb.id);
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = existingSchoolInDb.id;
        }
        setShowNewSchool(false);
        setNewSchoolName("");
        setSchoolError("");
        setIsSchoolTouched(true);
        validateForm();
        return;
      }

      // Temporary school with a temporary ID
      const tempId = `temp-school-${Date.now()}`;
      const tempSchool: School = {
        id: tempId,
        school_name: newSchoolName.trim()
      };

      // Add to list
      setPendingNewSchools(prev => [...prev, tempSchool]);
      setAvailableSchools(prev => [...prev, tempSchool]);
      setSelectedSchool(tempId);
      
      // Update select element
      const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
      if (schoolSelect) {
        schoolSelect.value = tempId;
      }

      setShowNewSchool(false);
      setNewSchoolName("");
      setSchoolError("");
      setIsSchoolTouched(true);
      validateForm();
    } catch (error) {
      console.error("Error adding school:", error);
      setSchoolError("An unexpected error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate category and school before submission
    const categorySelect = e.currentTarget.elements.namedItem("category") as HTMLSelectElement;
    const schoolSelect = e.currentTarget.elements.namedItem("school") as HTMLSelectElement;
    
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

    if (startDate && endDate && endDate <= startDate) {
      setDateError("End date must be after start date");
      const dateSection = document.getElementById('end_date');
      if (dateSection) {
        dateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (hasError) {
      const errorElement = document.querySelector('.border-red-500');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    formSubmittedRef.current = true;

    try {
      const form = e.currentTarget;
      
      const titleInput = form.elements.namedItem("title") as HTMLInputElement | null;
      const descriptionInput = form.elements.namedItem("description") as HTMLTextAreaElement | null;
      const startDateInput = form.elements.namedItem("start_date") as HTMLInputElement | null;
      const endDateInput = form.elements.namedItem("end_date") as HTMLInputElement | null;
      const surveyLinkInput = form.elements.namedItem("survey_link") as HTMLInputElement | null;
      const respondentsInput = form.elements.namedItem("respondents") as HTMLInputElement | null;
      const maxRespondentsInput = form.elements.namedItem("max_respondents") as HTMLInputElement | null;

      if (!titleInput?.value || !descriptionInput?.value ||
          !startDateInput?.value || !endDateInput?.value || !surveyLinkInput?.value || !respondentsInput?.value) {
        throw new Error("Please fill in all required fields");
      }

      // Check duplicate survey link
      if (surveyLinkInput.value) {
        const { data: existingSurvey } = await supabase
          .from("survey")
          .select("id")
          .ilike("survey_link", surveyLinkInput.value)
          .maybeSingle();
        
        if (existingSurvey) {
          throw new Error("This survey link is already in use. Please provide a unique link.");
        }
      }

      // Get the selected category ID
      const selectedCategoryId = categorySelect.value;
      
      // Check if needs to be saved
      let finalCategoryId = selectedCategoryId;
      const isTempCategory = selectedCategoryId.startsWith('temp-cat-');
      
      if (isTempCategory) {
        // Find the pending category
        const pendingCategory = pendingNewCategories.find(c => c.id === selectedCategoryId);
        if (pendingCategory) {
          // Save to database
          const { data: newCategory, error: categoryError } = await supabase
            .from("r_category")
            .insert({ r_category_name: pendingCategory.r_category_name })
            .select("id, r_category_name")
            .single();

          if (categoryError) {
            throw new Error(`Failed to save category: ${categoryError.message}`);
          }

          // Update final category ID
          finalCategoryId = newCategory.id;
          
          // Update pending categories and available categories
          setPendingNewCategories(prev => prev.filter(c => c.id !== selectedCategoryId));
          setAvailableCategories(prev => 
            prev.map(c => c.id === selectedCategoryId ? newCategory : c)
          );
        }
      }

      // Same logic for school
      const selectedSchoolId = schoolSelect.value;
      
      let finalSchoolId = selectedSchoolId;
      const isTempSchool = selectedSchoolId.startsWith('temp-school-');
      
      if (isTempSchool) {
        const pendingSchool = pendingNewSchools.find(s => s.id === selectedSchoolId);
        if (pendingSchool) {
          const { data: defaultProvince } = await supabase
            .from("province")
            .select("id")
            .limit(1)
            .single();

          const { data: newSchool, error: schoolError } = await supabase
            .from("school")
            .insert({ 
              school_name: pendingSchool.school_name,
              province: defaultProvince?.id || 1
            })
            .select("id, school_name")
            .single();

          if (schoolError) {
            throw new Error(`Failed to save school: ${schoolError.message}`);
          }

          finalSchoolId = newSchool.id;
          
          setPendingNewSchools(prev => prev.filter(s => s.id !== selectedSchoolId));
          setAvailableSchools(prev => 
            prev.map(s => s.id === selectedSchoolId ? newSchool : s)
          );
        }
      }

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
        const isScholar = authors[i]?.isScholar || false;

        if (memberIdFromState) {
          // Verify email matches registered email
          const { data: member } = await supabase
            .from("member")
            .select("mem_email")
            .eq("id", memberIdFromState)
            .single();
          
          if (member && member.mem_email.toLowerCase() !== emailInputs[i].value.toLowerCase()) {
            throw new Error(`Author ${i + 1} is a member but the email does not match the registered organization email.`);
          }
        }

        // First check if author exists by email
        const { data: existingAuthor } = await supabase
          .from("author")
          .select("id")
          .eq("author_email", emailInputs[i].value)
          .maybeSingle();

        if (existingAuthor) {
          authorIds.push(existingAuthor.id);
        } else {
          const rawMinit = (document.querySelectorAll('input[name="middleInitial[]"]')[i] as HTMLInputElement)?.value || "";
          
          const cleanMinit = rawMinit
            .replace(/[^a-zA-Z]/g, "") 
            .substring(0, 2)
            .toUpperCase() || null;

          const { data: newAuthor, error: authorError } = await supabase
            .from("author")
            .insert({
              author_fname: firstNameInputs[i].value,
              author_lname: lastNameInputs[i].value,
              author_email: emailInputs[i].value,
              author_minit: cleanMinit || null,
              mem_id: memberIdFromState || null,
              scholar: isScholar
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
          survey_start: startDateInput.value,
          survey_end: endDateInput.value,
          survey_link: surveyLinkInput.value,
          survey_respondents: respondentsInput.value,
          max_respondents: maxRespondentsInput?.value ? parseInt(maxRespondentsInput.value) : null,
          r_category: parseInt(finalCategoryId),
          school: parseInt(finalSchoolId),
          survey_status: 'pending',
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
      router.push(`/survey/add/success?returnTo=${encodeURIComponent(returnUrl)}`);
      
    } catch (error) {
      console.error("Submission error:", error);
      alert(error instanceof Error ? error.message : "Failed to submit survey");
      
      setIsSubmitting(false);
      formSubmittedRef.current = false;
    } finally {
      setTimeout(() => {
        if (document.querySelector('form')) {
          setIsSubmitting(false);
          formSubmittedRef.current = false;
        }
      }, 500);
    }
  };
  

  const [description, setDescription] = useState("");

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
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
        <h1 className="text-2xl font-oswald font-bold text-[#011638] mt-6">Add New Survey</h1>
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
                    Survey Title <span className="text-[#eec643]">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={300}
                    placeholder="Enter survey title"
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
                      validateForm();
                    }}
                  />
                  <span id="title-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                </div>

                <div>
                  <div className="flex sm:grid sm:grid-cols-2 gap-4 items-center">
                    <label htmlFor="description" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                      Description <span className="text-[#eec643]">*</span>
                    </label>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={handleDescriptionChange}
                    required
                    rows={4}
                    maxLength={3000}
                    placeholder="Enter survey description"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('description-error');
                      if (input.value.length === 0) {
                        errorSpan!.textContent = 'Description is required.';
                        errorSpan!.style.display = 'block';
                      } else if (input.value.length < 10) {
                        errorSpan!.textContent = 'Description must be at least 10 characters.';
                        errorSpan!.style.display = 'block';
                      } else {
                        errorSpan!.style.display = 'none';
                      }
                      validateForm();
                    }}
                  />
                  <span id="description-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                    <h3 className="font-oswald font-bold text-[#011638]">AUTHOR {index + 1}</h3>
                    {index > 0 && (
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
                          value={author.firstName || ""}
                          disabled={index === 0}
                          className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          onChange={(e) => {
                            if (index === 0) return;
                            const updatedAuthors = [...authors];
                            updatedAuthors[index] = {
                              ...updatedAuthors[index],
                              firstName: e.target.value
                            };
                            setAuthors(updatedAuthors);
                          }}
                          onKeyDown={(e) => {
                            if (index === 0) return;
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }
                            if (!/[A-Za-z\s\-'.]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onInput={(e) => {
                            if (index === 0) return;
                            const input = e.target as HTMLInputElement;
                            const errorSpan = document.getElementById(`firstname-error-${index}`);
                            const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                            const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;

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
                              if (lastNameInput?.value && lastNameInput.value.length >= 2) {
                                searchMembersByFullName(input.value, lastNameInput.value, middleInitialInput?.value || '', index);
                              }
                            }
                            validateForm();
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
                          value={author.middleInitial || ""}
                          disabled={index === 0}
                          className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          onChange={(e) => {
                            if (index === 0) return;
                            const updatedAuthors = [...authors];
                            updatedAuthors[index] = {
                              ...updatedAuthors[index],
                              middleInitial: e.target.value
                            };
                            setAuthors(updatedAuthors);
                          }}
                          onKeyDown={(e) => {
                            if (index === 0) return;
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }
                            if (!/[A-Za-z]/.test(e.key)) {
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
                        value={author.lastName || ""}
                        disabled={index === 0}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        onChange={(e) => {
                          if (index === 0) return;
                          const updatedAuthors = [...authors];
                          updatedAuthors[index] = {
                            ...updatedAuthors[index],
                            lastName: e.target.value
                          };
                          setAuthors(updatedAuthors);
                        }}
                        onKeyDown={(e) => {
                          if (index === 0) return;
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          if (!/[A-Za-z\s\-'.]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e) => {
                          if (index === 0) return;
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById(`lastname-error-${index}`);
                          const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                          const lastNameInput = input;
                          const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;

                          if (input.value.length === 0) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Last Name is required.';
                              errorSpan.style.display = 'block';
                            }
                            validateForm();
                            return;
                          } else if (input.value.length < 2) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Last Name must be at least 2 characters.';
                              errorSpan.style.display = 'block';
                            }
                            validateForm();
                            return;
                          }

                          if (firstNameInput?.value) {
                            searchMembersByFullName(firstNameInput.value, input.value, middleInitialInput?.value || '', index);
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
                              
                              if (otherFirstName && otherLastName && currentFirstName && currentLastName) {
                                const firstNameMatch = otherFirstName.toLowerCase() === currentFirstName.toLowerCase();
                                const lastNameMatch = otherLastName.toLowerCase() === currentLastName.toLowerCase();
                                
                                if (firstNameMatch && lastNameMatch) {
                                  const middleMatch = normalizedCurrentMiddle === normalizedOtherMiddle;
                                  
                                  if (middleMatch) {
                                    if (errorSpan) {
                                      const authorName = `${currentFirstName} ${normalizedCurrentMiddle ? normalizedCurrentMiddle + '. ' : ''}${currentLastName}`;
                                      errorSpan.textContent = `Author with the same name "${authorName}" already exists (Author ${i + 1}).`;
                                      errorSpan.style.display = 'block';
                                    }
                                    validateForm();
                                    return;
                                  }
                                }
                              }
                            }
                          }

                          if (errorSpan) {
                            errorSpan.style.display = 'none';
                          }
                          validateForm();
                        }}
                      />
                      <span id={`lastname-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                    </div>
                    
                    <div className="relative">
                      <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Email <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email[]"
                        required
                        maxLength={254}
                        placeholder="Email"
                        value={author.email || ""}
                        disabled={index === 0}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                        onFocus={async (e) => {
                          if (index === 0) return;
                          const input = e.target as HTMLInputElement;
                          
                          // Show suggestions if email is empty
                          if (!input.value || input.value.length === 0) {
                            const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                            const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                            const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                            
                            if (firstNameInput?.value && lastNameInput?.value) {
                              const normalizedMiddle = middleInitialInput?.value ? middleInitialInput.value.charAt(0).toUpperCase() : '';
                              
                              const { data: matchingMembers } = await supabase
                                .from("member")
                                .select("id, mem_fname, mem_lname, mem_minit, mem_email")
                                .ilike("mem_fname", firstNameInput.value)
                                .ilike("mem_lname", lastNameInput.value)
                                .limit(3);
                              
                              if (matchingMembers && matchingMembers.length > 0) {
                                const exactMatch = matchingMembers.find(m => {
                                  const memberMiddle = m.mem_minit ? m.mem_minit.charAt(0).toUpperCase() : '';
                                  return memberMiddle === normalizedMiddle;
                                });
                                
                                if (exactMatch) {
                                  setEmailSuggestions(prev => new Map(prev).set(index, [{
                                    email: exactMatch.mem_email,
                                    memberId: exactMatch.id,
                                    fname: exactMatch.mem_fname,
                                    lname: exactMatch.mem_lname,
                                    minit: exactMatch.mem_minit
                                  }]));
                                } else {
                                  setEmailSuggestions(prev => new Map(prev).set(index, []));
                                }
                              } else {
                                setEmailSuggestions(prev => new Map(prev).set(index, []));
                              }
                            } else {
                              setEmailSuggestions(prev => new Map(prev).set(index, []));
                            }
                          }
                        }}
                        onInput={async (e) => {
                          if (index === 0) return;
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById(`email-error-${index}`);
                          const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                          const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                          const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                          // Clear suggestions when user starts typing
                          if (input.value.length > 0) {
                            setEmailSuggestions(prev => new Map(prev).set(index, []));
                          }

                          if (input.value.length === 0) {
                            errorSpan!.textContent = "Email is required.";
                            errorSpan!.style.display = "block";

                                if (firstNameInput?.value && lastNameInput?.value) {
                                    await searchMembersByFullName(
                                    firstNameInput.value,
                                    lastNameInput.value,
                                    middleInitialInput?.value || "",
                                    index
                                    );
                                }

                            validateForm();
                            return;
                            }
                                                    
                          if (!emailRegex.test(input.value)) {
                            errorSpan!.textContent = 'Please enter a valid email address.';
                            errorSpan!.style.display = 'block';
                            validateForm();
                            return;
                          }

                          // Check if author has memberId and verify email matches
                          if (author.memberId) {
                            const { data: member } = await supabase
                              .from("member")
                              .select("mem_email")
                              .eq("id", author.memberId)
                              .single();
                            
                            if (member && member.mem_email.toLowerCase() !== input.value.toLowerCase()) {
                              errorSpan!.textContent = 'Members must use their registered organization email.';
                              errorSpan!.style.display = 'block';
                              validateForm();
                              return;
                            }
                          }

                          // Check duplicate emails
                          const allEmails = document.querySelectorAll('input[name="email[]"]');
                          for (let i = 0; i < allEmails.length; i++) {
                            if (i !== index) {
                              const otherEmail = (allEmails[i] as HTMLInputElement).value;
                              if (otherEmail && otherEmail.toLowerCase() === input.value.toLowerCase()) {
                                errorSpan!.textContent = `This email is already used for Author ${i + 1}.`;
                                errorSpan!.style.display = 'block';
                                validateForm();
                                return;
                              }
                            }
                          }

                          // Check if email matches a member
                          if (firstNameInput?.value && lastNameInput?.value) {
                            const normalizedMiddle = middleInitialInput?.value ? middleInitialInput.value.charAt(0).toUpperCase() : '';
                            
                            const { data: matchingMembers } = await supabase
                              .from("member")
                              .select("id, mem_fname, mem_lname, mem_minit, mem_email")
                              .ilike("mem_fname", firstNameInput.value)
                              .ilike("mem_lname", lastNameInput.value)
                              .limit(3);
                            
                            if (matchingMembers && matchingMembers.length > 0) {
                              const memberWithTypedEmail = matchingMembers.find(m => 
                                m.mem_email.toLowerCase() === input.value.toLowerCase()
                              );
                              
                              if (memberWithTypedEmail) {
                                // Found a member with matching email
                                const updatedAuthors = [...authors];
                                updatedAuthors[index] = {
                                  ...updatedAuthors[index],
                                  memberId: memberWithTypedEmail.id,
                                  isScholar: true // auto scholar
                                };
                                setAuthors(updatedAuthors);
                                errorSpan!.style.display = 'none';
                                validateForm();
                                return;
                              }
                            }
                          }
                          
                          // Check existing author
                          const { data: existing } = await supabase
                          .from("author")
                          .select("id, author_fname, author_lname, mem_id, scholar")
                          .eq("author_email", input.value)
                          .maybeSingle();
                          
                          if (existing) {
                            const firstNameMatch = existing.author_fname?.toLowerCase() === firstNameInput?.value?.toLowerCase();
                            const lastNameMatch = existing.author_lname?.toLowerCase() === lastNameInput?.value?.toLowerCase();
                            
                            if (firstNameMatch && lastNameMatch) {
                              // Update author with existing info
                              const updatedAuthors = [...authors];
                              updatedAuthors[index] = {
                                ...updatedAuthors[index],
                                memberId: existing.mem_id || null,
                                isScholar: existing.scholar || false
                              };
                              setAuthors(updatedAuthors);
                              errorSpan!.style.display = 'none';
                            } else {
                              errorSpan!.textContent = 'This email is already registered to a different author.';
                              errorSpan!.style.display = 'block';
                            }
                          } else {
                            errorSpan!.style.display = 'none';
                          }
                          validateForm();
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setEmailSuggestions(prev => new Map(prev).set(index, []));
                          }, 200);
                        }}
                        onChange={(e) => updateAuthor(author.id, 'email', e.target.value)}
                      />
                      <span id={`email-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                      
                      {emailSuggestions.get(index) && emailSuggestions.get(index)!.length > 0 && index !== 0 && 
                      !document.getElementById(`lastname-error-${index}`)?.textContent?.includes("Author with the same name") && (
                        <div className="absolute z-50 mt-1 w-full bg-[#fbfaf8] border border-[#011638] rounded-lg shadow-xl overflow-hidden">
                          <div className="px-4 py-2 bg-[#1e4db7] bg-opacity-20 border-b border-[#011638] sticky top-0 flex justify-between items-center">
                            <span className="text-xs font-oswald font-semibold text-white">SUGGESTED EMAIL FOR THIS AUTHOR</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEmailSuggestions(prev => new Map(prev).set(index, []));
                                setShowSearchDropdown(prev => new Map(prev).set(index, false));
                              }}
                              className="text-white hover:text-gray-200 text-lg leading-none"
                              aria-label="Close"
                            >
                              ×
                            </button>
                          </div>
                          <div className="max-h-60 overflow-y-auto custom-scrollbar-blue">
                            {emailSuggestions.get(index)!.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  selectEmailSuggestion(suggestion, index);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-[#e0e7ff] hover:text-[#011638] text-[#475569] font-ubuntu-mono transition-colors border-b last:border-b-0 border-[#011638] border-opacity-20 cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{suggestion.email}</span>
                                  <span className="text-xs">{suggestion.fname} {suggestion.minit ? suggestion.minit + '. ' : ''}{suggestion.lname}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Scholar Status */}
                    {index !== 0 && author.firstName && author.lastName && author.email && !author.memberId && (
                    <div className="mt-2 pt-2">
                        <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        DOST Scholar Status <span className="text-[#eec643]">*</span>
                        </label>
                        <div className="flex items-center space-x-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={author.isScholar === true}
                                onChange={() => handleScholarResponse(index, true)}
                                className="peer appearance-none w-5 h-5 border-2 border-[#011638] rounded-sm checked:border-[#eec643] focus:ring-0 focus:outline-none bg-[#fbfaf8] cursor-pointer"
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-[#eec643] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none text-sm">
                                ♠
                            </span>
                            </div>
                            <span className="text-sm font-ubuntu-mono text-[#475569]">Yes</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={author.isScholar === false}
                                onChange={() => handleScholarResponse(index, false)}
                                className="peer appearance-none w-5 h-5 border-2 border-[#011638] rounded-sm checked:border-[#eec643] focus:ring-0 focus:outline-none bg-[#fbfaf8] cursor-pointer"
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-[#eec643] font-bold opacity-0 peer-checked:opacity-100 pointer-events-none text-sm">
                                ♠
                            </span>
                            </div>
                            <span className="text-sm font-ubuntu-mono text-[#475569]">No</span>
                        </label>
                        </div>
                    </div>
                    )}
                  </div>
                  {author.id < authors.length - 1 && <hr className="my-4 border-[#e0e7ff]" />}
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
              <h2 className="text-lg font-oswald font-semibold">Survey Details</h2>
            </div>
            <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
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
                      max={(() => {
                        const now = new Date();
                        const phTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
                        const year = phTime.getFullYear();
                        const month = String(phTime.getMonth() + 1).padStart(2, '0');
                        const day = String(phTime.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })()}
                      className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                      value={startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setStartDate(newStartDate);
                        
                        if (endDate && newStartDate >= endDate) {
                          setEndDate("");
                          setDateError("End date must be after start date");
                        } else {
                          setDateError("");
                        }
                        validateForm();
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
                      className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                        dateError ? 'border-red-500' : 'border-[#94a3b8]'
                      }`}
                      value={endDate}
                      min={(() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        
                        if (startDate) {
                          const startDateObj = new Date(startDate);
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          if (startDateObj.getTime() === today.getTime()) {
                            return tomorrow.toISOString().split('T')[0];
                          }
                          
                          const dayAfterStart = new Date(startDate);
                          dayAfterStart.setDate(dayAfterStart.getDate() + 1);
                          dayAfterStart.setHours(0, 0, 0, 0);
                          
                          if (dayAfterStart > tomorrow) {
                            return dayAfterStart.toISOString().split('T')[0];
                          }
                        }
                        
                        return tomorrow.toISOString().split('T')[0];
                      })()}
                      onChange={(e) => {
                        const newEndDate = e.target.value;
                        setEndDate(newEndDate);
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const endDateObj = new Date(newEndDate);
                        endDateObj.setHours(0, 0, 0, 0);
                        
                        if (endDateObj <= today) {
                          setDateError("End date must be after today");
                          setEndDate("");
                        } 
                        else if (startDate && newEndDate <= startDate) {
                          setDateError("End date must be after start date");
                          setEndDate("");
                        } 
                        else {
                          setDateError("");
                        }
                        validateForm();
                      }}
                      onBlur={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const endDateObj = endDate ? new Date(endDate) : null;
                        endDateObj?.setHours(0, 0, 0, 0);
                        
                        if (endDateObj && endDateObj <= today) {
                          setDateError("End date must be after today");
                          setEndDate("");
                        } else if (startDate && endDate && endDate <= startDate) {
                          setDateError("End date must be after start date");
                          setEndDate("");
                        }
                        validateForm();
                      }}
                    />
                    {dateError && (
                      <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{dateError}</p>
                    )}
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
                    maxLength={300}
                    placeholder="Enter survey URL"
                    className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                      surveyLinkError ? 'border-red-500' : 'border-[#94a3b8]'
                    }`}
                    onChange={async (e) => {
                      const input = e.target;
                      const value = input.value;
                      const errorSpan = document.getElementById('survey-link-error');
                      
                      setSurveyLinkError("");
                      
                      if (value.length === 0) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Survey link is required.';
                          errorSpan.style.display = 'block';
                        }
                        validateForm();
                        return;
                      }
                      
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
                        validateForm();
                        return;
                      }
                      
                      if (errorSpan) {
                        errorSpan.style.display = 'none';
                      }
                      
                      const supabase = createClient();
                      const { data: existingSurvey } = await supabase
                        .from("survey")
                        .select("id")
                        .ilike("survey_link", value)
                        .maybeSingle();
                      
                      if (existingSurvey) {
                        setSurveyLinkError("This survey link is already in use. Please provide a unique link.");
                        if (errorSpan) {
                          errorSpan.textContent = "This survey link is already in use. Please provide a unique link.";
                          errorSpan.style.display = 'block';
                        }
                      } else {
                        setSurveyLinkError("");
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                      }
                      validateForm();
                    }}
                  />
                  <span id="survey-link-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                    maxLength={200}
                    placeholder="Enter respondent criteria separated by commas"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        return;
                      }
                      if (!/[A-Za-z0-9\s,.'-]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('respondents-error');
                      
                      input.value = input.value.replace(/,{2,}/g, ',');

                      if (input.value.length === 0) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Target respondents are required.';
                          errorSpan.style.display = 'block';
                        }
                      } else if (input.value.length < 2) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Please provide at least 1 respondent criteria.';
                          errorSpan.style.display = 'block';
                        }
                      } else if (input.value.length > 200) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Target respondents must not exceed 200 characters.';
                          errorSpan.style.display = 'block';
                        }
                      } else {
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                      }
                      validateForm();
                    }}
                  />
                  <span id="respondents-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                    maxLength={6}
                    placeholder="e.g., 100"
                    className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        return;
                      }
                      const input = e.target as HTMLInputElement;
                      if (input.value.length >= 5 && /[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const errorSpan = document.getElementById('max-respondents-error');
                      const value = parseInt(input.value);
                      
                      if (input.value && (value < 1 || value > 10000)) {
                        if (errorSpan) {
                          errorSpan.textContent = 'Maximum respondents must be between 1 and 10,000.';
                          errorSpan.style.display = 'block';
                        }
                      } else {
                        if (errorSpan) {
                          errorSpan.style.display = 'none';
                        }
                      }
                      validateForm();
                    }}
                  />
                  <span id="max-respondents-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
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
                        value={selectedCategory}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                          categoryError ? 'border-red-500' : 'border-[#94a3b8]'
                        }`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedCategory(value);
                          setIsCategoryTouched(true);
                          if (!value || value === "") {
                            setCategoryError("Please select a category");
                          } else {
                            setCategoryError("");
                          }
                          validateForm();
                        }}
                        onBlur={() => {
                          const select = document.getElementById('category') as HTMLSelectElement;
                          if (!select?.value || select?.value === "") {
                            setCategoryError("Please select a category");
                            setIsCategoryTouched(true);
                          }
                          validateForm();
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
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            setCategoryError("");
                            const value = e.target.value;
                            if (!value.trim()) {
                              setCategoryError("Category name is required.");
                            } else if (value.trim().length < 2) {
                              setCategoryError("Category name must be at least 2 characters.");
                            } else {
                              setCategoryError("");
                            }
                          }}
                          onBlur={() => {
                            if (!newCategoryName.trim()) {
                              setCategoryError("Category name is required.");
                            } else if (newCategoryName.trim().length < 2) {
                              setCategoryError("Category name must be at least 2 characters.");
                            }
                          }}
                          placeholder="Enter new category name"
                          maxLength={50}
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                          required
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }
                            if (!/[A-Za-z\s.'-]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        {categoryError && (
                          <p className="text-xs mt-1 text-red-600 font-ubuntu-mono absolute left-0 -bottom-5">
                            {categoryError}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        disabled={!newCategoryName.trim() || newCategoryName.trim().length < 2}
                        className={`px-3 py-2 text-white bg-[#1e4db7] rounded hover:bg-[#0d21a1] transition-colors font-ubuntu-mono ${
                          (!newCategoryName.trim() || newCategoryName.trim().length < 2) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName("");
                          setCategoryError("");
                          validateForm();
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {isCategoryTouched && categoryError && !showNewCategory && (
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
                        value={selectedSchool}
                        className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                          schoolError ? 'border-red-500' : 'border-[#94a3b8]'
                        }`}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSelectedSchool(value);
                          setIsSchoolTouched(true);
                          if (!value || value === "") {
                            setSchoolError("Please select a school");
                          } else {
                            setSchoolError("");
                          }
                          validateForm();
                        }}
                        onBlur={() => {
                          const select = document.getElementById('school') as HTMLSelectElement;
                          if (!select?.value || select?.value === "") {
                            setSchoolError("Please select a school");
                            setIsSchoolTouched(true);
                          }
                          validateForm();
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
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={newSchoolName}
                          onChange={(e) => {
                            setNewSchoolName(e.target.value);
                            setSchoolError("");
                            const value = e.target.value;
                            if (!value.trim()) {
                              setSchoolError("School name is required.");
                            } else if (value.trim().length < 2) {
                              setSchoolError("School name must be at least 2 characters.");
                            } else {
                              setSchoolError("");
                            }
                          }}
                          onBlur={() => {
                            if (!newSchoolName.trim()) {
                              setSchoolError("School name is required.");
                            } else if (newSchoolName.trim().length < 2) {
                              setSchoolError("School name must be at least 2 characters.");
                            }
                          }}
                          placeholder="Enter new school name"
                          maxLength={50}
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                          required
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                              return;
                            }
                            if (!/[A-Za-z\s.'-]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                        {schoolError && (
                          <p className="text-xs mt-1 text-red-600 font-ubuntu-mono absolute left-0 -bottom-5">
                            {schoolError}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNewSchool}
                        disabled={!newSchoolName.trim() || newSchoolName.trim().length < 2}
                        className={`px-3 py-2 text-white bg-[#1e4db7] rounded hover:bg-[#0d21a1] transition-colors font-ubuntu-mono ${
                          (!newSchoolName.trim() || newSchoolName.trim().length < 2) ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewSchool(false);
                          setNewSchoolName("");
                          setSchoolError("");
                          validateForm();
                        }}
                        className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {isSchoolTouched && schoolError && !showNewSchool && (
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
                onChange={() => validateForm()}
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
                sessionStorage.removeItem("surveyDraft");
                router.back();
              }}
              className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className={`px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg transition-colors font-oswald ${
                (isSubmitting || !isFormValid) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a2a4f]'
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}