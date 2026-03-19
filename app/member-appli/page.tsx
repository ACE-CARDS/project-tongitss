"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function MembershipApplication() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    studentNumber: "",
    email: "",
    course: "",
    yearLevel: "1st Year",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  const [pageContent, setPageContent] = useState({
    reminders: [] as string[],
    instructions: [
      "Click the application link provided on our official Facebook page.",
      "Fill out the form completely and honestly.",
      "Upload all necessary attachments in PDF format.",
      "Wait for an email confirmation regarding your interview schedule.",
    ],
    videoUrl: "https://www.youtube.com/embed/Z1UWsBJ5HgU",
  });
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .order("id", { ascending: true });

      if (data && !error) {
        const fetchedReminders = data
          .filter((row) => [1, 2, 3, 4].includes(row.id))
          .map((row) => row.content);

        setPageContent((prev) => ({
          ...prev,
          reminders:
            fetchedReminders.length > 0 ? fetchedReminders : prev.reminders,
        }));
      } else {
        console.error("Failed to fetch content from Supabase:", error);
      }
      setIsLoadingContent(false);
    };

    fetchContent();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: "", text: "" });

    const { error } = await supabase.from("applications").insert([
      {
        full_name: formData.fullName,
        student_number: formData.studentNumber,
        email: formData.email,
        course: formData.course,
        year_level: formData.yearLevel,
      },
    ]);

    if (error) {
      console.error("Submission error:", error);
      setSubmitMessage({
        type: "error",
        text: "Something went wrong. Please try again.",
      });
    } else {
      setSubmitMessage({
        type: "success",
        text: "Application submitted successfully! We'll be in touch.",
      });
      setFormData({
        fullName: "",
        studentNumber: "",
        email: "",
        course: "",
        yearLevel: "1st Year",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-[#f8f9fa] text-[#141414] min-h-screen flex flex-col relative overflow-hidden">
      {/* GLOBAL BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#eec643] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10 fixed"></div>
      <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] bg-[#0d21a1] rounded-full blur-[150px] opacity-10 pointer-events-none -z-10 fixed"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-[#011638] rounded-full blur-[150px] opacity-5 pointer-events-none -z-10 fixed"></div>

      <NavBar />

      <main className="flex-grow relative z-10 pb-20">
        <div className="absolute top-24 left-4 sm:left-6 lg:left-12 z-50">
          <button
            onClick={() => router.back()}
            className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-white hover:scale-105 hover:shadow-md transition-all text-[#011638] flex items-center justify-center backdrop-blur-md"
            aria-label="Go back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        </div>

        <section className="pt-32 pb-12 px-6 lg:px-20 relative flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-4xl flex flex-col items-center mt-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 shadow-sm mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-black text-green-600 tracking-widest uppercase">
                Status: Open
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black bg-gradient-to-r from-[#eec643] via-[#0d21a1] to-[#011638] bg-clip-text text-transparent uppercase tracking-tight drop-shadow-sm mb-6 leading-none">
              Member <br /> Application
            </h1>
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mx-auto rounded-full shadow-sm mb-8"></div>
          </motion.div>
        </section>

        <section className="py-12 px-6 lg:px-20 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch justify-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full relative group"
            >
              <div className="h-full bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#011638] flex items-center justify-center mb-8 text-white">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-[#011638] mb-8 uppercase tracking-wide">
                  General Reminders
                </h3>

                {isLoadingContent ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                  </div>
                ) : (
                  <ul className="space-y-6 text-lg text-[#141414]/80 font-medium">
                    {pageContent.reminders.length > 0 ? (
                      pageContent.reminders.map((reminder, idx) => (
                        <li key={idx} className="flex items-start gap-4">
                          <span className="text-[#eec643] text-2xl mt-[-4px]">
                            ✦
                          </span>
                          <span>{reminder}</span>
                        </li>
                      ))
                    ) : (
                      <p className="italic text-gray-500">
                        No reminders posted.
                      </p>
                    )}
                  </ul>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 w-full relative group"
            >
              <div className="h-full bg-[#011638]/90 backdrop-blur-xl border border-[#011638] rounded-[2.5rem] p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 text-white">
                <div className="w-14 h-14 rounded-2xl bg-[#eec643] flex items-center justify-center mb-8 text-[#011638]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-wide">
                  Instructions
                </h3>

                <ol className="space-y-6 text-lg text-white/80 font-medium list-decimal list-inside marker:text-[#eec643] marker:font-black">
                  {pageContent.instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 px-6 relative flex flex-col items-center justify-center overflow-hidden">
          <div className="relative z-10 w-full max-w-5xl text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-[#011638] uppercase tracking-widest mb-6">
              Hear From Our Scholars
            </h2>
            <div className="w-16 h-1.5 bg-[#eec643] mx-auto rounded-full shadow-sm mb-16"></div>

            <div className="relative w-full max-w-4xl mx-auto aspect-video bg-[#011638]/5 backdrop-blur-xl border-4 border-white shadow-2xl flex items-center justify-center rounded-[2.5rem] overflow-hidden group">
              <iframe
                className="absolute inset-0 w-full h-full border-0 z-10"
                src={pageContent.videoUrl}
                title="Scholar Testimony"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="absolute top-20 left-4 lg:left-10 text-6xl text-[#eec643]/30 -rotate-12 select-none pointer-events-none">
              "
            </div>
            <div className="absolute bottom-10 right-4 lg:right-10 text-8xl text-[#0d21a1]/10 rotate-12 select-none pointer-events-none">
              "
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.4, duration: 1 }}
            className="absolute -bottom-10 right-0 lg:right-10 z-20 w-48 h-48 lg:w-72 lg:h-72 drop-shadow-2xl pointer-events-none"
          >
            <img
              src="/assets/logos/mascot.png"
              alt="Ace Cards Mascot"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </section>

        <section className="py-12 px-6 relative z-10 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border-2 border-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden"
          >
            <h2 className="text-3xl font-black text-[#011638] uppercase tracking-wide mb-8 border-b-2 border-gray-100 pb-4">
              Official Form
            </h2>

            {submitMessage.text && (
              <div
                className={`p-4 mb-8 rounded-xl font-bold text-center ${submitMessage.type === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}
              >
                {submitMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Juan Dela Cruz"
                    className="px-6 py-4 rounded-2xl bg-white/50 border border-gray-200 focus:border-[#0d21a1] focus:ring-2 focus:ring-[#0d21a1]/20 outline-none font-medium text-[#011638] transition-all"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
                    Student Number
                  </label>
                  <input
                    required
                    type="text"
                    name="studentNumber"
                    value={formData.studentNumber}
                    onChange={handleChange}
                    placeholder="202X-XXXXX"
                    className="px-6 py-4 rounded-2xl bg-white/50 border border-gray-200 focus:border-[#0d21a1] focus:ring-2 focus:ring-[#0d21a1]/20 outline-none font-medium text-[#011638] transition-all"
                  />
                </div>

                <div className="flex flex-col md:col-span-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@example.com"
                    className="px-6 py-4 rounded-2xl bg-white/50 border border-gray-200 focus:border-[#0d21a1] focus:ring-2 focus:ring-[#0d21a1]/20 outline-none font-medium text-[#011638] transition-all"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
                    Course / Program
                  </label>
                  <input
                    required
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="BS Computer Science"
                    className="px-6 py-4 rounded-2xl bg-white/50 border border-gray-200 focus:border-[#0d21a1] focus:ring-2 focus:ring-[#0d21a1]/20 outline-none font-medium text-[#011638] transition-all"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 ml-2">
                    Year Level
                  </label>
                  <select
                    name="yearLevel"
                    value={formData.yearLevel}
                    onChange={handleChange}
                    className="px-6 py-4 rounded-2xl bg-white/50 border border-gray-200 focus:border-[#0d21a1] focus:ring-2 focus:ring-[#0d21a1]/20 outline-none font-medium text-[#011638] transition-all appearance-none cursor-pointer"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>5th Year</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-8 py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all shadow-xl ${isSubmitting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-[#011638] text-white hover:bg-[#0d21a1] hover:scale-[1.02]"}`}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
