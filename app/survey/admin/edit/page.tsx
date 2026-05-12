"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
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
}

function EditSurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const surveyId = searchParams.get("id");

  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([{ id: 1 }]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [surveyLinkError, setSurveyLinkError] = useState("");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ title: string; message: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const [schoolError, setSchoolError] = useState("");
  const [dateError, setDateError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchResults, setSearchResults] = useState<Map<number, Array<{id: number, fname: string, lname: string, minit: string | null, email: string}>>>(new Map());
  const [showSearchDropdown, setShowSearchDropdown] = useState<Map<number, boolean>>(new Map());
  const [emailSuggestions, setEmailSuggestions] = useState<Map<number, Array<{email: string, memberId: number, fname: string, lname: string, minit: string | null}>>>(new Map());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // initialize formData
  const [formData, setFormData] = useState({
    survey_title: "",
    survey_desc: "",
    survey_keyword: "",
    survey_start: "",
    survey_end: "",
    survey_link: "",
    survey_respondents: "",
    max_respondents: "",
    r_category: "",
    school: "",
    survey_status: "",
  });

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
      memberId: member.id
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
    const updatedAuthors = [...authors];
    updatedAuthors[authorIndex] = {
      ...updatedAuthors[authorIndex],
      email: suggestion.email,
      memberId: suggestion.memberId,
      firstName: suggestion.fname,
      lastName: suggestion.lname,
      middleInitial: suggestion.minit || ""
    };
    setAuthors(updatedAuthors);
    setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));
    
    // Update email input field
    const emailInput = document.querySelectorAll('input[name="email[]"]')[authorIndex] as HTMLInputElement;
    if (emailInput) {
      emailInput.value = suggestion.email;
      // Trigger validation and clear error
      const errorSpan = document.getElementById(`email-error-${authorIndex}`);
      if (errorSpan) {
        errorSpan.style.display = 'none';
      }
    }
    
    // Update name fields if they're empty or mismatched
    const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[authorIndex] as HTMLInputElement;
    const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[authorIndex] as HTMLInputElement;
    const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[authorIndex] as HTMLInputElement;
    
    if (firstNameInput && (!firstNameInput.value || firstNameInput.value !== suggestion.fname)) {
      firstNameInput.value = suggestion.fname;
    }
    if (lastNameInput && (!lastNameInput.value || lastNameInput.value !== suggestion.lname)) {
      lastNameInput.value = suggestion.lname;
    }
    if (middleInitialInput && (!middleInitialInput.value || middleInitialInput.value !== (suggestion.minit || ""))) {
      middleInitialInput.value = suggestion.minit || "";
    }
    
    validateForm();
  };

  // Validate entire form
  const validateForm = () => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const titleValid = titleInput?.value && titleInput.value.length >= 5;
    const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const descriptionValid = descriptionInput?.value && descriptionInput.value.length >= 10;
    const keywordsInput = document.querySelector('input[name="keywords"]') as HTMLInputElement;
    const keywordsValid = keywordsInput?.value && keywordsInput.value.length >= 2;
    const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
    const categoryValid = !!categorySelect?.value;
    const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
    const schoolValid = !!schoolSelect?.value;
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
    
    const hasErrors = !titleValid || !descriptionValid || !keywordsValid || !categoryValid || 
                      !schoolValid || !surveyLinkValid || !respondentsValid || !datesValid || 
                      !hasValidAuthor || !!categoryError || !!schoolError || hasDuplicateAuthor;
    
    setIsFormValid(!hasErrors);
  };

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

  // Validate form when states change
  useEffect(() => {
    validateForm();
  }, [startDate, endDate, dateError, surveyLinkError, categoryError, schoolError, authors]);

  useEffect(() => {
    async function fetchSurvey() {
      if (!surveyId) return;
      
      const { data, error } = await supabase
        .from("survey")
        .select(`
          *,
          r_category (id, r_category_name),
          school (id, school_name),
          survey_author (
            author (
              id,
              author_fname,
              author_lname,
              author_minit,
              author_email,
              mem_id
            )
          )
        `)
        .eq("id", surveyId)
        .single();

      if (error) {
        console.error("Error fetching survey:", error);
        setSubmitError("Failed to load survey data.");
      } else {
        setSurvey(data);
        const start = data.survey_start.split("T")[0];
        const end = data.survey_end.split("T")[0];
        setStartDate(start);
        setEndDate(end);
        setFormData({
          survey_title: data.survey_title,
          survey_desc: data.survey_desc,
          survey_keyword: data.survey_keyword,
          survey_start: start,
          survey_end: end,
          survey_link: data.survey_link,
          survey_respondents: data.survey_respondents,
          max_respondents: data.max_respondents || "",
          r_category: data.r_category?.id.toString() || "",
          school: data.school?.id.toString() || "",
          survey_status: data.survey_status,
        });
      }
      setLoading(false);
    }

    fetchSurvey();
  }, [surveyId, supabase]);

  useEffect(() => {
    const fetchData = async () => {
      const [categoriesRes, schoolsRes] = await Promise.all([
        supabase.from("r_category").select("id, r_category_name").order("r_category_name"),
        supabase.from("school").select("id, school_name").order("school_name"),
      ]);
      if (categoriesRes.data) setAvailableCategories(categoriesRes.data);
      if (schoolsRes.data) setAvailableSchools(schoolsRes.data);
    };
    fetchData();
  }, [supabase]);

  // fetch authors
  useEffect(() => {
    if (!survey) return;
    
    const fetchAuthors = async () => {
      const { data, error } = await supabase
        .from("survey_author")
        .select(`
          author (
            id,
            author_fname,
            author_lname,
            author_minit,
            author_email,
            mem_id
          )
        `)
        .eq("survey", survey.id);

      if (data && data.length > 0) {
        const surveyAuthors = data.map((item: any, index: number) => ({
          id: index + 1,
          firstName: item.author.author_fname,
          middleInitial: item.author.author_minit || "",
          lastName: item.author.author_lname,
          email: item.author.author_email,
          memberId: item.author.mem_id
        }));
        setAuthors(surveyAuthors);
      }
    };
    fetchAuthors();
  }, [survey, supabase]);

  // Check if end date is past
  const [isPastDate, setIsPastDate] = useState(false);

  useEffect(() => {
    if (!formData.survey_end) return;
    const endDateObj = new Date(formData.survey_end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newIsPastDate = endDateObj < today;
    setIsPastDate(newIsPastDate);
  }, [formData.survey_end]);

  // notice based on status and date
  useEffect(() => {
    if (!formData.survey_end) return;
    const endDateObj = new Date(formData.survey_end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = endDateObj < today;
    const currentFormStatus = formData.survey_status;
    
    if (isPast) {
      if (currentFormStatus === 'archived') {
        setStatusNotice({
          title: "Archived Survey with Past Date",
          message: "This archived survey has passed its end date. It cannot be moved to Accepted or Pending until the end date is updated to a future date. Only Rejected or Archived status is available."
        });
      } else if (currentFormStatus === 'rejected') {
        setStatusNotice({
          title: "Rejected Survey with Past Date",
          message: "This rejected survey has passed its end date. It cannot be moved to Accepted or Pending until the end date is updated to a future date. Only Rejected or Archived status is available."
        });
      } else if (currentFormStatus === 'pending') {
        setStatusNotice({
          title: "Pending Survey with Past Date",
          message: "This survey's end date has passed. It cannot be moved to Accepted. Consider archiving it or updating the end date first."
        });
      } else if (currentFormStatus === 'accepted') {
        setStatusNotice({
          title: "Accepted Survey with Past Date",
          message: "This accepted survey has passed its end date. It cannot be moved back to Pending. Only Archived or Rejected status is available."
        });
      } else {
        setStatusNotice(null);
      }
    } else {
      setStatusNotice(null);
    }
  }, [formData.survey_end, formData.survey_status]);

  const addAuthor = () => {
    const maxId = authors.length > 0 ? Math.max(...authors.map(a => a.id)) : 0;
    setAuthors([...authors, { id: maxId + 1, memberId: null }]);
  };

  const removeAuthor = (id: number) => {
    if (authors.length > 1) {
      const updatedAuthors = authors.filter(author => author.id !== id);
      const reindexedAuthors = updatedAuthors.map((author, idx) => ({
        ...author,
        id: idx + 1
      }));
      setAuthors(reindexedAuthors);
    }
  };

  const checkDuplicateSurveyLink = async (link: string) => {
    if (!link) return;
    
    const { data, error } = await supabase
      .from("survey")
      .select("id")
      .ilike("survey_link", link)
      .neq("id", survey.id)
      .maybeSingle();
    
    if (data) {
      setSurveyLinkError("This survey link is already in use. Please provide a unique link.");
    } else {
      setSurveyLinkError("");
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
          setFormData(prev => ({ ...prev, r_category: existingCategory.id }));
        }
        setShowNewCategory(false);
        setNewCategoryName("");
        setCategoryError("");
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
            setFormData(prev => ({ ...prev, r_category: existingCategoryInDb.id }));
          }
        }, 100);
        
        setShowNewCategory(false);
        setNewCategoryName("");
        setCategoryError("");
        return;
      }

      const { data: newCategory, error: categoryError } = await supabase
        .from("r_category")
        .insert({ r_category_name: newCategoryName })
        .select("id, r_category_name")
        .single();

      if (categoryError) {
        if (categoryError.code === '23505') {
          setCategoryError("This category already exists in the database");
        } else if (categoryError.code === '23514') {
          setCategoryError("Category name is invalid");
        } else {
          setCategoryError(`Database error: ${categoryError.message}`);
        }
        return;
      }

      setAvailableCategories(prev => [...prev, newCategory]);

      setTimeout(() => {
        const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
        if (categorySelect) {
          categorySelect.value = newCategory.id;
          setFormData(prev => ({ ...prev, r_category: newCategory.id }));
        }
      }, 100);

      setShowNewCategory(false);
      setNewCategoryName("");
      setCategoryError("");
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
          setFormData(prev => ({ ...prev, school: existingSchool.id }));
        }
        setShowNewSchool(false);
        setNewSchoolName("");
        setSchoolError("");
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
            setFormData(prev => ({ ...prev, school: existingSchoolInDb.id }));
          }
        }, 100);
        
        setShowNewSchool(false);
        setNewSchoolName("");
        setSchoolError("");
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
        if (schoolError.code === '23505') {
          setSchoolError("This school already exists in the database");
        } else if (schoolError.code === '23514') {
          setSchoolError("School name is invalid");
        } else {
          setSchoolError(`Database error: ${schoolError.message}`);
        }
        return;
      }

      setAvailableSchools(prev => [...prev, newSchool]);

      setTimeout(() => {
        const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
        if (schoolSelect) {
          schoolSelect.value = newSchool.id;
          setFormData(prev => ({ ...prev, school: newSchool.id }));
        }
      }, 100);

      setShowNewSchool(false);
      setNewSchoolName("");
      setSchoolError("");
    } catch (error) {
      console.error("Error adding school:", error);
      setSchoolError("An unexpected error occurred. Please try again.");
    }
  };

  // status options
  const statusOptions = [
    { value: "accepted", label: "Accepted" },
    { value: "pending", label: "Pending" },
    { value: "archived", label: "Archived" },
    { value: "rejected", label: "Rejected" },
  ];

  // disable status options based on status and date
  const isStatusDisabled = (statusValue: string): { disabled: boolean; reason?: string } => {
    const currentStatus = survey?.survey_status;
    
    if (currentStatus === 'archived' && isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { 
          disabled: true, 
          reason: "Archived surveys with past end dates cannot be moved to Pending or Accepted. Please update the end date first." 
        };
      }
    }
    
    if (currentStatus === 'rejected' && isPastDate) {
      if (statusValue === 'pending' || statusValue === 'accepted') {
        return { 
          disabled: true, 
          reason: "Rejected surveys with past end dates cannot be moved to Pending or Accepted. Please update the end date first." 
        };
      }
    }
    
    if (currentStatus === 'pending' && isPastDate) {
      if (statusValue === 'accepted') {
        return { 
          disabled: true, 
          reason: "Cannot accept a survey with past end date. Please extend the end date first or archive/reject it." 
        };
      }
    }
    
    if (currentStatus === 'accepted' && isPastDate) {
      if (statusValue === 'pending') {
        return { 
          disabled: true, 
          reason: "Cannot change an accepted survey with past end date back to Pending. Only Archived or Rejected status is allowed." 
        };
      }
    }
    
    return { disabled: false };
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const { disabled, reason } = isStatusDisabled(newStatus);
    
    if (disabled) {
      setStatusError(reason || "Cannot change to this status due to restrictions.");
      setTimeout(() => setStatusError(null), 5000);
    } else {
      setStatusError(null);
      setFormData(prev => ({ ...prev, survey_status: newStatus }));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (startDate && endDate && endDate <= startDate) {
    setDateError("End date must be after start date");
    const dateSection = document.getElementById('end_date');
    if (dateSection) {
      dateSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Validate category and school before submission
  const form = e.currentTarget as HTMLFormElement;
  const categorySelect = form.elements.namedItem("category") as HTMLSelectElement | null;
  const schoolSelect = form.elements.namedItem("school") as HTMLSelectElement | null;
  
  let hasError = false;
  
  if (!categorySelect?.value) {
    setCategoryError("Please select a category");
    hasError = true;
  }
  
  if (!schoolSelect?.value) {
    setSchoolError("Please select a school");
    hasError = true;
  }
  
  if (hasError) {
    const errorElement = document.querySelector('.border-red-500');
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  setIsSubmitting(true);
  setStatusError(null);
  setSubmitError(null);

  try {
    const form = e.currentTarget as HTMLFormElement;
    
    // get form values
    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const descriptionInput = form.elements.namedItem("description") as HTMLTextAreaElement;
    const keywordsInput = form.elements.namedItem("keywords") as HTMLInputElement;
    const startDateInput = form.elements.namedItem("start_date") as HTMLInputElement;
    const endDateInput = form.elements.namedItem("end_date") as HTMLInputElement;
    const surveyLinkInput = form.elements.namedItem("survey_link") as HTMLInputElement;
    const respondentsInput = form.elements.namedItem("respondents") as HTMLInputElement;
    const maxRespondentsInput = form.elements.namedItem("max_respondents") as HTMLInputElement;

    // validation
    if (!titleInput?.value || !descriptionInput?.value || !keywordsInput?.value || 
        !startDateInput?.value || !endDateInput?.value || !surveyLinkInput?.value || !respondentsInput?.value) {
      throw new Error("Please fill in all required fields");
    }

    if (titleInput.value.length < 5) {
      throw new Error("Title must be at least 5 characters");
    }

    if (descriptionInput.value.length < 10) {
      throw new Error("Description must be at least 10 characters");
    }

    // check duplicate survey link
    if (surveyLinkInput.value) {
      const { data: existingSurvey } = await supabase
        .from("survey")
        .select("id")
        .ilike("survey_link", surveyLinkInput.value)
        .neq("id", survey.id)
        .maybeSingle();
      
      if (existingSurvey) {
        throw new Error("This survey link is already in use. Please provide a unique link.");
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDateInput.value);
    
    let finalStatus = formData.survey_status;
    if (endDateObj < today && finalStatus !== 'archived' && finalStatus !== 'rejected') {
      const confirmArchive = confirm(
        "This survey's end date is in the past. It will be automatically archived. Do you want to proceed?"
      );
      if (!confirmArchive) {
        setIsSubmitting(false);
        return;
      }
      finalStatus = 'archived';
    }

    if (!categorySelect?.value) {
      throw new Error("Please select a category");
    }
    const categoryId = categorySelect.value;

    if (!schoolSelect?.value) {
      throw new Error("Please select a school");
    }
    const schoolId = schoolSelect.value;

    // get author fields
    const firstNameInputs = form.querySelectorAll('input[name="firstName[]"]') as NodeListOf<HTMLInputElement>;
    const lastNameInputs = form.querySelectorAll('input[name="lastName[]"]') as NodeListOf<HTMLInputElement>;
    const emailInputs = form.querySelectorAll('input[name="email[]"]') as NodeListOf<HTMLInputElement>;
    const middleInitialInputs = form.querySelectorAll('input[name="middleInitial[]"]') as NodeListOf<HTMLInputElement>;

    // Check for duplicate authors within the form
    const emailMap = new Map<string, number>();
    const nameMap = new Map<string, number>();
    
    for (let i = 0; i < firstNameInputs.length; i++) {
      const firstName = firstNameInputs[i]?.value?.trim();
      const lastName = lastNameInputs[i]?.value?.trim();
      const email = emailInputs[i]?.value?.trim();
      const middleInitial = middleInitialInputs[i]?.value?.trim();
      
      if (firstName && lastName && email) {
        // Check duplicate email
        const emailLower = email.toLowerCase();
        if (emailMap.has(emailLower)) {
          throw new Error(`Duplicate author email found: Author ${emailMap.get(emailLower)} and Author ${i + 1} have the same email address.`);
        }
        emailMap.set(emailLower, i + 1);
        
        // Check duplicate name
        const nameKey = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${(middleInitial || '').charAt(0).toUpperCase()}`;
        if (nameMap.has(nameKey)) {
          throw new Error(`Duplicate author name found: Author ${nameMap.get(nameKey)} and Author ${i + 1} have the same name.`);
        }
        nameMap.set(nameKey, i + 1);
      }
    }

    // Check for at least one valid author
    let validAuthors = 0;
    for (let i = 0; i < firstNameInputs.length; i++) {
      if (firstNameInputs[i]?.value?.trim() && lastNameInputs[i]?.value?.trim() && emailInputs[i]?.value?.trim()) {
        validAuthors++;
      }
    }

    if (validAuthors === 0) {
      throw new Error("Please add at least one author with complete information");
    }

    // Update survey
    const { error: surveyError } = await supabase
      .from("survey")
      .update({
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
        survey_status: finalStatus,
      })
      .eq("id", survey.id);

    if (surveyError) throw surveyError;

    // Get author records w/ IDs
    const desiredAuthorIds: number[] = [];
    const processedEmails = new Set<string>();

    for (let i = 0; i < firstNameInputs.length; i++) {
      const firstName = firstNameInputs[i]?.value?.trim();
      const lastName = lastNameInputs[i]?.value?.trim();
      const email = emailInputs[i]?.value?.trim();
      const rawMinit = (document.querySelectorAll('input[name="middleInitial[]"]')[i] as HTMLInputElement)?.value || "";
      
      const cleanMinit = rawMinit
        .replace(/[^a-zA-Z]/g, "") 
        .substring(0, 2)
        .toUpperCase() || null;
      const memberIdFromState = authors[i]?.memberId || null;
      
      if (!firstName || !lastName || !email) continue;
      
      const emailLower = email.toLowerCase();
      if (processedEmails.has(emailLower)) {
        continue;
      }
      processedEmails.add(emailLower);
      
      // Check if author exists 
      let { data: existingAuthor } = await supabase
        .from("author")
        .select("id")
        .eq("author_email", email)
        .maybeSingle();
      
      let authorId;
      
      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        // Create new author
        const { data: newAuthor, error: authorError } = await supabase
          .from("author")
          .insert({
            author_fname: firstName,
            author_lname: lastName,
            author_email: email,
            author_minit: cleanMinit || null,
            mem_id: memberIdFromState || null
          })
          .select("id")
          .single();
        
        if (authorError) throw authorError;
        authorId = newAuthor.id;
      }
      
      desiredAuthorIds.push(authorId);
    }

    // Get current author 
    const { data: currentLinks, error: fetchError } = await supabase
      .from("survey_author")
      .select("author")
      .eq("survey", survey.id);

    if (fetchError) throw fetchError;

    const currentAuthorIds = currentLinks?.map(link => link.author) || [];

    // Which to add and which to remove
    const toRemove = currentAuthorIds.filter(id => !desiredAuthorIds.includes(id));
    const toAdd = desiredAuthorIds.filter(id => !currentAuthorIds.includes(id));

    // Remove authors 
    if (toRemove.length > 0) {
      const { error: removeError } = await supabase
        .from("survey_author")
        .delete()
        .eq("survey", survey.id)
        .in("author", toRemove);
      
      if (removeError) throw removeError;
    }

    // Add new authors
    if (toAdd.length > 0) {
      const newLinks = toAdd.map(authorId => ({
        survey: survey.id,
        author: authorId
      }));
      
      const { error: addError } = await supabase
        .from("survey_author")
        .insert(newLinks);
      
      if (addError) throw addError;
    }

    router.push("/survey/admin/edit/success");
    
  } catch (error) {
    console.error("Error updating survey:", error);
    setSubmitError(error instanceof Error ? error.message : "Failed to update survey");
    setIsSubmitting(false);
  }
};


  const checkForChanges = () => {
    if (!survey) return false;
    
    // Get current form values from DOM
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const descriptionInput = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const keywordsInput = document.querySelector('input[name="keywords"]') as HTMLInputElement;
    const surveyLinkInput = document.querySelector('input[name="survey_link"]') as HTMLInputElement;
    const respondentsInput = document.querySelector('input[name="respondents"]') as HTMLInputElement;
    const maxRespondentsInput = document.querySelector('input[name="max_respondents"]') as HTMLInputElement;
    const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
    const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
    const statusSelect = document.querySelector('select[name="survey_status"]') as HTMLSelectElement;
    
    const firstNameInputs = document.querySelectorAll('input[name="firstName[]"]') as NodeListOf<HTMLInputElement>;
    const lastNameInputs = document.querySelectorAll('input[name="lastName[]"]') as NodeListOf<HTMLInputElement>;
    const middleInitialInputs = document.querySelectorAll('input[name="middleInitial[]"]') as NodeListOf<HTMLInputElement>;
    const emailInputs = document.querySelectorAll('input[name="email[]"]') as NodeListOf<HTMLInputElement>;
    
    // Check basic fields
    const basicFieldsChanged = 
      titleInput?.value !== survey.survey_title ||
      descriptionInput?.value !== survey.survey_desc ||
      keywordsInput?.value !== survey.survey_keyword ||
      startDate !== survey.survey_start.split("T")[0] ||
      endDate !== survey.survey_end.split("T")[0] ||
      surveyLinkInput?.value !== survey.survey_link ||
      respondentsInput?.value !== survey.survey_respondents ||
      maxRespondentsInput?.value !== (survey.max_respondents?.toString() || "") ||
      categorySelect?.value !== survey.r_category?.id?.toString() ||
      schoolSelect?.value !== survey.school?.id?.toString() ||
      statusSelect?.value !== survey.survey_status;
    
    if (basicFieldsChanged) return true;
    
    // Check authors
    const originalAuthors = authors;
    if (firstNameInputs.length !== originalAuthors.length) return true;
    
    for (let i = 0; i < firstNameInputs.length; i++) {
      const currentFirstName = firstNameInputs[i]?.value || "";
      const currentLastName = lastNameInputs[i]?.value || "";
      const currentMiddleInitial = middleInitialInputs[i]?.value || "";
      const currentEmail = emailInputs[i]?.value || "";
      
      const originalFirstName = originalAuthors[i]?.firstName || "";
      const originalLastName = originalAuthors[i]?.lastName || "";
      const originalMiddleInitial = originalAuthors[i]?.middleInitial || "";
      const originalEmail = originalAuthors[i]?.email || "";
      
      if (currentFirstName !== originalFirstName ||
          currentLastName !== originalLastName ||
          currentMiddleInitial !== originalMiddleInitial ||
          currentEmail !== originalEmail) {
        return true;
      }
    }
    
    return false;
  };

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    return isSubmitting || !isFormValid || !checkForChanges();
  };

  if (loading) return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="min-h-[400px]"></div>
        </main>
      </div>
    </div>
  );
  
  if (!survey) return <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8]">Survey not found.</div>;

  return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div>
            <BackButton href="/dashboard?tab=survey&page=1" />
            <div className="mt-5">
              <h1 className="text-3xl font-oswald font-bold text-[#011638]">
                Edit Survey
              </h1>
              <p className="text-[#475569] font-ubuntu-mono mt-2 break-words">
                Edit "<span className="font-bold italic text-[#011638]">{survey.survey_title}</span>"
              </p>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {submitError}
            </div>
          )}

          <div className="bg-[#fbfaf8] mt-4 rounded-lg shadow-xl border border-[#e0e7ff] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* basic info section */}
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
                        defaultValue={formData.survey_title}
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
                      <label htmlFor="description" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Description <span className="text-[#eec643]">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        defaultValue={formData.survey_desc}
                        required
                        rows={4}
                        maxLength={1500}
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

                    <div>
                      <label htmlFor="keywords" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Keywords <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="text"
                        id="keywords"
                        name="keywords"
                        defaultValue={formData.survey_keyword}
                        required
                        maxLength={300}
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
                            errorSpan!.textContent = 'Atleast 1 keyword is required.';
                            errorSpan!.style.display = 'block';
                          } else if (input.value.length < 2) {
                            errorSpan!.textContent = 'Keywords must be at least 2 characters.';
                            errorSpan!.style.display = 'block';
                          } else {
                            errorSpan!.style.display = 'none';
                          }
                          validateForm();
                        }}
                      />
                      <span id="keywords-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* authors section */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">Author(s)</h2>
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
                              defaultValue={author.firstName || ""}
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
                              defaultValue={author.middleInitial || ""}
                              maxLength={4}
                              placeholder="M.I."
                              className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                              onChange={(e) => {
                                let value = e.target.value.toUpperCase();
                                value = value.replace(/[^A-Z.]/g, '');
                                
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
                              onInput={(e) => {
                                const firstNameInput = document.querySelectorAll('input[name="firstName[]"]')[index] as HTMLInputElement;
                                const lastNameInput = document.querySelectorAll('input[name="lastName[]"]')[index] as HTMLInputElement;
                                if (firstNameInput?.value && lastNameInput?.value) {
                                  searchMembersByFullName(firstNameInput.value, lastNameInput.value, (e.target as HTMLInputElement).value, index);
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
                            defaultValue={author.lastName || ""}
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
                            defaultValue={author.email || ""}
                            required
                            maxLength={254}
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
                              const middleInitialInput = document.querySelectorAll('input[name="middleInitial[]"]')[index] as HTMLInputElement;
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              
                              if (input.value.length === 0) {
                                errorSpan!.textContent = 'Email is required.';
                                errorSpan!.style.display = 'block';
                                validateForm();
                                
                                if (firstNameInput?.value && lastNameInput?.value) {
                                  const normalizedMiddle = middleInitialInput?.value ? middleInitialInput.value.charAt(0).toUpperCase() : '';
                                  
                                  const { data: matchingMembers } = await supabase
                                    .from("member")
                                    .select("id, mem_fname, mem_lname, mem_minit, mem_email")
                                    .ilike("mem_fname", firstNameInput.value)
                                    .ilike("mem_lname", lastNameInput.value)
                                    .limit(1);
                                  
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
                                return;
                              }
                              
                              if (!emailRegex.test(input.value)) {
                                errorSpan!.textContent = 'Please enter a valid email address.';
                                errorSpan!.style.display = 'block';
                                validateForm();
                                setEmailSuggestions(prev => new Map(prev).set(index, []));
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
                                    validateForm();
                                    setEmailSuggestions(prev => new Map(prev).set(index, []));
                                    return;
                                  }
                                }
                              }

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
                                  
                                  const memberWithTypedEmail = matchingMembers.find(m => 
                                    m.mem_email.toLowerCase() === input.value.toLowerCase()
                                  );
                                  
                                  if (memberWithTypedEmail) {
                                    errorSpan!.style.display = 'none';
                                    setEmailSuggestions(prev => new Map(prev).set(index, []));
                                    validateForm();
                                  } else if (exactMatch && input.value.length > 0 && 
                                            exactMatch.mem_email.toLowerCase().includes(input.value.toLowerCase())) {
                                    setEmailSuggestions(prev => new Map(prev).set(index, [{
                                      email: exactMatch.mem_email,
                                      memberId: exactMatch.id,
                                      fname: exactMatch.mem_fname,
                                      lname: exactMatch.mem_lname,
                                      minit: exactMatch.mem_minit
                                    }]));
                                    errorSpan!.style.display = 'none';
                                    validateForm();
                                  } else {
                                    errorSpan!.style.display = 'none';
                                    setEmailSuggestions(prev => new Map(prev).set(index, []));
                                  }
                                } else {
                                  errorSpan!.style.display = 'none';
                                  setEmailSuggestions(prev => new Map(prev).set(index, []));
                                }
                              } else {
                                errorSpan!.style.display = 'none';
                                setEmailSuggestions(prev => new Map(prev).set(index, []));
                              }
                              
                              // Check existing author
                              const { data: existing } = await supabase
                                .from("author")
                                .select("id, author_fname, author_lname")
                                .eq("author_email", input.value)
                                .maybeSingle();
                              
                              if (existing) {
                                const firstNameMatch = existing.author_fname?.toLowerCase() === firstNameInput?.value?.toLowerCase();
                                const lastNameMatch = existing.author_lname?.toLowerCase() === lastNameInput?.value?.toLowerCase();
                                
                                if (!firstNameMatch || !lastNameMatch) {
                                  errorSpan!.textContent = 'This email is already registered to a different author.';
                                  errorSpan!.style.display = 'block';
                                  setEmailSuggestions(prev => new Map(prev).set(index, []));
                                }
                              }
                              validateForm();
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setEmailSuggestions(prev => new Map(prev).set(index, []));
                              }, 200);
                            }}
                          />
                          <span id={`email-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                          
                          {/* Email Suggestions Dropdown */}
                          {emailSuggestions.get(index) && emailSuggestions.get(index)!.length > 0 && 
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
                                    onClick={() => selectEmailSuggestion(suggestion, index)}
                                    className="w-full text-left px-4 py-2 hover:bg-[#e0e7ff] hover:text-[#011638] text-[#475569] font-ubuntu-mono transition-colors border-b last:border-b-0 border-[#011638] border-opacity-20"
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
                          
                          {/* Search Results Dropdown */}
                          {showSearchDropdown.get(index) && searchResults.get(index) && searchResults.get(index)!.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full bg-[#fbfaf8] border border-[#011638] rounded-lg shadow-xl overflow-hidden">
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

              {/* survey details section */}
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
                            setFormData(prev => ({ ...prev, survey_start: newStartDate }));
                            
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
                            setFormData(prev => ({ ...prev, survey_end: newEndDate }));
                            
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
                        defaultValue={formData.survey_link}
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
                          
                          const supabaseClient = createClient();
                          const { data: existingSurvey } = await supabaseClient
                            .from("survey")
                            .select("id")
                            .ilike("survey_link", value)
                            .neq("id", survey.id)
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
                        defaultValue={formData.survey_respondents}
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
                        defaultValue={formData.max_respondents}
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

              {/* classification section */}
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
                            value={formData.r_category}
                            className={`text-[#475569] font-ubuntu-mono flex-1 px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue overflow-hidden ${
                              categoryError ? 'border-red-500' : 'border-[#94a3b8]'
                            }`}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, r_category: e.target.value }));
                              if (!e.target.value) {
                                setCategoryError("Please select a category");
                              } else {
                                setCategoryError("");
                              }
                              validateForm();
                            }}
                            onBlur={() => {
                              const select = document.getElementById('category') as HTMLSelectElement;
                              if (!select?.value) {
                                setCategoryError("Please select a category");
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
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => {
                              setNewCategoryName(e.target.value);
                              if (!e.target.value.trim()) {
                                setCategoryError("Category name is required");
                              } else if (e.target.value.length < 2) {
                                setCategoryError("Category name must be at least 2 characters");
                              } else {
                                setCategoryError("");
                              }
                              validateForm();
                            }}
                            placeholder="Enter new category name"
                            maxLength={50}
                            className={`text-[#475569] font-ubuntu-mono flex-1 px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                              categoryError ? 'border-red-500' : 'border-[#94a3b8]'
                            }`}
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
                              validateForm();
                            }}
                            className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {categoryError && (
                        <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{categoryError}</p>
                      )}
                    </div>

                    {/* school section */}
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
                            value={formData.school}
                            className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue overflow-hidden ${
                              schoolError ? 'border-red-500' : 'border-[#94a3b8]'
                            }`}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, school: e.target.value }));
                              if (!e.target.value) {
                                setSchoolError("Please select a school");
                              } else {
                                setSchoolError("");
                              }
                              validateForm();
                            }}
                            onBlur={() => {
                              const select = document.getElementById('school') as HTMLSelectElement;
                              if (!select?.value) {
                                setSchoolError("Please select a school");
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
                          <input
                            type="text"
                            value={newSchoolName}
                            onChange={(e) => {
                              setNewSchoolName(e.target.value);
                              if (!e.target.value.trim()) {
                                setSchoolError("School name is required");
                              } else if (e.target.value.length < 2) {
                                setSchoolError("School name must be at least 2 characters");
                              } else {
                                setSchoolError("");
                              }
                              validateForm();
                            }}
                            placeholder="Enter new school name"
                            maxLength={50}
                            className={`text-[#475569] font-ubuntu-mono w-full px-3 py-2 border rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] ${
                              schoolError ? 'border-red-500' : 'border-[#94a3b8]'
                            }`}
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
                              validateForm();
                            }}
                            className="px-3 py-2 text-[#475569] border border-[#94a3b8] rounded hover:bg-gray-100 transition-colors font-ubuntu-mono"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {schoolError && (
                        <p className="text-xs mt-1 text-red-600 font-ubuntu-mono">{schoolError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* status section */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">Status</h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
                  {/* warning banner for past date surveys */}
                  {statusNotice && (
                    <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong className="font-bold">{statusNotice.title}:</strong> {statusNotice.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {statusError && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <p className="text-red-700 text-xs font-ubuntu-mono">{statusError}</p>
                    </div>
                  )}
                  
                  <select
                    name="survey_status"
                    value={formData.survey_status}
                    onChange={handleStatusChange}
                    required
                    className="w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono transition-colors uppercase"
                  >
                    {statusOptions.map((option) => {
                      const { disabled } = isStatusDisabled(option.value);
                      return (
                        <option 
                          key={option.value} 
                          value={option.value}
                          disabled={disabled}
                          className={disabled ? "text-gray-400 bg-gray-50" : "text-[#475569]"}
                        >
                          {option.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard?tab=survey&page=1")}
                  className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaveDisabled()}
                  className="px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg hover:bg-[#1a2a4f] transition-colors font-oswald disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function EditSurveyPage() {
  return (
    <Suspense>
      <EditSurveyContent />
    </Suspense>
  );
}