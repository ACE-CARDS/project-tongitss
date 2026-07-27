"use client";

import { useState, useMemo } from "react";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import BackButton from "@/components/ui/backButton";
import AnimatedTitle from "@/components/ui/animatedTitle";

const accreditedSchools = [
    {
      abbr: "AVC", school: "Abra Valley Campus", province: "Abra",
      courses: [
        { name: "BS Architecture", scholarship: "jlss" },
        { name: "BS Civil Engineering", scholarship: "jlss" },
        { name: "BS Information Technology", scholarship: "jlss" },
      ],
    },
    {
      abbr: "ASC", school: "Apayao State College", province: "Apayao",
      courses: [
        { name: "BS Agricultural Biosystems Engineering", scholarship: "both" },
        { name: "BS Agriculture", scholarship: "both" },
        { name: "BS Civil Engineering", scholarship: "both" },
        { name: "BS Forestry", scholarship: "both" },
        { name: "BS Information Technology", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
      ],
    },
    {
      abbr: "BCU", school: "Baguio Central University", province: "Benguet",
      courses: [
        { name: "BS Civil Engineering", scholarship: "jlss" },
        { name: "BS Geodetic Engineering", scholarship: "jlss" },
        { name: "BSE General Sciences", scholarship: "jlss" },
      ],
    },
    {
      abbr: "BSU", school: "Benguet State University", province: "Benguet",
      courses: [
        { name: "BS Agribusiness", scholarship: "both" },
        { name: "BS Agricultural Biosystems Engineering", scholarship: "both" },
        { name: "BS Agricultural Engineering", scholarship: "both" },
        { name: "BS Agriculture", scholarship: "both" },
        { name: "BS Applied Statistics", scholarship: "both" },
        { name: "BS Development Communication major in Science Communication", scholarship: "both" },
        { name: "BS Environmental Science", scholarship: "both" },
        { name: "BS Forestry", scholarship: "both" },
        { name: "BS Information Technology", scholarship: "both" },
        { name: "BS Library and Information Science", scholarship: "both" },
        { name: "BS Nutrition and Dietetics", scholarship: "both" },
        { name: "BSE Biological Sciences", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
        { name: "Doctor of Veterinary Medicine", scholarship: "both" },
      ],
    },
    {
      abbr: "CA+CT", school: "Cordillera A+ Computer Technology College", province: "Kalinga",
      courses: [{ name: "BS Information Technology", scholarship: "jlss" }],
    },
    {
      abbr: "DCCP", school: "Data Center College of the Philippines of Baguio City, Inc.", province: "Benguet",
      courses: [
        { name: "BS Computer Engineering", scholarship: "jlss" },
        { name: "BS Computer Science", scholarship: "jlss" },
        { name: "BS Information Technology", scholarship: "jlss" },
      ],
    },
    {
      abbr: "DWCB", school: "Divine World College of Bangued", province: "Abra",
      courses: [
        { name: "BS Information Technology", scholarship: "jlss" },
        { name: "BSE Mathematics", scholarship: "jlss" },
        { name: "BSE Science", scholarship: "jlss" },
      ],
    },
    {
      abbr: "EC", school: "Easter College", province: "Benguet",
      courses: [{ name: "BSE Mathematics", scholarship: "jlss" }],
    },
    {
      abbr: "IFSU", school: "Ifugao State University", province: "Ifugao",
      courses: [
        { name: "BS Agricultural Engineering", scholarship: "both" },
        { name: "BS Agricultural Technology", scholarship: "both" },
        { name: "BS Agriculture", scholarship: "both" },
        { name: "BS Environmental Engineering", scholarship: "both" },
        { name: "BS Forestry", scholarship: "both" },
        { name: "BS Information Technology", scholarship: "both" },
        { name: "BS Mathematics", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
        { name: "BSE Physical Sciences", scholarship: "both" },
        { name: "BSE Science", scholarship: "both" },
      ],
    },
    {
      abbr: "ISAP", school: "International School of Asia and the Pacific (Kalinga)", province: "Kalinga",
      courses: [
        { name: "BS Computer Engineering", scholarship: "jlss" },
        { name: "BS Information Technology", scholarship: "jlss" },
        { name: "BS Psychology", scholarship: "jlss" },
        { name: "BSE Mathematics", scholarship: "jlss" },
        { name: "BSE Science", scholarship: "jlss" },
      ],
    },
    {
      abbr: "KSU", school: "Kalinga State University", province: "Kalinga",
      courses: [
        { name: "BS Agricultural Engineering", scholarship: "both" },
        { name: "BS Agriculture", scholarship: "both" },
        { name: "BS Biology", scholarship: "both" },
        { name: "BS Civil Engineering", scholarship: "both" },
        { name: "BS Computer Engineering", scholarship: "both" },
        { name: "BS Electrical Engineering", scholarship: "both" },
        { name: "BS Forestry", scholarship: "both" },
        { name: "BS Mathematics", scholarship: "both" },
        { name: "BS Pharmacy", scholarship: "both" },
        { name: "BS Public Health", scholarship: "both" },
        { name: "BSE Biological Sciences", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
      ],
    },
    {
      abbr: "KCP", school: "Kings College of the Philippines", province: "Benguet",
      courses: [
        { name: "BS Agricultural Technology", scholarship: "jlss" },
        { name: "BS Psychology", scholarship: "jlss" },
        { name: "BSE Mathematics", scholarship: "jlss" },
      ],
    },
    {
      abbr: "MPSPC", school: "Mountain Province State Polytechnic College", province: "Mountain Province",
      courses: [
        { name: "BS Agricultural Technology", scholarship: "both" },
        { name: "BS Civil Engineering", scholarship: "both" },
        { name: "BS Electrical Engineering", scholarship: "both" },
        { name: "BS Environmental Science", scholarship: "both" },
        { name: "BS Forestry", scholarship: "both" },
        { name: "BS Geodetic Engineering", scholarship: "both" },
        { name: "BS Information Technology", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
        { name: "BSE Science", scholarship: "both" },
      ],
    },
    {
      abbr: "PCC", school: "Pines City Colleges", province: "Benguet",
      courses: [
        { name: "BS Medical Laboratory Science", scholarship: "jlss" },
        { name: "BS Pharmacy", scholarship: "jlss" },
      ],
    },
    {
      abbr: "SLU", school: "Saint Louis University", province: "Benguet",
      courses: [
        { name: "BS Architecture", scholarship: "jlss" },
        { name: "BS Biology", scholarship: "both" },
        { name: "BS Chemical Engineering", scholarship: "both" },
        { name: "BS Civil Engineering", scholarship: "both" },
        { name: "BS Computer Science", scholarship: "both" },
        { name: "BS Electrical Engineering", scholarship: "both" },
        { name: "BS Electronics Engineering", scholarship: "jlss" },
        { name: "BS Geodetic Engineering", scholarship: "jlss" },
        { name: "BS Industrial Engineering", scholarship: "both" },
        { name: "BS Information Technology", scholarship: "both" },
        { name: "BS Mechanical Engineering", scholarship: "both" },
        { name: "BS Mechatronics Engineering", scholarship: "jlss" },
        { name: "BS Medical Laboratory Science", scholarship: "both" },
        { name: "BS Mining Engineering", scholarship: "both" },
        { name: "BS Pharmacy", scholarship: "jlss" },
        { name: "BS Psychology", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
        { name: "BSE Science", scholarship: "both" },
      ],
    },
    {
      abbr: "STC", school: "Saint Tonis College", province: "Kalinga",
      courses: [{ name: "BSE Mathematics", scholarship: "jlss" }],
    },
    {
      abbr: "STI", school: "STI College - Baguio", province: "Benguet",
      courses: [
        { name: "BS Computer Engineering", scholarship: "jlss" },
        { name: "BS Computer Science", scholarship: "jlss" },
        { name: "BS Information Technology", scholarship: "jlss" },
      ],
    },
    {
      abbr: "UA", school: "University of Abra / Abra State Institute of Sciences and Technology", province: "Abra",
      courses: [
        { name: "BS Agribusiness", scholarship: "both" },
        { name: "BS Agricultural Technology", scholarship: "both" },
        { name: "BS Agriculture", scholarship: "both" },
        { name: "BS Biology", scholarship: "both" },
        { name: "BS Civil Engineering", scholarship: "both" },
        { name: "BS Electrical Engineering", scholarship: "both" },
        { name: "BS Environmental Science", scholarship: "both" },
        { name: "BS Forestry", scholarship: "both" },
        { name: "BS Mathematics", scholarship: "both" },
        { name: "BS Mechanical Engineering", scholarship: "both" },
        { name: "BSE Biological Sciences", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
        { name: "BSE Science", scholarship: "both" },
      ],
    },
    {
      abbr: "UB", school: "University of Baguio", province: "Benguet",
      courses: [
        { name: "BS Architecture", scholarship: "jlss" },
        { name: "BS Civil Engineering", scholarship: "jlss" },
        { name: "BS Computer Engineering", scholarship: "jlss" },
        { name: "BS Computer Science", scholarship: "both" },
        { name: "BS Electronics Engineering", scholarship: "jlss" },
        { name: "BS Information Technology", scholarship: "jlss" },
        { name: "BS Medical Laboratory Science", scholarship: "both" },
      ],
    },
    {
      abbr: "UC", school: "University of the Cordilleras", province: "Benguet",
      courses: [
        { name: "BS Architecture", scholarship: "both" },
        { name: "BS Civil Engineering", scholarship: "jlss" },
        { name: "BS Computer Engineering", scholarship: "jlss" },
        { name: "BS Computer Science", scholarship: "both" },
        { name: "BS Electronics Engineering", scholarship: "jlss" },
        { name: "BS Information Technology", scholarship: "both" },
        { name: "BS Psychology", scholarship: "both" },
        { name: "BSE Mathematics", scholarship: "both" },
      ],
    },
    {
      abbr: "UPB", school: "University of the Philippines-Baguio", province: "Benguet",
      courses: [
        { name: "BS Biology", scholarship: "both" },
        { name: "BS Computer Science", scholarship: "both" },
        { name: "BS Mathematics", scholarship: "both" },
        { name: "BS Physics", scholarship: "both" },
      ],
    },
  ];  
  

  const faqs = [
    {
      q: "Who is eligible to apply for the DOST-SEI Undergraduate Scholarship?",
      a: "Eligible applicants are graduating Grade 12 students (STEM strand, or top 5% of the graduating class for non-STEM strands) and senior high school graduates who have not yet enrolled in college or earned any college/technical-vocational units. Applicants must intend to enroll in a DOST-SEI priority S&T program at an identified university by the First Semester of the upcoming academic year. Those already in college are not eligible to apply.",
    },
    {
      q: "What is the difference between the RA 7687 Scholarship and the Merit Scholarship?",
      a: "The RA 7687 Scholarship is a financial assistance program intended for academically talented students from economically disadvantaged families. The Merit Scholarship, on the other hand, recognizes students who have demonstrated outstanding academic performance in science and mathematics, regardless of financial status. Despite the difference in eligibility criteria, scholars under both programs receive the same benefits and are subject to the same responsibilities and obligations under the DOST-SEI Scholarship Program.",
    },
    {
      q: "Is there an application or examination fee?",
      a: "No. The application process and the qualifying examination are completely free of charge.",
    },
    {
      q: "How do I apply?",
      a: "Create an account through the official DOST-SEI E-Scholarship portal, complete the online application form, upload all required documents, and wait for your eligibility confirmation before taking the qualifying examination. For a more comprehensive application guide, please refer to the official DOST-SEI website.",
    },
    {
      q: "Do I need to enroll in a priority program?",
      a: "Yes. The DOST-SEI Scholarship is available only to students enrolled in approved priority programs in Science, Technology, Engineering, and Mathematics (STEM). Check if your school and course in CAR are eligible on the checker above.",
    },
    {
      q: "Should I apply for the Undergraduate Scholarship or JLSS?",
      a: "The DOST-SEI Undergraduate Scholarship is intended for incoming first-year college students. Meanwhile, the Junior Level Science Scholarship (JLSS) is intended for students who have completed their first two years of college and are entering their third year in a DOST-SEI priority degree program.",
    },
    {
      q: "Can I receive more than one scholarship at the same time?",
      a: "DOST scholars are not allowed to receive any other government scholarship or financial aid simultaneously. A private scholarship from your school may be allowed, provided its terms don't conflict with your DOST-SEI obligations.",
    },
    {
      q: "What are the benefits of an Undergraduate DOST Scholar?",
      a: "Scholars receive tuition and school fee coverage (up to ₱40,000/year for those in private HEIs), a Learning Materials/Connectivity Allowance (₱10,000/year), Monthly Living Allowance (₱8,000/month), Clothing Allowance (₱1,000, first year only), transportation allowance for those studying outside their home province, group health and accident insurance, a Thesis Allowance (₱10,000), and a Graduation Allowance (₱1,000). A reduced allowance also applies for the mid-year term, if required by the curriculum.",
    },
    {
      q: "What are my obligations as a scholar?",
      a: "Scholars must maintain good academic standing for the duration of their program and enroll only in DOST-SEI identified institutions. Shifting programs or transferring schools is allowed once, only in meritorious cases, by the second semester of third year. Upon graduation, scholars must complete a Return Service Agreement, which is a full-time service in the Philippines for a period equal to the scholarship duration. Failure to comply may require rendering equivalent service or refunding the financial assistance received, with 12% interest.",
    },
    {
      q: "Where can I ask questions about my application?",
      content: (
        <>
          For application-specific inquiries, please contact the DOST Science
          Education Institute (DOST-SEI) or visit its official website for the most
          accurate and up-to-date information.
          <br />
          <br />
          You may also send your inquiries via email to:
          <div className="mt-3 space-y-2">
            <CopyEmail email="dostcarscholarshipunit@gmail.com" />
            <CopyEmail email="acecards.dostcarscholars@gmail.com" />
          </div>
        </>
      ),
    }
  ];

function CopyEmail({ email }: { email: string }) {
    const [copied, setCopied] = useState(false);
  
    const copy = async () => {
      await navigator.clipboard.writeText(email);
      setCopied(true);
  
      setTimeout(() => setCopied(false), 2000);
    };
  
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#011638]/10 bg-[#011638]/5 px-3 py-2">
        <span className="font-mono text-sm text-[#011638] break-all">
          {email}
        </span>
  
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
  const [schoolQuery, setSchoolQuery] = useState("");
  const [courseQuery, setCourseQuery] = useState("");
  const [scholarshipType, setScholarshipType] = useState<"all" | "ug" | "jlss">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);


  const results = useMemo(() => {
    const sq = schoolQuery.trim().toLowerCase();
    const cq = courseQuery.trim().toLowerCase();

    return accreditedSchools
      .map((entry) => {
        const schoolMatches = sq
          ? entry.school.toLowerCase().includes(sq) ||
            entry.abbr.toLowerCase().includes(sq) ||
            entry.province.toLowerCase().includes(sq)
          : true;

          const matchingCourses = entry.courses.filter((course) => {
            const nameMatches = cq ? course.name.toLowerCase().includes(cq) : true;

            const scholarshipMatches =
              scholarshipType === "ug"
                ? course.scholarship === "both"
                : scholarshipType === "jlss"
                ? course.scholarship === "jlss" || course.scholarship === "both"
                : true;

            return nameMatches && scholarshipMatches;
          });



        if (!schoolMatches || matchingCourses.length === 0) return null;
        return { ...entry, courses: matchingCourses };
      })
      .filter((entry): entry is (typeof accreditedSchools)[number] => entry !== null);
  }, [schoolQuery, courseQuery, scholarshipType]);

  const totalCourseMatches = useMemo(
    () => results.reduce((sum, entry) => sum + entry.courses.length, 0),
    [results],
  );

  const hasQuery =
    schoolQuery.trim() !== "" || courseQuery.trim() !== "" || scholarshipType !== "all";

  const clearFilters = () => {
    setSchoolQuery("");
    setCourseQuery("");
    setScholarshipType("all");
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

          {/* Search Section */}
          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#011638] mb-2">
              Accredited Schools &amp; Courses
            </h2>
            <p className="text-slate-600 mb-4 text-sm sm:text-base">
              Enter the name of your preferred school and/or degree program to check
              whether it is recognized under the DOST-SEI Scholarship.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <select
                value={scholarshipType}
                onChange={(e) => setScholarshipType(e.target.value as "all" | "ug" | "jlss")}
                className="sm:w-56 rounded-xl px-4 py-2.5
                          bg-[#011638]/5
                          border border-[#011638]/15
                          text-[#011638]
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[#011638]/25
                          focus:border-[#011638]
                          transition-colors cursor-pointer"
              >
                <option value="all">All scholarship types</option>
                <option value="ug">Undergraduate only</option>
                <option value="jlss">JLSS</option>
              </select>
              <input
                type="text"
                value={schoolQuery}
                onChange={(e) => setSchoolQuery(e.target.value)}
                placeholder="Search school or province"
                className="flex-1 rounded-xl px-4 py-2.5
                          bg-[#011638]/5
                          border border-[#011638]/15
                          text-[#011638]
                          placeholder:text-slate-500
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[#011638]/25
                          focus:border-[#011638]
                          transition-colors"
              />
              <input
                type="text"
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                placeholder="Search course"
                className="flex-1 rounded-xl px-4 py-2.5
                          bg-[#011638]/5
                          border border-[#011638]/15
                          text-[#011638]
                          placeholder:text-slate-500
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[#011638]/25
                          focus:border-[#011638]
                          transition-colors"
              />
            </div>

            {/* Result count n clear filters */}
            <div className="flex items-center justify-between mb-6 min-h-[24px]">
              <p className="text-sm text-slate-500">
                {hasQuery
                  ? `${results.length} school${results.length !== 1 ? "s" : ""} · ${totalCourseMatches} program${totalCourseMatches !== 1 ? "s" : ""} found`
                  : `${accreditedSchools.length} accredited schools`}
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
              {results.length > 0 ? (
                results.map((entry) => (
                  <div
                    key={entry.abbr}
                    className="rounded-2xl py-4 px-5 sm:px-6 bg-white border border-[#011638]/12 shadow-sm hover:shadow-md hover:border-[#011638]/20 transition-all duration-200"
                  >
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <span className="font-semibold text-[#011638] text-lg">
                        {entry.school}
                      </span>
                      <span className="text-xs font-medium text-[#011638]/40 bg-[#011638]/5 px-2 py-0.5 rounded-full">
                        {entry.abbr}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs mb-3">{entry.province}</p>

                    <div className="flex flex-wrap gap-2">
                      {entry.courses.map((course) => (
                        <span
                          key={course.name}
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
                      ? "No matching results were found. The selected school and program may not be accredited or are not currently included in our database."
                      : "No records available."}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                      Please verify the information through the DOST-CAR Scholarship Unit.
                  </p>
                  {hasQuery && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm text-[#011638] font-medium underline underline-offset-2 hover:text-[#0d21a1] transition-colors cursor-pointer"
                    >
                      Clear filters and try again
                    </button>
                  )}
                </div>
              )}
            </div>

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

          {/* FAQ Section */}
          <section className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#011638] mb-6">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-3">
              {faqs.map((item, i) => (
                <div
                  key={i}
                  className="border border-[#011638]/12 rounded-2xl bg-white shadow-sm backdrop-blur-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left px-5 sm:px-6 py-4 cursor-pointer hover:bg-[#011638]/5 transition-colors"
                  >
                    <span className="font-semibold text-[#011638] pr-4">{item.q}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`size-5 shrink-0 text-[#eec643] transition-transform duration-200 ${
                        openFaq === i ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                    <div className="text-slate-600 px-5 sm:px-6 pb-4 leading-relaxed">
                        {"content" in item ? item.content : item.a}
                    </div>
                    </div>
                  </div>
                </div>
              ))}
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
