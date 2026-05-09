"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

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

interface EditSurveyModalProps {
  survey: any;
  onClose: () => void;
  onUpdate: (updatedSurvey: any) => void;
}

export default function EditSurveyModal({ survey, onClose, onUpdate }: EditSurveyModalProps) {
  const router = useRouter();
  const supabase = createClient();
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

  // initialize formData
  const [formData, setFormData] = useState({
    survey_title: survey.survey_title,
    survey_desc: survey.survey_desc,
    survey_keyword: survey.survey_keyword,
    survey_start: survey.survey_start.split("T")[0],
    survey_end: survey.survey_end.split("T")[0],
    survey_link: survey.survey_link,
    survey_respondents: survey.survey_respondents,
    max_respondents: survey.max_respondents || "",
    r_category: survey.r_category?.id.toString() || "",
    school: survey.school?.id.toString() || "",
    survey_status: survey.survey_status,
  });

  // check past date
  const [isPastDate, setIsPastDate] = useState(() => {
    const endDate = new Date(formData.survey_end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return endDate < today;
  });

  const currentStatus = survey.survey_status;

  // check duplicated authors
  const checkDuplicateAuthors = () => {
    const firstNameInputs = document.querySelectorAll('input[name="firstName[]"]') as NodeListOf<HTMLInputElement>;
    const lastNameInputs = document.querySelectorAll('input[name="lastName[]"]') as NodeListOf<HTMLInputElement>;
    const middleInitialInputs = document.querySelectorAll('input[name="middleInitial[]"]') as NodeListOf<HTMLInputElement>;
    const emailInputs = document.querySelectorAll('input[name="email[]"]') as NodeListOf<HTMLInputElement>;
    
    for (let i = 0; i < emailInputs.length; i++) {
      for (let j = i + 1; j < emailInputs.length; j++) {
        // check duplicated emails
        if (emailInputs[i]?.value && emailInputs[j]?.value && 
            emailInputs[i].value.toLowerCase() === emailInputs[j].value.toLowerCase()) {
          return `Author ${i + 1} and Author ${j + 1} have the same email address.`;
        }
        
        // check duplicated names
        if (firstNameInputs[i]?.value && lastNameInputs[i]?.value && 
            firstNameInputs[j]?.value && lastNameInputs[j]?.value &&
            firstNameInputs[i].value.toLowerCase() === firstNameInputs[j].value.toLowerCase() &&
            lastNameInputs[i].value.toLowerCase() === lastNameInputs[j].value.toLowerCase()) {
          
          // check middle initials
          const middleI = (middleInitialInputs[i]?.value || '').toLowerCase();
          const middleJ = (middleInitialInputs[j]?.value || '').toLowerCase();
          
          if (middleI === middleJ) {
            return `Author ${i + 1} and Author ${j + 1} have the same full name.`; // same full name
          }
        }
      }
    }
    return null;
  };

  // check survey link duplication
  const checkDuplicateSurveyLink = async (link: string) => {
    if (!link) return;
    
    const { data, error } = await supabase
      .from("survey")
      .select("id")
      .ilike("survey_link", link)
      .neq("id", survey.id) // exclude current
      .maybeSingle();
    
    if (data) {
      setSurveyLinkError("This survey link is already in use. Please provide a unique link.");
    } else {
      setSurveyLinkError("");
    }
  };

  // updates isPastDate when survey_end changes
  useEffect(() => {
    const endDate = new Date(formData.survey_end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newIsPastDate = endDate < today;
    setIsPastDate(newIsPastDate);
    
    if (!newIsPastDate && (currentStatus === 'archived' || currentStatus === 'rejected')) {
      setStatusError(null);
    }
  }, [formData.survey_end, currentStatus]);

  // notice based on status and date
  useEffect(() => {
    const endDate = new Date(formData.survey_end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = endDate < today;
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

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
    const fetchAuthors = async () => {
      const { data, error } = await supabase
        .from("survey_author")
        .select(`
          author (
            id,
            author_fname,
            author_lname,
            author_minit,
            author_email
          )
        `)
        .eq("survey", survey.id);

      if (data && data.length > 0) {
        const surveyAuthors = data.map((item: any, index: number) => ({
          id: index + 1,
          firstName: item.author.author_fname,
          middleInitial: item.author.author_minit,
          lastName: item.author.author_lname,
          email: item.author.author_email
        }));
        setAuthors(surveyAuthors);
      }
    };
    fetchAuthors();
  }, [supabase, survey.id]);

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
          setFormData(prev => ({ ...prev, r_category: existingCategory.id }));
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
            setFormData(prev => ({ ...prev, r_category: existingCategoryInDb.id }));
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
          setFormData(prev => ({ ...prev, r_category: newCategory.id }));
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
          setFormData(prev => ({ ...prev, school: existingSchool.id }));
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
            setFormData(prev => ({ ...prev, school: existingSchoolInDb.id }));
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
          setFormData(prev => ({ ...prev, school: newSchool.id }));
        }
      }, 100);

      setShowNewSchool(false);
      setNewSchoolName("");
    } catch (error) {
      console.error("Error adding school:", error);
      alert("Failed to add school. Please try again.");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'survey_end') {
      const newEndDate = new Date(value);
      const currentStartDate = new Date(formData.survey_start);
      
      if (newEndDate < currentStartDate) {
        alert("End date cannot be earlier than start date.");
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusError(null);

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
      const categorySelect = form.elements.namedItem("category") as HTMLSelectElement;
      const schoolSelect = form.elements.namedItem("school") as HTMLSelectElement;
      const privacyCheckbox = form.elements.namedItem("privacy") as HTMLInputElement;

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
      const endDate = new Date(endDateInput.value);
      
      let finalStatus = formData.survey_status;
      if (endDate < today && finalStatus !== 'archived' && finalStatus !== 'rejected') {
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

      // check duplicate authors
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

      // update survey
      const { data: updatedSurvey, error: surveyError } = await supabase
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
        .eq("id", survey.id)
        .select(`
          id,
          survey_title,
          survey_desc,
          survey_keyword,
          survey_start,
          survey_end,
          survey_link,
          survey_respondents,
          max_respondents,
          survey_status,
          r_category (
            id,
            r_category_name
          ),
          school (
            id,
            school_name
          ),
          survey_author (
            author (
              id,
              author_fname,
              author_lname,
              author_minit,
              author_email
            )
          )
        `)
        .single();

      if (surveyError) throw surveyError;

      // update authors
      const { error: deleteError } = await supabase
        .from("survey_author")
        .delete()
        .eq("survey", survey.id);

      if (deleteError) throw deleteError;

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

      const surveyAuthorInserts = authorIds.map(authorId => ({
        survey: survey.id,
        author: parseInt(authorId),
      }));

      const { error: linkError } = await supabase
        .from("survey_author")
        .insert(surveyAuthorInserts);

      if (linkError) throw linkError;

      onUpdate(updatedSurvey);
      // router.push('/survey/admin/success') // redirect to success page
      
    } catch (error) {
      console.error("Error updating survey:", error);
      alert(error instanceof Error ? error.message : "Failed to update survey");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#fbfaf8] overflow-y-auto"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
        backgroundSize: "20px 20px"
      }}
    >
      <NavBar/>
      
      <div className="pt-5">
        <main className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="mb-6">
            <button
              onClick={onClose}
              className="text-[#011638] hover:text-[#1a2a4f] inline-block mb-2 font-ubuntu-mono"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-oswald font-bold text-[#011638]">Edit Survey</h1>
          </div>

          <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* basic info section w/ same validation logic */}
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
                        maxLength={100}
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
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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

              {/* authors section */}
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
                              defaultValue={author.middleInitial || ""}
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
                                return;
                              } else if (input.value.length < 2) {
                                if (errorSpan) {
                                  errorSpan.textContent = 'Last Name must be at least 2 characters.';
                                  errorSpan.style.display = 'block';
                                }
                                return;
                              }

                              // check duplicate authors
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
                                        return;
                                      }
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
                            defaultValue={author.email || ""}
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

                              // check duplicate emails
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

                              // check existing author
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
                          defaultValue={formData.survey_start}
                          required
                          min="2022-01-01"
                          max={new Date().toISOString().split('T')[0]}
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                          onChange={(e) => {
                            const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;
                            if (endDateInput) {
                              const startDate = e.target.value;
                              const today = new Date().toISOString().split('T')[0];
                              endDateInput.min = startDate > today ? startDate : today;

                              if (endDateInput.value && endDateInput.value < startDate) {
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
                          defaultValue={formData.survey_end}
                          required
                          min={formData.survey_start || new Date().toISOString().split('T')[0]}
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
                        defaultValue={formData.survey_link}
                        required
                        maxLength={200}
                        placeholder="Enter survey URL"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onInput={async (e) => {
                          const input = e.target as HTMLInputElement;
                          const errorSpan = document.getElementById('survey-link-error');
                          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
                          
                          if (input.value.length === 0) {
                            if (errorSpan) {
                              errorSpan.textContent = 'Survey link is required.';
                              errorSpan.style.display = 'block';
                            }
                            setSurveyLinkError("");
                          } else if (!urlRegex.test(input.value)) {
                            let isValidUrl = false;
                            try {
                              new URL(input.value);
                              isValidUrl = true;
                            } catch {
                              isValidUrl = false;
                            }

                            if (!isValidUrl) {
                              if (errorSpan) {
                                errorSpan.textContent = 'Please enter a valid URL.';
                                errorSpan.style.display = 'block';
                              }
                              setSurveyLinkError("");
                            } else {
                              if (errorSpan) {
                                errorSpan.style.display = 'none';
                              }
                              await checkDuplicateSurveyLink(input.value);
                            }
                          }
                        }}
                      />
                      <span id="survey-link-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                      {surveyLinkError && (
                        <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                          {surveyLinkError}
                        </span>
                      )}
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
                        maxLength={34}
                        placeholder="Enter respondent criteria separated by commas"
                        className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                            return;
                          }
                          if (!/[A-Za-z\s,.'-]/.test(e.key)) {
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
                            className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
                                setFormData(prev => ({ ...prev, r_category: e.target.value }));
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
                            maxLength={20}
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
                            className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
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
                                setFormData(prev => ({ ...prev, school: e.target.value }));
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
                          {option.label} {disabled}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
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