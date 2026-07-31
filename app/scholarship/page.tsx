"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";
import AnimatedTitle from "@/components/ui/animatedTitle";

interface School {
    id: number;
    school: string;
    school_acronym: string;
    province: string;
    courses: string;
    scholarship_type: string;
}

interface FAQ {
    id: number;
    question: string;
    answer: string;
    order_index: number;
}

interface ParsedCourse {
    name: string;
    type: string;
}

function CopyEmail({ email }: { email: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#011638]/10 bg-[#011638]/5 px-3 py-2">
            <span className="font-mono text-sm text-[#011638] break-all">{email}</span>
            <button
                onClick={copy}
                className="shrink-0 rounded-lg bg-[#011638] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0d21a1] transition"
            >
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    );
}

export default function ScholarshipPage() {
    const supabase = createClient();
    const [schools, setSchools] = useState<School[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    const [schoolQuery, setSchoolQuery] = useState("");
    const [courseQuery, setCourseQuery] = useState("");
    const [scholarshipType, setScholarshipType] = useState<"ug" | "jlss" | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schoolsRes, faqsRes] = await Promise.all([
                supabase.from("scholarship").select("*").order("school", { ascending: true }),
                supabase.from("scholarship_faq").select("*").order("order_index", { ascending: true }),
            ]);

            if (schoolsRes.error) throw schoolsRes.error;
            if (faqsRes.error) throw faqsRes.error;

            setSchools(schoolsRes.data || []);
            setFaqs(faqsRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const parseCourseWithType = (courseStr: string): ParsedCourse | null => {
        const match = courseStr.match(/^(.+?)\s*\(([^)]+)\)$/);
        if (match) {
            return {
                name: match[1].trim(),
                type: match[2].trim().toUpperCase()
            };
        }
        return {
            name: courseStr.trim(),
            type: "DEFAULT"
        };
    };

    const results = useMemo(() => {
    if (!scholarshipType) return [];

    const sq = schoolQuery.trim().toLowerCase();
    const cq = courseQuery.trim().toLowerCase();

    return schools
        .map((entry) => {
            const schoolMatches = sq
                ? entry.school.toLowerCase().includes(sq) ||
                  entry.school_acronym.toLowerCase().includes(sq) ||
                  entry.province.toLowerCase().includes(sq)
                : true;

            const courseList = entry.courses.split(",").map(c => c.trim());
            
            const matchingCourses = courseList
                .map(courseStr => {
                    const parsed = parseCourseWithType(courseStr);
                    if (!parsed) return null;
                    
                    const courseType = parsed.type === "DEFAULT" ? entry.scholarship_type : parsed.type;
                    
                    return {
                        full: courseStr,
                        name: parsed.name,
                        type: courseType
                    };
                })
                .filter((course): course is { full: string; name: string; type: string } => course !== null)
                .filter(course => {
                    const nameMatches = cq ? course.name.toLowerCase().includes(cq) : true;
                    // UG tab: show UGE only then JLSS tab: show UGE (since subset si JLSS) and JLSS
                    const typeMatches = scholarshipType === "ug" 
                        ? course.type === "UGE"
                        : course.type === "UGE" || course.type === "JLSS";
                    return nameMatches && typeMatches;
                })
                // Sort courses alphabetically
                .sort((a, b) => a.name.localeCompare(b.name));

            if (!schoolMatches || matchingCourses.length === 0) return null;

            return {
                ...entry,
                parsedCourses: matchingCourses,
            };
        })
        .filter((entry): entry is School & { parsedCourses: { full: string; name: string; type: string }[] } => entry !== null);
}, [schools, schoolQuery, courseQuery, scholarshipType]);

    const totalCourseMatches = useMemo(
        () => results.reduce((sum, entry) => sum + entry.parsedCourses.length, 0),
        [results],
    );

    const hasQuery = schoolQuery.trim() !== "" || courseQuery.trim() !== "";

    const clearFilters = () => {
        setSchoolQuery("");
        setCourseQuery("");
    };

    const handleTabSelect = (type: "ug" | "jlss") => {
        if (scholarshipType === type) {
            setScholarshipType(null);
            setSchoolQuery("");
            setCourseQuery("");
        } else {
            setScholarshipType(type);
            setSchoolQuery("");
            setCourseQuery("");
        }
    };

    return (
        <>
            <NavBar />
            <main className="w-full min-h-screen bg-[#fbfaf8] relative">
                <div className="container mx-auto pt-8 px-4 max-w-7xl relative z-10">
                    <BackButton />
                </div>

                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(#011638 1px, transparent 1px)`,
                        backgroundSize: "22px 22px",
                    }}
                />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 xl:px-0 pt-8 pb-20 sm:pb-24">
                    {/* Header */}
                    <div className="text-center mb-13">
                        <AnimatedTitle title="DOST Scholarship" />
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            Check whether your preferred school and degree program are accredited,
                            explore frequently asked questions, and visit the official DOST-SEI
                            website for complete scholarship information.
                        </p>
                    </div>

                    {/* Search */}
                    <section className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#011638] mb-2">
                            Accredited Schools &amp; Courses
                        </h2>
                        <p className="text-slate-600 mb-4 text-sm sm:text-base">
                            This presents the list of accredited schools with their corresponding degree programs offered under the DOST-SEI Scholarship.
                        </p>

                        {/* UGE/JLSS Tabs */}
                        <div className="flex w-full border-b border-gray-200">
                            <button
                                onClick={() => handleTabSelect("ug")}
                                className={`flex-1 text-center px-6 py-3 font-oswald font-bold tracking-wide uppercase transition-colors cursor-pointer ${scholarshipType === "ug" ? "border-b-4 border-[#011638] text-[#011638]" : "text-slate-400 hover:text-[#011638]"}`}
                            >
                                Undergraduate (Incoming 1st Year)
                            </button>
                            <button
                                onClick={() => handleTabSelect("jlss")}
                                className={`flex-1 text-center px-6 py-3 font-oswald font-bold tracking-wide uppercase transition-colors cursor-pointer ${scholarshipType === "jlss" ? "border-b-4 border-[#011638] text-[#011638]" : "text-slate-400 hover:text-[#011638]"}`}
                            >
                                Junior Level Science Scholarships (Incoming 3rd Year)
                            </button>
                        </div>

                        {/* Definition */}
                        <div className="py-3 px-2 text-sm text-slate-600 font-ubuntu-mono">
                            {scholarshipType === "ug" && (
                                <p>
                                    The S&T Undergraduate Scholarships Program (UGE) aims to stimulate and entice talented Filipino youths to pursue lifetime productive careers in science and technology and ensure a steady, adequate supply of qualified S&T human resources which can steer the country towards national progress.
                                </p>
                            )}
                            {scholarshipType === "jlss" && (
                                <p>
                                    The Junior Level Science Scholarships (JLSS) Program aims to: provide scholarships that will finance the education of talented students in their third year of college and who are pursuing priority degree programs in the areas of science and technology; and ensure a steady, adequate supply of qualified S&T human resources who can steer the country towards national progress.
                                </p>
                            )}
                        </div>

                        {/* Results of tab (once selected) */}
                        {scholarshipType ? (
                            <>
                                {/* Search */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-3">
                                    <input
                                        type="text"
                                        value={schoolQuery}
                                        onChange={(e) => setSchoolQuery(e.target.value)}
                                        placeholder="Search school or province"
                                        className="flex-1 rounded-xl px-4 py-2.5 bg-white border border-[#011638]/15 text-[#011638] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#011638]/25 focus:border-[#011638] transition-colors shadow-sm"
                                    />
                                    <input
                                        type="text"
                                        value={courseQuery}
                                        onChange={(e) => setCourseQuery(e.target.value)}
                                        placeholder="Search course"
                                        className="flex-1 rounded-xl px-4 py-2.5 bg-white border border-[#011638]/15 text-[#011638] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#011638]/25 focus:border-[#011638] transition-colors shadow-sm"
                                    />
                                </div>

                                {/* Result count & clear filters */}
                                <div className="flex items-center justify-between mb-6 min-h-[24px]">
                                    <p className="text-sm text-slate-500">
                                        {loading ? "Loading..." :
                                            hasQuery
                                                ? `${results.length} school${results.length !== 1 ? "s" : ""} · ${totalCourseMatches} program${totalCourseMatches !== 1 ? "s" : ""} found`
                                                : `${results.length} school${results.length !== 1 ? "s" : ""} found`}
                                    </p>
                                    {hasQuery && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-[#011638]/60 hover:text-[#011638] underline underline-offset-2 transition-colors cursor-pointer"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {loading ? (
                                        <div className="text-center py-10 border border-[#011638]/12 rounded-2xl bg-white">
                                            <p className="text-slate-700 font-medium animate-pulse">Loading accredited schools...</p>
                                        </div>
                                    ) : results.length > 0 ? (
                                        results.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="rounded-2xl py-4 px-5 sm:px-6 bg-white border border-[#011638]/12 shadow-sm hover:shadow-md hover:border-[#011638]/20 transition-all duration-200"
                                            >
                                                <div className="flex flex-wrap items-baseline gap-2 mb-1">
                                                    <span className="font-semibold text-[#011638] text-lg">
                                                        {entry.school}
                                                    </span>
                                                    <span className="text-xs font-medium text-[#011638]/40 bg-[#011638]/5 px-2 py-0.5 rounded-full">
                                                        {entry.school_acronym}
                                                    </span>
                                                </div>

                                                <p className="text-slate-500 text-xs mb-3">{entry.province}</p>

                                                <div className="flex flex-wrap gap-2">
                                                    {entry.parsedCourses.map((course) => (
                                                        <span
                                                            key={course.full}
                                                            className="text-sm text-[#011638] bg-[#eec643]/15 border border-[#eec643]/40 rounded-full px-3 py-1"
                                                        >
                                                            {course.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 border border-[#011638]/12 rounded-2xl bg-white">
                                            <p className="text-slate-700 font-medium">
                                                {hasQuery
                                                    ? "No matching results were found."
                                                    : "No programs available for this category."}
                                            </p>
                                            <p className="text-slate-500 text-sm mt-1">
                                                Please verify the information through the DOST-CAR Scholarship Unit.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10 border border-[#011638]/12 rounded-2xl bg-white mt-4">
                                <p className="text-slate-700 font-medium">
                                    Please select your year level above to see available programs.
                                </p>
                            </div>
                        )}

                        <p className="text-slate-400 text-xs mt-4">
                            Academic program offerings may change over time. Please confirm the availability of your chosen program 
                            through the DOST Regional Office – Cordillera Administrative Region (CAR) Scholarship Unit at{" "}
                            <a
                                href="mailto:dostcarscholarshipunit@gmail.com"
                                className="text-[#eec643] hover:underline font-medium"
                            >
                                dostcarscholarshipunit@gmail.com
                            </a>
                            .
                        </p>
                    </section>

                    {/* FAQ */}
                    <section className="mb-10">
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#011638] mb-6">
                            Frequently Asked Questions (FAQs)
                        </h2>
                        <div className="space-y-3">
                            {faqs.length > 0 ? (
                                faqs.map((item, i) => (
                                    <div
                                        key={item.id}
                                        className="border border-[#011638]/12 rounded-2xl bg-white shadow-sm backdrop-blur-sm overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between text-left px-5 sm:px-6 py-4 cursor-pointer hover:bg-[#011638]/5 transition-colors"
                                        >
                                            <span className="font-semibold text-[#011638] pr-4">{item.question}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className={`size-5 shrink-0 text-[#eec643] transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                        <div
                                            className={`grid transition-all duration-200 ease-in-out ${openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="text-slate-600 px-5 sm:px-6 pb-4 leading-relaxed whitespace-pre-wrap">
                                                    {item.answer}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    No FAQs available at the moment.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* DOST Link Section */}
                    <section className="text-center">
                        <div className="border border-[#011638]/15 rounded-3xl bg-[#011638]/5 backdrop-blur-sm px-6 py-10 sm:py-12">
                            <h2 className="text-xl sm:text-2xl font-bold text-[#011638] mb-2">
                                Need More Information?
                            </h2>
                            <p className="text-slate-600 mb-6 max-w-xl mx-auto">
                                Visit the official DOST Science Education Institute (DOST-SEI)
                                website for the latest scholarship guidelines, application
                                deadlines, announcements, and access to the official application
                                portal.
                            </p>
                            <a
                                href="https://www.sei.dost.gov.ph/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#011638] hover:bg-[#0d21a1] hover:scale-[1.03] hover:shadow-lg transition-all duration-200 text-white font-semibold px-6 py-3 rounded-full"
                            >
                                Visit sei.dost.gov.ph
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="size-4"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.25 5.5a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 .75.75h9a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 13.25 17.5h-9A2.25 2.25 0 0 1 2 15.25v-9A2.25 2.25 0 0 1 4.25 4h4a.75.75 0 0 1 0 1.5h-4Zm7.5-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.06l-6.22 6.22a.75.75 0 1 1-1.06-1.06L15.44 4H12.5a.75.75 0 0 1-.75-.75Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </a>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
