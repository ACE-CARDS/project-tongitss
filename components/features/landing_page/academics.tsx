import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GradientLine from "@/components/ui/gradientLine";
import { createClient } from "@/utils/supabase/client"; 

export default function Academics({id}: {id?: string}) {
  const supabase = createClient();
  const [surveyCount, setSurveyCount] = useState(0);
  const [thesesCount, setThesesCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {

      const { count: surveyTotal } = await supabase
        .from("survey")
        .select("*", { count: "exact", head: true })
        .eq("survey_status", "accepted");

      const { count: thesesTotal } = await supabase
        .from("thesis")
        .select("*", { count: "exact", head: true })
        .eq("thesis_status", "accepted");

      setSurveyCount(surveyTotal || 0);
      setThesesCount(thesesTotal || 0);
    };

    fetchCounts();
  }, []);

  
  //count animation for thesis
  const [displayThesesCount, setDisplayThesesCount] = useState(0);
  const thesesSectionRef = useRef(null);
  const [hasEnteredTheses, setHasEnteredTheses] = useState(false);
  const thesesAnimatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredTheses(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (thesesSectionRef.current) observer.observe(thesesSectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEnteredTheses || thesesAnimatedRef.current) return;

    thesesAnimatedRef.current = true;

    let start = 0;
    const target = thesesCount;
    const duration = 500;
    const increment = target / (duration / 16);

    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayThesesCount(target);
        clearInterval(interval);
      } else {
        setDisplayThesesCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [hasEnteredTheses, thesesCount]);

  //count animation for survey
  const [displaySurveyCount, setDisplaySurveyCount] = useState(0);
  const surveySectionRef = useRef(null);
  const [hasEnteredSurvey, setHasEnteredSurvey] = useState(false);
  const surveyAnimatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredSurvey(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (surveySectionRef.current) observer.observe(surveySectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEnteredSurvey || surveyAnimatedRef.current) return;

    surveyAnimatedRef.current = true;

    let start = 0;
    const target = surveyCount;
    const duration = 500;
    const increment = target / (duration / 16);

    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplaySurveyCount(target);
        clearInterval(interval);
      } else {
        setDisplaySurveyCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [hasEnteredSurvey, surveyCount]);

  return (
    <section
      id={id}
      className="py-8 sm:py-12 lg:py-16 relative w-full mx-auto bg-[#fbfaf8] overflow-hidden justify-center items-center"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0d21a1]/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full mx-auto relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-12 lg:gap-20">
          {/* Image */}
          <div className="flex justify-center lg:justify-end perspective-1000">
            <div className="relative group">
              {/* Glow effect behind img */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#eec643]/20 to-[#0d21a1]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700" />

              {/* Image w/ 3D hover effect */}
              <div className="rounded-3xl relative transform transition-all duration-700 group-hover:shadow-2xl">
                <img
                  src="/assets/logos/acad.jpg"
                  alt="Academics"
                  className="w-full max-w-[clamp(280px,40vw,600px)] rounded-3xl object-cover shadow-2xl ring-4 ring-white/20 transition-all duration-500 group-hover:ring-[#eec643]/70"
                />

                {/* shining shimmering splendid */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#011638]/20 via-transparent to-[#eec643]/10 rounded-3xl group-hover:opacity-75 transition-opacity duration-500" />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-md rounded-2xl px-6 py-3 shadow-2xl transform rotate-6 transition-all duration-500 group-hover:rotate-0 group-hover:scale-110 border border-[#eec643]/20 mb-5">
                <p className="text-[#011638] font-bold text-sm">
                  Featured
                </p>
                <p className="text-[#eec643] font-black text-2xl">
                  Scholar Research
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative justify-center">
            {/* Text Content */}
            <span className="header">
              ACADEMICS
            </span>

            {/* Decorative line */}
            <GradientLine start />

            {/* Stats Counter */}
            <div className="w-full cursor-default">
              <div className=" mt-10 flex flex-wrap justify-center lg:justify-start gap-6 mb-1">
                <div ref={surveySectionRef} className="text-center group">
                  <div className="text-5xl sm:font-black sm:font-oswald sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#eec643]/80 group-hover:scale-110 transition-transform duration-300">
                    {displaySurveyCount}
                  </div>
                  <div className="text-[#141414]/60 sm:font-bold text-sm mt-1 group-hover:text-[#011638] transition-colors px-6">
                    Research Surveys
                  </div>
                </div>

                <div ref={thesesSectionRef} className="text-center group">
                  <div className="text-5xl sm:font-black sm:font-oswald sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#eec643]/80 group-hover:scale-110 transition-transform duration-300">
                    {displayThesesCount}
                  </div>
                  <div className="text-[#141414]/60 sm:font-bold text-sm mt-1 group-hover:text-[#011638] transition-colors px-6">
                    Research Abstract Collection
                  </div>
                </div>
              </div>
            </div>

            <p className="box mt-8">
              Supporting research initiatives of scholars.
              <span className="block mt-2 font-bold text-[#011638]">
                Promoting academic growth and collaboration.
              </span>
            </p>

            {/* Buttons */}
            <div className="flex lg:flex-row flex-col justify-center lg:justify-start gap-6 mt-12">
              <Link
                href="/survey"
                onClick={() =>
                  sessionStorage.setItem(
                    "returnToHomeSection",
                    "academics-section",
                  )
                }
                className="btn-blue"
              >
                Take Survey→
              </Link>

              <Link
                href="/thesis"
                onClick={() =>
                  sessionStorage.setItem(
                    "returnToHomeSection",
                    "academics-section",
                  )
                }
                className="btn-blue"
              >
                View Research→
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};