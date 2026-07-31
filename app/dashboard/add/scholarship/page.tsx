"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";
import { useUser } from "@/components/context/userContext";
import LoadingState from "@/components/ui/loading/mainLoadingState";

function AddScholarshipContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const { user } = useUser();

    const type = searchParams.get("type") || "school";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>("");

    // School form state
    const [schoolData, setSchoolData] = useState({
        school: "",
        school_acronym: "",
        province: "",
        courses: "",
    });

    // FAQ form state
    const [faqData, setFaqData] = useState({
        question: "",
        answer: "",
    });

    const [isFormValid, setIsFormValid] = useState(false);

    // Audit log user info
    const [currentUserName, setCurrentUserName] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

    const loadCurrentUser = async (email: string) => {
        const { data } = await supabase
            .from("member")
            .select("mem_fname, mem_lname, mem_email")
            .eq("mem_email", email)
            .single();

        const fullName = data
            ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim()
            : email;
        setCurrentUserName(fullName || email);
        setCurrentUserEmail(data?.mem_email || email);
    };

    useEffect(() => {
        if (user?.email) {
            loadCurrentUser(user.email);
        }
    }, [user?.email]);

    // Check authorization
    if (user?.role !== "admin" && user?.role !== "superadmin") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="font-ubuntu-mono text-[#475569]">You are not authorized to add scholarship entries.</p>
            </div>
        );
    }

    // Validate form
    const validateForm = () => {
        if (type === "school") {
            // Check if fields have values
            const schoolValid = 
                schoolData.school.trim().length > 0 &&
                schoolData.school_acronym.trim().length > 0 &&
                schoolData.province.trim().length > 0 &&
                schoolData.courses.trim().length > 0;

            // Check for error spans
            const errorSpanIds = ['school-error', 'acronym-error', 'province-error', 'courses-error'];
            let hasVisibleError = false;
            errorSpanIds.forEach(id => {
                const span = document.getElementById(id);
                if (span && span.style.display !== 'none') {
                    hasVisibleError = true;
                }
            });

            setIsFormValid(schoolValid && !hasVisibleError);
        } else {
            // Check if fields have values
            const faqValid = 
                faqData.question.trim().length > 0 &&
                faqData.answer.trim().length > 0;

            // Check for error spans
            const errorSpanIds = ['question-error', 'answer-error'];
            let hasVisibleError = false;
            errorSpanIds.forEach(id => {
                const span = document.getElementById(id);
                if (span && span.style.display !== 'none') {
                    hasVisibleError = true;
                }
            });

            setIsFormValid(faqValid && !hasVisibleError);
        }
    };

    // Validate on every change
    useEffect(() => {
        const timer = setTimeout(() => {
            validateForm();
        }, 50);
        return () => clearTimeout(timer);
    }, [schoolData, faqData, type]);

    const logAudit = async (action: string, details: string, table: string) => {
        const whoDidItName = currentUserName || user?.email || "Unknown User";
        const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";

        const { error } = await supabase.from("audit_log").insert([{
            action,
            details,
            user: whoDidItName,
            user_email: whoDidItEmail,
            table_name: table,
        }]);

        if (error) console.error("Failed to write audit log:", error);
    };

    const handleSchoolSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        // Trigger validation
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            (input as HTMLInputElement).dispatchEvent(new Event('input'));
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        // Check for visible errors
        const errorSpanIds = ['school-error', 'acronym-error', 'province-error', 'courses-error'];
        let hasError = false;
        errorSpanIds.forEach(id => {
            const span = document.getElementById(id);
            if (span && span.style.display !== 'none') {
                hasError = true;
            }
        });

        if (hasError) {
            const firstError = document.querySelector('[class*="border-red-500"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase.from("scholarship").insert([{
                school: schoolData.school.trim(),
                school_acronym: schoolData.school_acronym.trim().toUpperCase(),
                province: schoolData.province.trim(),
                courses: schoolData.courses.trim(),
            }]);

            if (error) throw error;

            await logAudit("Create", `Added school: ${schoolData.school} (${schoolData.school_acronym})`, "scholarship");

            router.push("/dashboard?tab=manage&section=scholarship");
            router.refresh();
        } catch (err: any) {
            setSubmitError(err.message);
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFaqSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        // Trigger validation
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            (input as HTMLInputElement).dispatchEvent(new Event('input'));
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        // Check for visible errors
        const errorSpanIds = ['question-error', 'answer-error'];
        let hasError = false;
        errorSpanIds.forEach(id => {
            const span = document.getElementById(id);
            if (span && span.style.display !== 'none') {
                hasError = true;
            }
        });

        if (hasError) {
            const firstError = document.querySelector('[class*="border-red-500"]');
            if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: maxData } = await supabase
                .from("scholarship_faq")
                .select("order_index")
                .order("order_index", { ascending: false })
                .limit(1);

            const nextOrder = maxData && maxData.length > 0 ? maxData[0].order_index + 1 : 0;

            const { error } = await supabase.from("scholarship_faq").insert([{
                question: faqData.question.trim(),
                answer: faqData.answer.trim(),
                order_index: nextOrder,
            }]);

            if (error) throw error;

            await logAudit("Create", `Added FAQ: ${faqData.question}`, "scholarship_faq");

            router.push("/dashboard?tab=manage&section=scholarship");
            router.refresh();
        } catch (err: any) {
            setSubmitError(err.message);
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update form validity on input
    const handleInput = () => {
        setTimeout(() => validateForm(), 50);
    };

    return (
        <main className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="flex flex-col mb-6 gap-4">
                <BackButton href="/dashboard?tab=manage&section=scholarship" className="!mb-0" />
                <h1 className="text-2xl font-oswald font-bold text-[#011638]">
                    Add {type === "school" ? "School" : "Frequently Asked Question"}
                </h1>
            </div>

            <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
                <form onSubmit={type === "school" ? handleSchoolSubmit : handleFaqSubmit} className="space-y-6">
                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <p className="font-ubuntu-mono text-sm">{submitError}</p>
                        </div>
                    )}

                    {type === "school" ? (
                        <>
                            <div>
                                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                                    <h2 className="text-lg font-oswald font-semibold">School Information</h2>
                                </div>
                                <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                                                School Name <span className="text-[#eec643]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={schoolData.school}
                                                onChange={(e) => {
                                                    setSchoolData({ ...schoolData, school: e.target.value });
                                                    handleInput();
                                                }}
                                                maxLength={200}
                                                placeholder="Enter school name"
                                                className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                                                onInput={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    const errorSpan = document.getElementById('school-error');
                                                    
                                                    if (input.value.length === 0) {
                                                        errorSpan!.textContent = 'School name is required.';
                                                        errorSpan!.style.display = 'block';
                                                    } else if (input.value.length < 2) {
                                                        errorSpan!.textContent = 'School name must be at least 2 characters.';
                                                        errorSpan!.style.display = 'block';
                                                    } else {
                                                        errorSpan!.style.display = 'none';
                                                    }
                                                    handleInput();
                                                }}
                                            />
                                            <span id="school-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                                                Acronym <span className="text-[#eec643]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={schoolData.school_acronym}
                                                onChange={(e) => {
                                                    setSchoolData({ ...schoolData, school_acronym: e.target.value });
                                                    handleInput();
                                                }}
                                                maxLength={20}
                                                placeholder="e.g., BSU"
                                                className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                                                onInput={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    const errorSpan = document.getElementById('acronym-error');
                                                    
                                                    if (input.value.length === 0) {
                                                        errorSpan!.textContent = 'Acronym is required.';
                                                        errorSpan!.style.display = 'block';
                                                    } else if (input.value.length < 2) {
                                                        errorSpan!.textContent = 'Acronym must be at least 2 characters.';
                                                        errorSpan!.style.display = 'block';
                                                    } else {
                                                        errorSpan!.style.display = 'none';
                                                    }
                                                    handleInput();
                                                }}
                                            />
                                            <span id="acronym-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                                                Province <span className="text-[#eec643]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={schoolData.province}
                                                onChange={(e) => {
                                                    setSchoolData({ ...schoolData, province: e.target.value });
                                                    handleInput();
                                                }}
                                                maxLength={100}
                                                placeholder="Enter province"
                                                className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                                                onInput={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    const errorSpan = document.getElementById('province-error');
                                                    
                                                    if (input.value.length === 0) {
                                                        errorSpan!.textContent = 'Province is required.';
                                                        errorSpan!.style.display = 'block';
                                                    } else if (input.value.length < 2) {
                                                        errorSpan!.textContent = 'Province must be at least 2 characters.';
                                                        errorSpan!.style.display = 'block';
                                                    } else {
                                                        errorSpan!.style.display = 'none';
                                                    }
                                                    handleInput();
                                                }}
                                            />
                                            <span id="province-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                                                Courses <span className="text-[#eec643]">*</span>
                                            </label>
                                            <textarea
                                                value={schoolData.courses}
                                                onChange={(e) => {
                                                    setSchoolData({ ...schoolData, courses: e.target.value });
                                                    handleInput();
                                                }}
                                                rows={4}
                                                maxLength={500}
                                                placeholder={`Enter courses with their program coverage in parenthesis e.g., BS Computer Science (JLSS) or BS Engineering (UGE). Note that if (UGE) is included, JLSS is already covered. Therefore, (UGE) indicates eligibility for both programs.`}
                                                className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] resize-y custom-scrollbar-blue"
                                                onInput={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    const errorSpan = document.getElementById('courses-error');
                                                    
                                                    if (input.value.length === 0) {
                                                        errorSpan!.textContent = 'Courses are required.';
                                                        errorSpan!.style.display = 'block';
                                                    } else if (input.value.length < 2) {
                                                        errorSpan!.textContent = 'Please enter at least one course.';
                                                        errorSpan!.style.display = 'block';
                                                    } else {
                                                        errorSpan!.style.display = 'none';
                                                    }
                                                    handleInput();
                                                }}
                                            />
                                            <span id="courses-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                                <Link
                                    href="/dashboard?tab=manage&section=scholarship"
                                    className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFormValid}
                                    className={`px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg font-oswald transition-colors ${(isSubmitting || !isFormValid) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a2a4f]'}`}
                                >
                                    {isSubmitting ? "Saving..." : "Save School"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
                                    <h2 className="text-lg font-oswald font-semibold">FAQ Information</h2>
                                </div>
                                <div className="border-2 border-t-2 border-[#011638] rounded-b-xl p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                                                Question <span className="text-[#eec643]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={faqData.question}
                                                onChange={(e) => {
                                                    setFaqData({ ...faqData, question: e.target.value });
                                                    handleInput();
                                                }}
                                                maxLength={200}
                                                placeholder="Enter the FAQ question"
                                                className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                                                onInput={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    const errorSpan = document.getElementById('question-error');
                                                    
                                                    if (input.value.length === 0) {
                                                        errorSpan!.textContent = 'Question is required.';
                                                        errorSpan!.style.display = 'block';
                                                    } else if (input.value.length < 5) {
                                                        errorSpan!.textContent = 'Question must be at least 5 characters.';
                                                        errorSpan!.style.display = 'block';
                                                    } else {
                                                        errorSpan!.style.display = 'none';
                                                    }
                                                    handleInput();
                                                }}
                                            />
                                            <span id="question-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                                                Answer <span className="text-[#eec643]">*</span>
                                            </label>
                                            <textarea
                                                value={faqData.answer}
                                                onChange={(e) => {
                                                    setFaqData({ ...faqData, answer: e.target.value });
                                                    handleInput();
                                                }}
                                                rows={5}
                                                maxLength={2000}
                                                placeholder="Enter the FAQ answer"
                                                className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8] resize-y custom-scrollbar-blue"
                                                onInput={(e) => {
                                                    const input = e.target as HTMLInputElement;
                                                    const errorSpan = document.getElementById('answer-error');
                                                    
                                                    if (input.value.length === 0) {
                                                        errorSpan!.textContent = 'Answer is required.';
                                                        errorSpan!.style.display = 'block';
                                                    } else if (input.value.length < 10) {
                                                        errorSpan!.textContent = 'Answer must be at least 10 characters.';
                                                        errorSpan!.style.display = 'block';
                                                    } else {
                                                        errorSpan!.style.display = 'none';
                                                    }
                                                    handleInput();
                                                }}
                                            />
                                            <span id="answer-error" className="text-xs mt-1 block font-ubuntu-mono text-red-600"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                                <Link
                                    href="/dashboard?tab=manage&section=scholarship"
                                    className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFormValid}
                                    className={`px-4 py-2 text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] rounded-lg font-oswald transition-colors ${(isSubmitting || !isFormValid) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1a2a4f]'}`}
                                >
                                    {isSubmitting ? "Saving..." : "Save FAQ"}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </main>
    );
}

export default function AddScholarshipPage() {
    const { user } = useUser();

    if (!user) {
        return <LoadingState />;
    }

    return (
        <Suspense fallback={<LoadingState />}>
            <NavBar />
            <AddScholarshipContent />
            <Footer />
        </Suspense>
    );
}