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

function EditThesisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const thesisId = searchParams.get("id");

  const [thesis, setThesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([{ id: 1 }]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewSchool, setShowNewSchool] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const [schoolError, setSchoolError] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [searchResults, setSearchResults] = useState<Map<number, Array<{id: number, fname: string, lname: string, minit: string | null, email: string}>>>(new Map());
  const [showSearchDropdown, setShowSearchDropdown] = useState<Map<number, boolean>>(new Map());
  const [emailSuggestions, setEmailSuggestions] = useState<Map<number, Array<{email: string, memberId: number, fname: string, lname: string, minit: string | null}>>>(new Map());
  const [pubDate, setPubDate] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState({
    thesis_title: "",
    thesis_abstract: "",
    thesis_keyword: "",
    thesis_date: "",
    thesis_phys: "",
    thesis_digi: "",
    r_category: "",
    school: "",
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
    if (!firstName || !lastName || firstName.length < 2 || lastName.length < 2) {
      setEmailSuggestions(prev => new Map(prev).set(authorIndex, []));
      return;
    }

    const normalizedMiddle = middleInitial ? middleInitial.charAt(0).toUpperCase() : '';
    
    const { data: members, error } = await supabase
      .from("member")
      .select("id, mem_fname, mem_lname, mem_minit, mem_email")
      .ilike("mem_fname", `%${firstName}%`)
      .ilike("mem_lname", `%${lastName}%`)
      .limit(5);

    if (!error && members && members.length > 0) {
      let matchingMembers = members;
      if (normalizedMiddle) {
        matchingMembers = members.filter(m => {
          const memberMiddle = m.mem_minit ? m.mem_minit.charAt(0).toUpperCase() : '';
          return memberMiddle === normalizedMiddle;
        });
      }
      
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
    
    const errorSpan = document.getElementById(`email-error-${authorIndex}`);
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
    }
    
    validateForm();
  };

  // Check duplicate authors
  const checkDuplicateAuthors = () => {
    for (let i = 0; i < authors.length; i++) {
        for (let j = i + 1; j < authors.length; j++) {
        const authorI = authors[i];
        const authorJ = authors[j];
        
        // Make sure both authors exist
        if (!authorI || !authorJ) continue;
        
        // Check duplicate emails
        if (authorI.email && authorJ.email && 
            authorI.email.toLowerCase() === authorJ.email.toLowerCase()) {
            return `Author ${i + 1} and Author ${j + 1} have the same email address.`;
        }
        
        // Check duplicate names
        if (authorI.firstName && authorI.lastName && 
            authorJ.firstName && authorJ.lastName &&
            authorI.firstName.toLowerCase() === authorJ.firstName.toLowerCase() &&
            authorI.lastName.toLowerCase() === authorJ.lastName.toLowerCase()) {
            
            const middleI = (authorI.middleInitial || '').trim().charAt(0).toUpperCase();
            const middleJ = (authorJ.middleInitial || '').trim().charAt(0).toUpperCase();
            
            if (middleI === middleJ) {
            return `Author ${i + 1} and Author ${j + 1} have the same full name.`;
            }
        }
        }
    }
    return null;
  };

  // Validate entire form
  const validateForm = () => {
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const titleValid = titleInput?.value && titleInput.value.length >= 5;
    const abstractInput = document.querySelector('textarea[name="abstract"]') as HTMLTextAreaElement;
    const abstractValid = abstractInput?.value && abstractInput.value.length >= 10;
    const keywordsInput = document.querySelector('input[name="keywords"]') as HTMLInputElement;
    const keywordsValid = keywordsInput?.value && keywordsInput.value.length >= 2;
    const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
    const categoryValid = !!categorySelect?.value;
    const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
    const schoolValid = !!schoolSelect?.value;
    const pubDateValid = !!pubDate;
    
    // Check authors
    let hasValidAuthor = false;
    for (let i = 0; i < authors.length; i++) {
      const author = authors[i];
      if (author?.firstName?.trim() && 
          author?.lastName?.trim() && 
          author?.email?.trim()) {
          hasValidAuthor = true;
          break;
      }
    }
    
    const duplicateError = checkDuplicateAuthors();
    const hasErrors = !titleValid || !abstractValid || !keywordsValid || !categoryValid || 
                      !schoolValid || !pubDateValid || !hasValidAuthor || 
                      !!categoryError || !!schoolError || !!duplicateError;
    
    // Check if there are actual changes
    const changesExist = checkForChanges();
    setHasChanges(changesExist);
    
    setIsFormValid(!hasErrors);
    return !hasErrors;
  };

  useEffect(() => {
    validateForm();
  }, [pubDate, categoryError, schoolError, authors]);

  useEffect(() => {
    async function fetchThesis() {
      if (!thesisId) return;
      
      const { data, error } = await supabase
        .from("thesis")
        .select(`
          *,
          r_category (id, r_category_name),
          school (id, school_name),
          thesis_author (
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
        .eq("id", thesisId)
        .single();

      if (error) {
        console.error("Error fetching thesis:", error);
        setSubmitError("Failed to load thesis data.");
      } else {
        setThesis(data);
        const date = data.thesis_date.split("T")[0];
        setPubDate(date);
        setFormData({
          thesis_title: data.thesis_title,
          thesis_abstract: data.thesis_abstract,
          thesis_keyword: data.thesis_keyword,
          thesis_date: date,
          thesis_phys: data.thesis_phys || "",
          thesis_digi: data.thesis_digi || "",
          r_category: data.r_category?.id.toString() || "",
          school: data.school?.id.toString() || "",
        });
      }
      setLoading(false);
    }

    fetchThesis();
  }, [thesisId, supabase]);

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
    if (!thesis) return;
    
    const fetchAuthors = async () => {
      const { data, error } = await supabase
        .from("thesis_author")
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
        .eq("thesis", thesis.id);

      if (data && data.length > 0) {
        const thesisAuthors = data.map((item: any, index: number) => ({
          id: index + 1,
          firstName: item.author.author_fname,
          middleInitial: item.author.author_minit || "",
          lastName: item.author.author_lname,
          email: item.author.author_email,
          memberId: item.author.mem_id
        }));
        setAuthors(thesisAuthors);
      }
    };
    fetchAuthors();
  }, [thesis, supabase]);

  const addAuthor = () => {
    const newId = authors.length + 1;
    setAuthors([...authors, { 
      id: newId, 
      firstName: "",
      middleInitial: "",
      lastName: "",
      email: "",
      memberId: null
    }]);
  };

  const removeAuthor = (id: number) => {
    if (authors.length > 1) {
      const updatedAuthors = authors.filter(author => author.id !== id);
      // Re-index the remaining authors
      const reindexedAuthors = updatedAuthors.map((author, idx) => ({ 
        ...author, 
        id: idx + 1
      }));
      setAuthors(reindexedAuthors);
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
        setFormData(prev => ({ ...prev, r_category: existingCategory.id }));
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
        setFormData(prev => ({ ...prev, r_category: existingCategoryInDb.id }));
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
      setFormData(prev => ({ ...prev, r_category: newCategory.id }));
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
        setFormData(prev => ({ ...prev, school: existingSchool.id }));
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
        setFormData(prev => ({ ...prev, school: existingSchoolInDb.id }));
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
      setFormData(prev => ({ ...prev, school: newSchool.id }));
      setShowNewSchool(false);
      setNewSchoolName("");
      setSchoolError("");
    } catch (error) {
      console.error("Error adding school:", error);
      setSchoolError("An unexpected error occurred. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate duplicate authors
    const duplicateError = checkDuplicateAuthors();
    if (duplicateError) {
      setSubmitError(duplicateError);
      return;
    }

    // Validate at least one valid author
    let validAuthors = 0;
    for (let i = 0; i < authors.length; i++) {
      if (authors[i]?.firstName?.trim() && authors[i]?.lastName?.trim() && authors[i]?.email?.trim()) {
        validAuthors++;
      }
    }

    if (validAuthors === 0) {
      setSubmitError("Please add at least one author with complete information");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const form = e.currentTarget as HTMLFormElement;
      
      // get form values
      const titleInput = form.elements.namedItem("title") as HTMLInputElement;
      const abstractInput = form.elements.namedItem("abstract") as HTMLTextAreaElement;
      const keywordsInput = form.elements.namedItem("keywords") as HTMLInputElement;
      const pubDateInput = form.elements.namedItem("pub_date") as HTMLInputElement;
      const physLinkInput = form.elements.namedItem("phys_link") as HTMLInputElement;
      const digiLinkInput = form.elements.namedItem("digi_link") as HTMLInputElement;

      // validation
      if (!titleInput?.value || !abstractInput?.value || !keywordsInput?.value || !pubDateInput?.value) {
        throw new Error("Please fill in all required fields");
      }

      if (titleInput.value.length < 5) {
        throw new Error("Title must be at least 5 characters");
      }

      if (abstractInput.value.length < 10) {
        throw new Error("Abstract must be at least 10 characters");
      }

      if (!formData.r_category) {
        throw new Error("Please select a category");
      }
      const categoryId = formData.r_category;

      if (!formData.school) {
        throw new Error("Please select a school");
      }
      const schoolId = formData.school;

      // Update thesis
      const { error: thesisError } = await supabase
        .from("thesis")
        .update({
          thesis_title: titleInput.value,
          thesis_abstract: abstractInput.value,
          thesis_keyword: keywordsInput.value,
          thesis_date: pubDateInput.value,
          thesis_phys: physLinkInput?.value || null,
          thesis_digi: digiLinkInput?.value || null,
          r_category: parseInt(categoryId),
          school: parseInt(schoolId),
        })
        .eq("id", thesis.id);

      if (thesisError) throw thesisError;

      // Process authors
      const desiredAuthorIds: number[] = [];
      const processedEmails = new Set<string>();

      for (let i = 0; i < authors.length; i++) {
        const author = authors[i];
        const firstName = author.firstName?.trim();
        const lastName = author.lastName?.trim();
        const email = author.email?.trim();
        const rawMinit = author.middleInitial || "";
        
        const cleanMinit = rawMinit
          .replace(/[^a-zA-Z]/g, "") 
          .substring(0, 2)
          .toUpperCase() || null;
        const memberIdFromState = author.memberId || null;
        
        if (!firstName || !lastName || !email) continue;
        
        const emailLower = email.toLowerCase();
        if (processedEmails.has(emailLower)) {
          continue;
        }
        processedEmails.add(emailLower);
        
        // Check if author exists by email
        let { data: existingAuthor } = await supabase
          .from("author")
          .select("id")
          .eq("author_email", email)
          .maybeSingle();
        
        let authorId;
        
        if (existingAuthor) {
          authorId = existingAuthor.id;
          // Update the author info if needed
          const { error: updateError } = await supabase
            .from("author")
            .update({
              author_fname: firstName,
              author_lname: lastName,
              author_minit: cleanMinit || null,
              mem_id: memberIdFromState || null
            })
            .eq("id", authorId);
          
          if (updateError) console.error("Error updating author:", updateError);
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

      // Get current author links
      const { data: currentLinks, error: fetchError } = await supabase
        .from("thesis_author")
        .select("author")
        .eq("thesis", thesis.id);

      if (fetchError) throw fetchError;

      const currentAuthorIds = currentLinks?.map(link => link.author) || [];

      // Which to add and which to remove
      const toRemove = currentAuthorIds.filter(id => !desiredAuthorIds.includes(id));
      const toAdd = desiredAuthorIds.filter(id => !currentAuthorIds.includes(id));

      // Remove authors
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("thesis_author")
          .delete()
          .eq("thesis", thesis.id)
          .in("author", toRemove);
        
        if (removeError) throw removeError;
      }

      // Add new authors
      if (toAdd.length > 0) {
        const newLinks = toAdd.map(authorId => ({
          thesis: thesis.id,
          author: authorId
        }));
        
        const { error: addError } = await supabase
          .from("thesis_author")
          .insert(newLinks);
        
        if (addError) throw addError;
      }

      router.push("/thesis/admin/edit/success");
      
    } catch (error) {
      console.error("Error updating thesis:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to update thesis");
      setIsSubmitting(false);
    }
  };

  const checkForChanges = () => {
    if (!thesis) return false;
    
    // Get current form values
    const titleInput = document.querySelector('input[name="title"]') as HTMLInputElement;
    const abstractInput = document.querySelector('textarea[name="abstract"]') as HTMLTextAreaElement;
    const keywordsInput = document.querySelector('input[name="keywords"]') as HTMLInputElement;
    const physLinkInput = document.querySelector('input[name="phys_link"]') as HTMLInputElement;
    const digiLinkInput = document.querySelector('input[name="digi_link"]') as HTMLInputElement;
    const categorySelect = document.querySelector('select[name="category"]') as HTMLSelectElement;
    const schoolSelect = document.querySelector('select[name="school"]') as HTMLSelectElement;
    
    const currentTitle = titleInput?.value || "";
    const currentAbstract = abstractInput?.value || "";
    const currentKeywords = keywordsInput?.value || "";
    const currentPubDate = pubDate;
    const currentPhys = physLinkInput?.value || "";
    const currentDigi = digiLinkInput?.value || "";
    const currentCategory = categorySelect?.value || "";
    const currentSchool = schoolSelect?.value || "";
    
    // Check basic fields
    const basicFieldsChanged = 
      currentTitle !== (thesis.thesis_title || "") ||
      currentAbstract !== (thesis.thesis_abstract || "") ||
      currentKeywords !== (thesis.thesis_keyword || "") ||
      currentPubDate !== (thesis.thesis_date?.split("T")[0] || "") ||
      currentPhys !== (thesis.thesis_phys || "") ||
      currentDigi !== (thesis.thesis_digi || "") ||
      currentCategory !== (thesis.r_category?.id?.toString() || "") ||
      currentSchool !== (thesis.school?.id?.toString() || "");
    
    if (basicFieldsChanged) return true;
    
    // Get original authors from the thesis data
    let originalAuthorsFromThesis: any[] = [];
    if (thesis.thesis_author && thesis.thesis_author.length > 0) {
      originalAuthorsFromThesis = thesis.thesis_author.map((sa: any) => {
        const authorData = sa.author || sa;
        return {
          firstName: authorData.author_fname || "",
          lastName: authorData.author_lname || "",
          middleInitial: authorData.author_minit || "",
          email: authorData.author_email || "",
          memberId: authorData.mem_id || null
        };
      });
    }
    
    // Filter out empty authors
    const validCurrentAuthors = authors.filter(author => 
      author.firstName?.trim() && author.lastName?.trim() && author.email?.trim()
    );
    
    const validOriginalAuthors = originalAuthorsFromThesis.filter(author => 
      author.firstName?.trim() && author.lastName?.trim() && author.email?.trim()
    );
    
    // Check if number of valid authors changed
    if (validCurrentAuthors.length !== validOriginalAuthors.length) {
      return true;
    }
    
    // Check each valid author field
    for (let i = 0; i < validCurrentAuthors.length; i++) {
      const currentAuthor = validCurrentAuthors[i];
      const originalAuthor = validOriginalAuthors[i];
      
      if (!originalAuthor) return true;
      
      if ((currentAuthor.firstName?.trim() || "") !== (originalAuthor.firstName?.trim() || "") ||
          (currentAuthor.lastName?.trim() || "") !== (originalAuthor.lastName?.trim() || "") ||
          (currentAuthor.middleInitial?.trim() || "") !== (originalAuthor.middleInitial?.trim() || "") ||
          (currentAuthor.email?.trim() || "") !== (originalAuthor.email?.trim() || "")) {
        return true;
      }
    }
    
    return false;
  };

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    return isSubmitting || !isFormValid || !hasChanges;
  };

  useEffect(() => {
    const changesExist = checkForChanges();
    setHasChanges(changesExist);
  }, [formData, pubDate, authors, thesis]);

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
  
  if (!thesis) return <div className="min-h-screen flex items-center justify-center bg-[#fbfaf8]">Thesis not found.</div>;

  return (
    <div className="w-full min-h-screen bg-[#fbfaf8]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: "20px 20px" }}>
      <NavBar />
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div>
            <BackButton href="/dashboard?tab=thesis&page=1" />
            <div className="mt-5">
              <h1 className="text-3xl font-oswald font-bold text-[#011638]">
                Edit Thesis
              </h1>
              <p className="text-[#475569] font-ubuntu-mono mt-2 break-words">
                Edit "<span className="font-bold italic text-[#011638]">{thesis.thesis_title}</span>"
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
                        Thesis Title <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        defaultValue={formData.thesis_title}
                        required
                        maxLength={300}
                        placeholder="Enter thesis title"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, thesis_title: e.target.value }));
                          const errorSpan = document.getElementById('title-error');
                          if (e.target.value.length === 0) {
                            errorSpan!.textContent = 'Title is required.';
                            errorSpan!.style.display = 'block';
                          } else if (e.target.value.length < 5) {
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
                      <label htmlFor="abstract" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Abstract <span className="text-[#eec643]">*</span>
                      </label>
                      <textarea
                        id="abstract"
                        name="abstract"
                        defaultValue={formData.thesis_abstract}
                        required
                        rows={4}
                        maxLength={1500}
                        placeholder="Enter thesis abstract"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] custom-scrollbar-blue"
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, thesis_abstract: e.target.value }));
                          const errorSpan = document.getElementById('abstract-error');
                          if (e.target.value.length === 0) {
                            errorSpan!.textContent = 'Abstract is required.';
                            errorSpan!.style.display = 'block';
                          } else if (e.target.value.length < 10) {
                            errorSpan!.textContent = 'Abstract must be at least 10 characters.';
                            errorSpan!.style.display = 'block';
                          } else {
                            errorSpan!.style.display = 'none';
                          }
                          validateForm();
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
                        defaultValue={formData.thesis_keyword}
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
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, thesis_keyword: e.target.value }));
                          const errorSpan = document.getElementById('keywords-error');
                          if (e.target.value.length === 0) {
                            errorSpan!.textContent = 'Atleast 1 keyword is required.';
                            errorSpan!.style.display = 'block';
                          } else if (e.target.value.length < 2) {
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
                        <h3 className="font-oswald font-bold text-[#011638]">AUTHOR {index + 1}</h3>
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
                              value={author.firstName || ""}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                const newAuthors = [...authors];
                                newAuthors[index] = { ...newAuthors[index], firstName: newValue };
                                setAuthors(newAuthors);
                                
                                const errorSpan = document.getElementById(`firstname-error-${index}`);
                                if (!newValue.trim()) {
                                  if (errorSpan) {
                                    errorSpan.textContent = 'First Name is required.';
                                    errorSpan.style.display = 'block';
                                  }
                                } else if (newValue.length < 2) {
                                  if (errorSpan) {
                                    errorSpan.textContent = 'First Name must be at least 2 characters.';
                                    errorSpan.style.display = 'block';
                                  }
                                } else {
                                  if (errorSpan) {
                                    errorSpan.style.display = 'none';
                                  }
                                  if (author.lastName && author.lastName.length >= 2) {
                                    searchMembersByFullName(newValue, author.lastName, author.middleInitial || '', index);
                                  }
                                }
                                validateForm();
                              }}
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
                              onBlur={() => {
                                const errorSpan = document.getElementById(`firstname-error-${index}`);
                                if (!author.firstName?.trim()) {
                                  if (errorSpan) {
                                    errorSpan.textContent = 'First Name is required.';
                                    errorSpan.style.display = 'block';
                                  }
                                } else if (author.firstName.length < 2) {
                                  if (errorSpan) {
                                    errorSpan.textContent = 'First Name must be at least 2 characters.';
                                    errorSpan.style.display = 'block';
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
                              value={author.middleInitial || ""}
                              onChange={(e) => {
                                let value = e.target.value.toUpperCase();
                                value = value.replace(/[^A-Z.]/g, '');
                                
                                if (value.length === 1 && /[A-Z]/.test(value)) {
                                  value = value + '.';
                                } else if (value.length === 2 && value[1] === '.') {
                                  // keep as is
                                } else if (value.length === 2 && /[A-Z]/.test(value[1])) {
                                  value = value[0] + '.' + value[1];
                                } else if (value.length === 3 && value[1] === '.' && /[A-Z]/.test(value[2])) {
                                  value = value + '.';
                                } else if (value.length >= 4) {
                                  value = value.slice(0, 2) + value.slice(2, 3) + '.';
                                  if (value.length > 4) value = value.slice(0, 4);
                                }
                                
                                const newAuthors = [...authors];
                                newAuthors[index] = { ...newAuthors[index], middleInitial: value };
                                setAuthors(newAuthors);
                                
                                if (author.firstName && author.lastName) {
                                  searchMembersByFullName(author.firstName, author.lastName, value, index);
                                }
                                validateForm();
                              }}
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
                            value={author.lastName || ""}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              const newAuthors = [...authors];
                              newAuthors[index] = { ...newAuthors[index], lastName: newValue };
                              setAuthors(newAuthors);
                              
                              const errorSpan = document.getElementById(`lastname-error-${index}`);
                              if (!newValue.trim()) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Last Name is required.';
                                  errorSpan.style.display = 'block';
                                }
                              } else if (newValue.length < 2) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Last Name must be at least 2 characters.';
                                  errorSpan.style.display = 'block';
                                }
                              } else {
                                if (errorSpan) {
                                  errorSpan.style.display = 'none';
                                }
                                if (author.firstName) {
                                  searchMembersByFullName(author.firstName, newValue, author.middleInitial || '', index);
                                }
                              }
                              
                              let hasDuplicate = false;
                              for (let i = 0; i < authors.length; i++) {
                                if (i !== index && authors[i]?.firstName && authors[i]?.lastName) {
                                  const firstNameMatch = authors[i].firstName?.toLowerCase() === (author.firstName?.toLowerCase() || '');
                                  const lastNameMatch = authors[i].lastName?.toLowerCase() === newValue.toLowerCase();
                                  
                                  if (firstNameMatch && lastNameMatch && author.firstName) {
                                    const currentMiddle = (author.middleInitial || '').charAt(0).toUpperCase();
                                    const otherMiddle = (authors[i].middleInitial || '').charAt(0).toUpperCase();
                                    
                                    if (currentMiddle === otherMiddle) {
                                      if (errorSpan) {
                                        errorSpan.textContent = `Author with the same name already exists (Author ${i + 1}).`;
                                        errorSpan.style.display = 'block';
                                      }
                                      hasDuplicate = true;
                                      break;
                                    }
                                  }
                                }
                              }
                              
                              if (!hasDuplicate && errorSpan && errorSpan.textContent?.includes('already exists')) {
                                errorSpan.style.display = 'none';
                              }
                              validateForm();
                            }}
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
                            onBlur={() => {
                              const errorSpan = document.getElementById(`lastname-error-${index}`);
                              if (!author.lastName?.trim()) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Last Name is required.';
                                  errorSpan.style.display = 'block';
                                }
                              } else if (author.lastName.length < 2) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Last Name must be at least 2 characters.';
                                  errorSpan.style.display = 'block';
                                }
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
                            value={author.email || ""}
                            onChange={async (e) => {
                              const newValue = e.target.value;
                              const newAuthors = [...authors];
                              newAuthors[index] = { ...newAuthors[index], email: newValue };
                              setAuthors(newAuthors);
                              
                              const errorSpan = document.getElementById(`email-error-${index}`);
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              
                              if (!newValue.trim()) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Email is required.';
                                  errorSpan.style.display = 'block';
                                }
                                validateForm();
                                return;
                              }
                              
                              if (!emailRegex.test(newValue)) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Please enter a valid email address.';
                                  errorSpan.style.display = 'block';
                                }
                                validateForm();
                                return;
                              }
                              
                              let hasDuplicateEmail = false;
                              for (let i = 0; i < authors.length; i++) {
                                if (i !== index && authors[i].email?.toLowerCase() === newValue.toLowerCase()) {
                                  if (errorSpan) {
                                    errorSpan.textContent = `This email is already used for Author ${i + 1}.`;
                                    errorSpan.style.display = 'block';
                                  }
                                  hasDuplicateEmail = true;
                                  validateForm();
                                  return;
                                }
                              }
                              
                              if (!hasDuplicateEmail && errorSpan) {
                                errorSpan.style.display = 'none';
                              }
                              
                              const { data: existing } = await supabase
                                .from("author")
                                .select("id, author_fname, author_lname")
                                .eq("author_email", newValue)
                                .maybeSingle();
                              
                              if (existing && existing.author_fname !== author.firstName) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'This email is already registered to a different author.';
                                  errorSpan.style.display = 'block';
                                }
                              }
                              validateForm();
                            }}
                            required
                            maxLength={254}
                            placeholder="Email"
                            className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                            onBlur={() => {
                              const errorSpan = document.getElementById(`email-error-${index}`);
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                              if (!author.email?.trim()) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Email is required.';
                                  errorSpan.style.display = 'block';
                                }
                              } else if (!emailRegex.test(author.email)) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Please enter a valid email address.';
                                  errorSpan.style.display = 'block';
                                }
                              } else {
                                if (errorSpan) {
                                  errorSpan.textContent = '';
                                  errorSpan.style.display = 'none';
                                }
                              }
                              validateForm();
                            }}
                            onKeyUp={(e) => {
                              const input = e.target as HTMLInputElement;
                              const char = e.key;
                              const value = input.value;
                              const atCount = (value.match(/@/g) || []).length;
                              
                              if (char === '@' && atCount >= 1) {
                                e.preventDefault();
                                return;
                              }
                            }}
                          />
                          <span id={`email-error-${index}`} className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                          
                          {/* Email Suggestions Dropdown */}
                          {(!author.email || author.email.trim() === '') && emailSuggestions.get(index) && emailSuggestions.get(index)!.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full bg-[#fbfaf8] border border-[#011638] rounded-lg shadow-xl overflow-hidden">
                              <div className="px-4 py-2 bg-[#1e4db7] bg-opacity-20 border-b border-[#011638] sticky top-0 flex justify-between items-center">
                                <span className="text-xs font-oswald font-semibold text-white">SUGGESTED EMAIL FOR THIS AUTHOR</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEmailSuggestions(prev => {
                                      const newMap = new Map(prev);
                                      newMap.delete(index);
                                      return newMap;
                                    });
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

              {/* thesis details section */}
              <div>
                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                  <h2 className="text-lg font-oswald font-semibold">Thesis Details</h2>
                </div>
                <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="pub_date" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Publication Date <span className="text-[#eec643]">*</span>
                      </label>
                      <input
                        type="date"
                        id="pub_date"
                        name="pub_date"
                        required
                        min="2022-01-01"
                        max={new Date().toISOString().split('T')[0]}
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        value={pubDate}
                        onChange={(e) => {
                          const newPubDate = e.target.value;
                          setPubDate(newPubDate);
                          setFormData(prev => ({ ...prev, thesis_date: newPubDate }));
                          
                          const errorSpan = document.getElementById('pubdate-error');
                          if (!newPubDate) {
                            errorSpan!.textContent = 'Publication date is required.';
                            errorSpan!.style.display = 'block';
                          } else {
                            errorSpan!.style.display = 'none';
                          }
                          validateForm();
                        }}
                      />
                      <span id="pubdate-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                    </div>

                    <div>
                      <label htmlFor="phys_link" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Physical Copy
                      </label>
                      <input
                        type="text"
                        id="phys_link"
                        name="phys_link"
                        defaultValue={formData.thesis_phys}
                        maxLength={200}
                        placeholder="Enter physical copy location"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, thesis_phys: e.target.value }));
                          validateForm();
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="digi_link" className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                        Digital Copy Link
                      </label>
                      <input
                        type="url"
                        id="digi_link"
                        name="digi_link"
                        defaultValue={formData.thesis_digi}
                        maxLength={200}
                        placeholder="Enter digital copy URL"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                        }}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, thesis_digi: e.target.value }));
                          validateForm();
                        }}
                      />
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
                              if (!formData.r_category) {
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
                              if (!formData.school) {
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                <button
                  type="button"
                  onClick={() => router.push("/dashboard?tab=thesis&page=1")}
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

export default function EditThesisPage() {
  return (
    <Suspense>
      <EditThesisContent />
    </Suspense>
  );
}