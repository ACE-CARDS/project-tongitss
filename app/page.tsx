"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/layout/navbar";
import Popup from "@/components/features/landing_page/announcements/pop-up";
import Kidla from "@/components/ui/kidla/kidlaButton";
import KidlaDialogue from "@/components/ui/kidla/kidlaDialogue";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import GradualBlur from "@/components/ui/GradualBlur";
import NewsMedia from "@/components/features/landing_page/newsMedia";

const supabase = createClient();

export default function Home() {
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isDialogueShowing, setIsDialogueShowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsDialogueShowing(false);
  }, []);

  useEffect(() => {
    const seenPopup = sessionStorage.getItem("seenPopup");

    if (!seenPopup) {
      setIsModalShowing(true);
      sessionStorage.setItem("seenPopup", "true");
    }
  }, []);

  //attempt for counting animation (dyan muna sha, di naman nakaka-affect sa code i think (takot gaalwin code))
  function useCountUp(target, duration = 1000) {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      if (target === 0) return setCount(0);
      const increment = target / (duration / 16);
      const interval = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(interval);
    }, [target, duration]);

    return count;
  }

  //current acad year
  const getCurrentAcademicYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    //around oct siya since mostly september ang membership drive
    if (month >= 10) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const currentYear = new Date().getFullYear();
  const academicYears = Array.from({ length: 4 }, (_, i) => {
  const startYear =
    new Date().getMonth() + 1 >= 10
      ? currentYear - i
      : currentYear - 1 - i;

  return `AY ${startYear}-${startYear + 1}`;
});

  //Counts poexcz for events and members separate si province kasi wait lang iiyaq aq dyan
  const [eventCount, setEventCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [surveyCount, setSurveyCount] = useState(0);
  const [thesesCount, setThesesCount] = useState(0);
  const CURRENT_AY = `AY ${getCurrentAcademicYear()}`;
  const [selectedAY, setSelectedAY] = useState(CURRENT_AY); //here ichchange po yung current year thnx for province  section
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provinceMembers, setProvinceMembers] = useState(0);
  const FIXED_MEMBER_AY = CURRENT_AY; //here ichchange current year for member section

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: eventTotal } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("is_deleted", false);

      const { count: memberTotal } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true })
        .eq("acadyear", FIXED_MEMBER_AY);

      const { count: surveyTotal } = await supabase
        .from("survey")
        .select("*", { count: "exact", head: true })
        .eq("survey_status", "accepted");

      const { count: thesesTotal } = await supabase
        .from("thesis")
        .select("*", { count: "exact", head: true })
        .eq("thesis_status", "accepted");

      setEventCount(eventTotal || 0);
      setMemberCount(memberTotal || 0);
      setSurveyCount(surveyTotal || 0);
      setThesesCount(thesesTotal || 0);
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    setMemberDisplayCount(0);
    setHasMemberAnimated(false);
  }, []);

  useEffect(() => {
    const fetchProvinceMembers = async () => {
      if (!selectedProvince) return;

      const { count, error } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true })
        .eq("province", selectedProvince)
        .eq("acadyear", selectedAY);

      if (!error) {
        setProvinceMembers(count || 0);
      }
    };

    fetchProvinceMembers();
  }, [selectedProvince, selectedAY]);

  //awa nalang cguro (province count)
  const [provinceSchools, setProvinceSchools] = useState([]);

  useEffect(() => {
    const fetchProvinceData = async () => {
      let schools = [];

      if (selectedProvince) {
        const { data: provinceData } = await supabase
          .from("province")
          .select("id")
          .eq("prov_name", selectedProvince)
          .single();

        if (!provinceData) return;

        const { data: schoolData } = await supabase
          .from("school")
          .select("id, school_name")
          .eq("province", provinceData.id);

        schools = schoolData || [];
      } else {
        const { data: schoolData } = await supabase
          .from("school")
          .select("id, school_name");

        schools = schoolData || [];
      }

      const schoolsWithCounts = await Promise.all(
        schools.map(async (school) => {
          const { count } = await supabase
            .from("member")
            .select("*", { count: "exact", head: true })
            .eq("school", school.id)
            .eq("acadyear", selectedAY);

          return {
            id: school.id,
            name: school.school_name,
            memberCount: count || 0,
          };
        }),
      );

      const filteredSchools = schoolsWithCounts.filter(
        (school) => school.memberCount > 0,
      );

      //for no pulsings
      const totalMembers = filteredSchools.reduce(
        (acc, curr) => acc + curr.memberCount,
        0,
      );

      setProvinceMembers(totalMembers);
      setProvinceSchools(filteredSchools); //noo pulsings
    };

    fetchProvinceData();
  }, [selectedProvince, selectedAY]);

  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const { data, error } = await supabase
        .from("province")
        .select("prov_name")
        .order("prov_name", { ascending: true });

      if (!error && data) {
        setProvinces(data.map((p) => p.prov_name));
      }
    };
    fetchProvinces();
  }, []);

  //arrow up&down
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 50); // if near top, show arrow
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("error")) {
      router.push("/auth/login?error=" + query.get("error_description"));
    }
  }, []);

  //count animation for events
  const [displayCount, setDisplayCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef(null);
  const hasEventsAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (hasEventsAnimated.current) return;
        hasEventsAnimated.current = true;

        let start = 0;
        const target = eventCount;
        const duration = 500;
        const increment = target / (duration / 16);

        const interval = setInterval(() => {
          start += increment;

          if (start >= target) {
            setDisplayCount(target);
            clearInterval(interval);
          } else {
            setDisplayCount(Math.floor(start));
          }
        }, 16);
      },
      { threshold: 0.5 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [eventCount]);

  //count animation for thesis
  const [displayThesesCount, setDisplayThesesCount] = useState(0);
  const thesesSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        } else {
          setDisplayThesesCount(0);
        }
      },
      { threshold: 0.5 },
    );

    if (thesesSectionRef.current) observer.observe(thesesSectionRef.current);

    return () => observer.disconnect();
  }, [thesesCount]);

  //count animation for survey
  const [displaySurveyCount, setDisplaySurveyCount] = useState(0);
  const surveySectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        } else {
          setDisplaySurveyCount(0);
        }
      },
      { threshold: 0.5 },
    );

    if (surveySectionRef.current) observer.observe(surveySectionRef.current);

    return () => observer.disconnect();
  }, [surveyCount]);

  //button pataas hi

  const [showBackToHero, setShowBackToHero] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById("hero")?.offsetHeight || 0;

      if (window.scrollY > heroHeight - 50) {
        setShowBackToHero(true);
      } else {
        setShowBackToHero(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //count animation for members section
  const [memberDisplayCount, setMemberDisplayCount] = useState(0);
  const [hasMemberAnimated, setHasMemberAnimated] = useState(false);
  const memberSectionRef = useRef(null);
  const hasMembersAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        if (hasMembersAnimated.current) return;
        hasMembersAnimated.current = true;

        let start = 0;
        const target = memberCount;
        const duration = 500;
        const increment = target / (duration / 16);

        const interval = setInterval(() => {
          start += increment;

          if (start >= target) {
            setMemberDisplayCount(target);
            clearInterval(interval);
          } else {
            setMemberDisplayCount(Math.floor(start));
          }
        }, 16);
      },
      { threshold: 0.5 },
    );

    if (memberSectionRef.current) observer.observe(memberSectionRef.current);

    return () => observer.disconnect();
  }, [memberCount]);

  //province animation
  const [provinceDisplayCount, setProvinceDisplayCount] = useState(0);
  const provinceSectionRef = useRef(null);
  const [provinceAnimKey, setProvinceAnimKey] = useState(0);
  const [isOverHero, setIsOverHero] = useState(true);

  useEffect(() => {
    let start = 0;
  
    setProvinceDisplayCount(0);
  
    const end = provinceMembers;
    if (end === 0) return;
  
    const duration = 1000;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));
  
    const timer = setInterval(() => {
      start += step;
  
      if (start >= end) {
        setProvinceDisplayCount(end);
        clearInterval(timer);
      } else {
        setProvinceDisplayCount(start);
      }
    }, incrementTime);
  
    return () => clearInterval(timer);
  }, [provinceMembers]);

  useEffect(() => {
    setProvinceDisplayCount(0);
    setProvinceAnimKey((prev) => prev + 1);
  }, [selectedProvince, selectedAY]);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById("hero")?.offsetHeight || 0;

      setShowBackToHero(window.scrollY > heroHeight - 50);

      setIsOverHero(window.scrollY < heroHeight - 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //balikan for not pulsing circles sa map
  const getProvinceHasMembers = (name) => {
    if (selectedProvince === name) {
      return provinceMembers > 0;
    }
  
    const province = provinceSchools.find((s) => s.province === name);
    return province ? province.memberCount > 0 : true;
  };

  return (
    <>
      <div className="text-[#141414] min-h-screen flex flex-col overflow-hidden">
        {showBackToHero && (
          <button
            onClick={() => {
              document
                .getElementById("hero")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-yellow-200 border-2 border-yellow-500 fixed bottom-6 left-10 z-[10000] bg-white/80 backdrop-blur-md hover:bg-white shadow-xl border border-white/40 px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            {/* //https://heroicons.com/outline */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5 text-[#011638]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
            <span className="text-sm font-semibold text-[#011638] hidden sm:block ">
              Back to Top
            </span>
          </button>
        )}

        <NavBar isOverHero={isOverHero} />
        <div className="relative z-[10003]">
          <Popup
            isShowing={isModalShowing}
            onClose={() => setIsModalShowing(false)}
          />

          {/*Kidla*/}

          <KidlaDialogue
            isShowing={isDialogueShowing}
            onClose={() => setIsDialogueShowing(false)}
            onAnnouncements={() => {
              setIsDialogueShowing(false);
              setIsModalShowing(true);
            }}
            onRedirectMemApp={() => {
              setIsDialogueShowing(false);
              router.push("/member-appli");
            }}
          />
          <Kidla
            onClick={() => setIsDialogueShowing((prev) => !prev)}
            isDialogueShowing={isDialogueShowing}
          />
        </div>

        <main className="relative">
          <div className="pointer-events-none fixed bottom-0 left-0 w-full z-[9999] [transform:translateZ(0)]">
            <GradualBlur //huhu eto lang b magiging succesful ko frm react
              position="bottom"
              height="3rem"
              strength={2.5}
              divCount={6}
              target="page"
              animated={true}
              duration="0.4s"
              opacity={0.85}
              curve="ease-out"
            />
          </div>
          <div
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] bounce text-white text-6xl pointer-events-none transition-opacity duration-500 ${isAtTop ? "opacity-100" : "opacity-0"} `}
          >
            ↓
          </div>

          {/* HERO SECTION */}
          <section
            id="hero"
            className="
            relative min-h-[100dvh] flex items-center overflow-hidden
            px-[clamp(1.25rem,4vw,5rem)]
            py-[clamp(2rem,6vh,4rem)]
          "
          >
            {/* background */}
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: "url('/assets/logos/hero-bg.png')" }}
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/90" />

            {/* glow blobs (responsive scaling) */}
            <div className="absolute top-[-25%] left-[-20%] w-[clamp(300px,40vw,600px)] h-[clamp(300px,40vw,600px)] bg-[#eec643]/20 rounded-full blur-[160px]" />
            <div className="absolute bottom-[-25%] right-[-20%] w-[clamp(300px,40vw,600px)] h-[clamp(300px,40vw,600px)] bg-[#0d21a1]/20 rounded-full blur-[160px]" />

            {/* CONTENT WRAPPER */}
            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* LEFT */}
              <div className="flex flex-col gap-6 text-left">
                <div>
                  <p className="text-white/60 tracking-widest uppercase text-xs sm:text-sm">
                    DOST-SEI Scholars • CAR
                  </p>

                  <h1
                    className="text-white font-black leading-[0.85]
                  text-[clamp(3rem,6vw,6rem)]"
                  >
                    ACE <span className="text-[#eec643]">CARDS</span>
                  </h1>

                  <h1
                    className="hidden sm:block absolute -z-10 font-black text-transparent select-none opacity-20
                  text-[clamp(5rem,10vw,14rem)]"
                    style={{
                      WebkitTextStroke: "2px rgba(238, 198, 67, 0.25)",
                    }}
                  >
                    ACE CARDS
                  </h1>

                  <div className="w-20 h-[3px] mt-4 bg-gradient-to-r from-[#eec643] to-[#0d21a1]" />
                </div>

                <p className="text-white/75 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
                  A unified organization of DOST-SEI scholars in the Cordillera
                  Administrative Region that aims to develop scholars in
                  excellence, leadership, and service through science,
                  innovation, and volunteerism.
                </p>

                {/* CORE VALUES */}
                <div className="flex flex-col gap-2">
                  <p className="text-white/60 tracking-widest uppercase text-xs sm:text-sm">
                    3 CORE VALUES of a DOST-SEI Scholar
                  </p>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {[
                      "Professional Excellence",
                      "Social Responsibility",
                      "Servant Leadership",
                    ].map((val) => (
                      <span
                        key={val}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full
                      bg-white/5 border border-white/10 text-white/80 backdrop-blur-md"
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] order-first lg:order-last">
                <div className="absolute w-[clamp(250px,40vw,500px)] h-[clamp(250px,40vw,500px)] bg-[#eec643]/25 blur-[140px] rounded-full" />

                <div className="relative z-10 group flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#eec643]/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition" />

                  <img
                    src="/assets/logos/ACE CARDS logo.png"
                    alt="Ace Cards Logo"
                    className="
                    w-[clamp(220px,30vw,420px)]
                    rounded-3xl shadow-5xl
                    transition-all duration-700 ease-out
                    hover:scale-105 hover:-translate-y-1
                  "
                  />
                </div>
              </div>
            </div>
          </section>

          <NewsMedia />

          {/* EVENTS SECTION */}
          <section
            id="events-section"
            ref={sectionRef}
            className="pt-8 pb-0 xl:py-8 px-6 xl:px-24 relative w-full mx-auto max-w-[1920px] bg-gradient-to-br from-[#0a1a3a] to-[#011638] overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(#eec643 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            <div className="absolute top-0 left-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />

            <div className="w-full mx-auto mb-10 max-w-[1920px] relative z-10">
              <div className="text-center mb-20 flex flex-col items-center">
                <h1 className="text-9xl sm:text-8xl xl:text-[200px] font-black text-white drop-shadow-2xl leading-none">
                  {displayCount}
                </h1>
                <h3 className="text-xl sm:text-6xl xl:text-7xl font-bold text-white/90 mt-4">
                  Total
                </h3>
                <h2 className="text-4xl sm:text-6xl xl:text-9xl font-bold text-white/90 mt-1">
                  Events
                </h2>
                <p className="text-white/60 tracking-widest uppercase text-sm leading-tight mt-3">
                  since establishment
                </p>

                <Link
                  href="/events"
                  onClick={() =>
                    sessionStorage.setItem(
                      "returnToHomeSection",
                      "events-section",
                    )
                  }
                  className="group inline-block px-10 py-4 rounded-3xl border-2 border-[#eec643] hover:bg-[#eec643] text-[#011638] font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform mt-8 bg-[#eec643]/60"
                >
                  View Events →
                </Link>
              </div>
            </div>

            {/* Mobile */}
            <div className="[@media(min-width:1100px)]:hidden relative min-h-[45vh] flex items-start justify-center overflow-visible -mt-3 item-center pb-16 sm:pb-20">
              {/* UP Baguio Fair */}
              <div className="absolute top-0 rotate-[-10deg] translate-x-[-80px] z-10">
                <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
                  <img
                    src="/assets/logos/upbfair.jpg"
                    alt="UP Baguio Fair"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-md rounded px-3 py-2">
                      <h3 className="text-white text-xs font-semibold">
                        UP Baguio Fair
                      </h3>
                      <p className="text-white/80 text-[10px]">2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UGE */}
              <div className="absolute top-[-10px] rotate-[-4deg] translate-x-[-25px] z-20">
                <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
                  <img
                    src="/assets/logos/uge26.jpeg"
                    alt="UGE 26"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-md rounded px-3 py-2">
                      <h3 className="text-white text-xs font-semibold">
                        Undergraduate Examination
                      </h3>
                      <p className="text-white/80 text-[10px]">2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inadalan */}
              <div className="absolute top-[-10px] rotate-[6deg] translate-x-[30px] z-30">
                <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
                  <img
                    src="/assets/logos/inadalan.jpg"
                    alt="Inadalan"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-md rounded px-3 py-2">
                      <h3 className="text-white text-xs font-semibold">
                        Inadalan
                      </h3>
                      <p className="text-white/80 text-[10px]">2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Donation */}
              <div className="absolute top-0 rotate-[12deg] translate-x-[85px] z-40">
                <div className="relative w-[42vw] max-w-[260px] aspect-[2/3]">
                  <img
                    src="/assets/logos/blooddonation.jpg"
                    alt="Blood Donation Drive"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl ring-2 ring-white/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-3xl" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/60 backdrop-blur-md rounded px-3 py-2">
                      <h3 className="text-white text-xs font-semibold">
                        Blood Donation Drive
                      </h3>
                      <p className="text-white/80 text-[10px]">2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden [@media(min-width:1100px)]:block">
              {/* UP Baguio Fair */}
              <div className="absolute top-20 left-24 rotate-12 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
                <div className="relative">
                  <img
                    src="/assets/logos/upbfair.jpg"
                    className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-black/60 backdrop-blur-md rounded px-4 py-2">
                      <h3 className="text-white font-bold text-sm">
                        UP Baguio Fair
                      </h3>
                      <p className="text-white/80 text-xs">2025</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* UGE 26 */}
              <div className="absolute top-20 right-24 -rotate-6 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
                <div className="relative">
                  <img
                    src="/assets/logos/uge26.jpeg"
                    className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-black/60 backdrop-blur-md rounded px-4 py-2">
                      <h3 className="text-white font-bold text-sm">
                        Undergraduate Examination
                      </h3>
                      <p className="text-white/80 text-xs">2026</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inadalan */}
              <div className="absolute bottom-20 left-45 rotate-3 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
                <div className="relative">
                  <img
                    src="/assets/logos/inadalan.jpg"
                    className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-black/60 backdrop-blur-md rounded px-4 py-2">
                      <h3 className="text-white font-bold text-sm">Inadalan</h3>
                      <p className="text-white/80 text-xs">2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blood Donation */}
              <div className="absolute bottom-20 right-45 -rotate-12 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
                <div className="relative">
                  <img
                    src="/assets/logos/blooddonation.jpg"
                    className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="bg-black/60 backdrop-blur-md rounded px-4 py-2">
                      <h3 className="text-white font-bold text-sm">
                        Blood Donation Drive
                      </h3>
                      <p className="text-white/80 text-xs">2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MEMBERS SECTION */}
          <section
            id="members-section"
            ref={memberSectionRef}
            className="py-8 px-6 lg:px-24 relative w-full mx-auto max-w-[1920px] bg-[#fbfaf8]"
            style={{
              backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              backgroundAttachment: "fixed",
            }}
          >
            <div className="w-full mx-auto mb-10 max-w-[1920px]">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                {/* img */}
                <div className="flex-1 flex justify-center lg:justify-end order-2 lg:order-1">
                  <div className="relative">
                    <img
                      src="/assets/logos/ga.jpg"
                      alt="Members"
                      className="w-full max-w-lg lg:max-w-3xl rounded-3xl object-cover shadow-2xl ring-8 ring-white/70 hover:scale-105 transition-all duration-700 hover:shadow-4xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#011638]/20 to-transparent rounded-3xl"></div>
                  </div>
                </div>

                {/* txt */}
                <div className="flex-1 text-center lg:text-left max-w-lg order-1 lg:order-2">
                  <h1 className="text-9xl lg:text-[180px] font-black text-[#011638] tracking-tight drop-shadow-2xl leading-none">
                    {memberDisplayCount}
                  </h1>
                  <h2 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-[#011638] to-[#0d21a1] bg-clip-text text-transparent mt-4 drop-shadow-lg">
                    Current Members
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-8 mx-auto lg:mx-0 rounded-full shadow-lg"></div>

                  <p className="mt-8 text-[#141414]/80 text-lg leading-relaxed backdrop-blur-sm bg-white/70 px-8 py-6 rounded-2xl shadow-xl">
                    A growing network of DOST CAR scholars committed to academic
                    excellence and servant leadership.
                  </p>

                  <div className="flex justify-center lg:justify-start gap-6 mt-12">
                    <Link
                      href="/committee"
                      onClick={() =>
                        sessionStorage.setItem(
                          "returnToHomeSection",
                          "members-section",
                        )
                      }
                      className="group inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-3xl border-2 border-[#011638] font-bold text-base sm:text-lg whitespace-nowrap bg-[#011638]/75 hover:bg-[#011638] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                    >
                      Committees →
                    </Link>

                    <Link
                      href="/executives"
                      onClick={() =>
                        sessionStorage.setItem(
                          "returnToHomeSection",
                          "members-section",
                        )
                      }
                      className="group inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-3xl border-2 border-[#011638] font-bold text-base sm:text-lg whitespace-nowrap bg-[#011638]/75 hover:bg-[#011638] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                    >
                      Executives →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PROVINCE SECTION */}
          <section
            key={provinceAnimKey}
            ref={provinceSectionRef}
            className="pt-8 pb-10 sm:pt-12 sm:pb-12 xl:pt-16 xl:pb-8 px-4 sm:px-6 xl:px-24 relative w-full mx-auto max-w-[1920px] bg-gradient-to-br from-[#0a1a3a] to-[#011638] relative overflow-hidden"
          >
            {/* Background */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(#eec643 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Decorative blur elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />

            <div className="w-full mx-auto max-w-[1920px] relative z-10">
              <div className="flex flex-col xl:flex-row items-start lg:items-start justify-between gap-8 lg:gap-16">
                {/* LEFT COLUMN */}
                <div className="flex-1 w-full text-center xl:text-left">
                  {/* Province label */}
                  <div className="inline-block lg:inline-block">
                    <p className="text-sm sm:text-base tracking-[0.3em] uppercase text-[#eec643] font-semibold mb-2">
                      {selectedProvince ? "Province" : "Region"}
                    </p>
                  </div>

                  {/* Province name */}
                  <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-none mb-6">
                    {selectedProvince
                      ? selectedProvince.toUpperCase()
                      : "CORDILLERA ADMINISTRATIVE REGION"}
                  </h1>

                  {/* Total count and school list */}
                  <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6 xl:gap-12">
                    {/* mobile dropdown */}
                    <div className="xl:hidden w-full mb-4 flex gap-3">
                      {/* Province Filter */}
                      <select
                        className="flex-1 px-3 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold shadow-lg focus:ring-2 focus:ring-[#eec643] focus:border-transparent transition-all duration-200 cursor-pointer"
                        value={selectedProvince || ""}
                        onChange={(e) =>
                          setSelectedProvince(e.target.value || null)
                        }
                        style={{ colorScheme: "dark" }}
                      >
                        <option value="" className="bg-[#0a1a3a] text-white">
                          All Provinces
                        </option>
                        {provinces.map((prov) => (
                          <option
                            key={prov}
                            value={prov}
                            className="bg-[#0a1a3a] text-white"
                          >
                            {prov}
                          </option>
                        ))}
                      </select>

                      {/* AY Filter */}
                      <select
                        className="flex-1 px-3 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold shadow-lg focus:ring-2 focus:ring-[#eec643] focus:border-transparent transition-all duration-200 cursor-pointer"
                        value={selectedAY}
                        onChange={(e) => setSelectedAY(e.target.value)}
                        style={{ colorScheme: "dark" }}
                      >
                        {academicYears.map((year) => (
                        <option
                          key={year}
                          value={year}
                          className="text-[#011638]"
                        >
                          {year}
                        </option>
                      ))}
                      </select>
                    </div>

                    {/* Count Display */}
                    <div className="text-center xl:text-left w-[180px]">
                      <h1 className="text-7xl sm:text-8xl xl:text-9xl font-black text-white tracking-tight tabular-nums scale-y-110 [text-shadow:0_1px_0_rgba(0,0,0,0.8),0_2px_0_rgba(0,0,0,0.6),0_3px_6px_rgba(0,0,0,0.8)]">
                        {" "}
                        {/* attempt sa bolder count kasi not working ang font-bold pero huhu wala pa ding difference */}
                        {provinceDisplayCount}
                      </h1>
                      <p className="text-[#eec643] font-semibold mt-2">
                        Total Members
                      </p>
                      <p className="text-white/60 tracking-widest uppercase text-sm leading-tight mt-1">
                        {selectedAY}
                      </p>
                    </div>

                    {/* School List*/}
                    <div className="mb-0 text-center xl:text-left block xl:hidden">
                      <p className="text-white/60 text-xs tracking-widest uppercase">
                        {selectedProvince
                          ? `Showing all Schools in ${selectedProvince}`
                          : "Showing all schools across CAR"}
                      </p>
                    </div>

                    <div className="xl:w-[420px] h-[400px] flex-shrink-0">
                      <div className="space-y-3 max-h-[360px] sm:max-h-[435px] overflow-y-auto overflow-x-visible px-2 py-2 pr-2 custom-scrollbar-white-nobg">
                        {provinceSchools.length > 0 ? (
                          provinceSchools.map((school) => (
                            <div
                              key={school.id}
                              className="justify-between tart group border border-white/10 rounded-2xl py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                            >
                              <div className="flex-1 pr-4 text-left">
                                <span className="font-semibold text-base sm:text-lg text-white group-hover:text-[#eec643] transition-colors leading-snug break-words whitespace-normal">
                                  {school.name}
                                </span>
                              </div>

                              <span className="text-lg sm:text-xl font-bold text-[#eec643] shrink-0">
                                {school.memberCount}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-white/60">
                            {selectedProvince
                              ? "No members found in this province"
                              : "Select a province to view schools"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="hidden xl:block relative z-10 flex-1 mt-10 xl:mt-0">
                  <div className="relative group">
                    {/* Years */}
                    <div className="absolute top-15 right-4 z-50 ">
                      <select
                        value={selectedAY}
                        onChange={(e) => setSelectedAY(e.target.value)}
                        className="border border-white/20 rounded-xl px-4 py-2 bg-white/90 backdrop-blur-md font-semibold text-black text-sm shadow-lg focus:ring-2 focus:ring-[#eec643] focus:border-transparent transition-all duration-200 cursor-pointer hover:scale-105 transition-all duration-200 z-50"
                      >
                        {academicYears.map((year) => (
                          <option
                            key={year}
                            value={year}
                            className="bg-[#0a1a3a] text-white"
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Map Container */}
                    <div
                      className="relative w-full mx-auto xl:mx-0
                                  aspect-[4/5] 
                                  sm:aspect-[4/5]
                                  md:aspect-[4/5]
                                  xl:aspect-[4/5]
                                  xl:aspect-[4/5]
                                  min-h-[320px]
                                  sm:min-h-[380px]
                                  md:min-h-[450px]
                                  xl:min-h-[520px]"
                    >
                      <img
                        src="/assets/logos/webcarmap.png"
                        alt="CAR map"
                        className="absolute inset-0 w-full h-full object-contain"
                      />

                      {/* Reset Button */}
                      {selectedProvince && (
                        <button
                          onClick={() => {
                            setSelectedProvince(null);
                            setProvinceMembers(0);
                            setProvinceSchools([]);
                          }}
                          className="absolute bottom-30 right-10 group flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white shadow-lg pl-3 pr-2 py-2 rounded-full border border-white/50 hover:scale-105 transition-all duration-200 z-50 cursor-pointer"
                        >
                          {/* https://heroicons.com/outline */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="size-6"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                              clip-rule="evenodd"
                            />
                          </svg>
                          <span className="max-w-0 overflow-hidden whitespace-nowrap text-[#011638] font-semibold text-sm group-hover:max-w-xs transition-all duration-300 ease-in-out">
                            Reset
                          </span>
                        </button>
                      )}
                      {/* Map Markers */}
                      {/* Abra */}
                      <button
                        onClick={() => setSelectedProvince("Abra")}
                        className={`absolute left-[38%] top-[43%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 bg-[#eec643] rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === "Abra" ? "ring-[#eec643]/50" : ""}`}
                          />
                          <div className="absolute inset-0 w-5 h-5 bg-[#eec643] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                          Abra
                        </span>
                      </button>

                      {/* Apayao */}
                      <button
                        onClick={() => setSelectedProvince("Apayao")}
                        className={`absolute left-[52%] top-[27%] group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 bg-[#eec643] rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === "Apayao" ? "ring-[#eec643]/50" : ""}`}
                          />
                          <div className="absolute inset-0 w-5 h-5 bg-[#eec643] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                          Apayao
                        </span>
                      </button>

                      {/* Kalinga */}
                      <button
                        onClick={() => setSelectedProvince("Kalinga")}
                        className={`absolute left-[58%] top-[46%] group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 bg-[#eec643] rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === "Kalinga" ? "ring-[#eec643]/50" : ""}`}
                          />
                          <div className="absolute inset-0 w-5 h-5 bg-[#eec643] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                          Kalinga
                        </span>
                      </button>

                      {/* Benguet */}
                      <button
                        onClick={() => setSelectedProvince("Benguet")}
                        className={`absolute left-[31%] top-[72%] group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 bg-[#eec643] rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === "Benguet" ? "ring-[#eec643]/50" : ""}`}
                          />
                          <div className="absolute inset-0 w-5 h-5 bg-[#eec643] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                          Benguet
                        </span>
                      </button>

                      {/* Ifugao */}
                      <button
                        onClick={() => setSelectedProvince("Ifugao")}
                        className={`absolute left-[50%] top-[63%] group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 bg-[#eec643] rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === "Ifugao" ? "ring-[#eec643]/50" : ""}`}
                          />
                          <div className="absolute inset-0 w-5 h-5 bg-[#eec643] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                          Ifugao
                        </span>
                      </button>

                      {/* Mountain Province */}
                      <button
                        onClick={() => setSelectedProvince("Mountain Province")}
                        className={`absolute left-[53%] top-[56%] group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 bg-[#eec643] rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === "Mountain Province" ? "ring-[#eec643]/50" : ""}`}
                          />
                          <div className="absolute inset-0 w-5 h-5 bg-[#eec643] rounded-full animate-ping opacity-75" />
                        </div>
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                          Mountain Province
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ACADEMICS SECTION */}
          <section
            id="academics-section"
            className="py-8 sm:py-12 lg:py-16 px-[clamp(1rem,4vw,6rem)] relative w-full mx-auto max-w-[1920px] bg-[#fbfaf8] overflow-hidden"
            style={{
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
              backgroundAttachment: "fixed",
            }}
          >
            {/* Decorative blurs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0d21a1]/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="w-full mx-auto max-w-[1920px] relative z-10">
              <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-12 lg:gap-20">
                {/* Image */}
                <div className="flex-1 flex justify-center lg:justify-end perspective-1000">
                  <div className="relative group">
                    {/* Glow effect behind img */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#eec643]/20 to-[#0d21a1]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700" />

                    {/* Image w/ 3D hover effect */}
                    <div className="rounded-3xl relative transform transition-all duration-700 group-hover:rotate-y-6 group-hover:shadow-2xl">
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

                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left relative">
                  {/* Text Content */}
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-[#011638] to-[#0d21a1] bg-clip-text text-transparent leading-tight drop-shadow-2xl">
                    ACADEMICS
                  </h2>

                  {/* Decorative line */}
                  <div className="w-32 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-6 rounded-full shadow-lg" />

                  {/* Stats Counter */}
                  <div className="w-full">
                    <div className=" mt-10 flex flex-wrap justify-center lg:justify-start gap-6 mb-1">
                      <div
                        ref={surveySectionRef}
                        className="text-center group"
                      >
                        <div className="text-5xl sm:font-black sm:font-oswald sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#eec643]/80 group-hover:scale-110 transition-transform duration-300">
                          {displaySurveyCount}
                        </div>
                        <div className="text-[#141414]/60 sm:font-bold text-sm mt-1 group-hover:text-[#011638] transition-colors px-6">
                          Research Surveys
                        </div>
                      </div>

                      <div
                        ref={thesesSectionRef}
                        className="text-center group"
                      >
                        <div className="text-5xl sm:font-black sm:font-oswald sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#eec643]/80 group-hover:scale-110 transition-transform duration-300">
                          {displayThesesCount}
                        </div>
                        <div className="text-[#141414]/60 sm:font-bold text-sm mt-1 group-hover:text-[#011638] transition-colors px-6">
                          Research Thesis
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-8 text-[#141414]/80 text-base lg:text-lg leading-relaxed backdrop-blur-sm bg-white/70 px-8 py-6 rounded-2xl shadow-xl border border-[#eec643]/20 hover:shadow-2xl transition-all duration-500 text-center lg:text-left">
                    Supporting research and thesis initiatives of members.
                    <span className="block mt-2 font-bold text-[#011638]">
                      Promoting academic growth and collaboration.
                    </span>
                  </p>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-md">
                    <Link
                      href="/survey"
                      onClick={() =>
                        sessionStorage.setItem(
                          "returnToHomeSection",
                          "academics-section",
                        )
                      }
                      className="group inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-3xl border-2 border-[#011638] font-bold text-base sm:text-lg whitespace-nowrap bg-[#011638]/75 hover:bg-[#011638] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                    >
                      Take Survey →
                    </Link>

                    <Link
                      href="/thesis"
                      onClick={() =>
                        sessionStorage.setItem(
                          "returnToHomeSection",
                          "academics-section",
                        )
                      }
                      className="group inline-block px-6 sm:px-10 py-3 sm:py-4 rounded-3xl border-2 border-[#011638] font-bold text-base sm:text-lg whitespace-nowrap bg-[#011638]/75 hover:bg-[#011638] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                    >
                      View Thesis →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Animations */}
            <style jsx>{`
              @keyframes pulse {
                0%,
                100% {
                  opacity: 0.05;
                }
                50% {
                  opacity: 0.15;
                }
              }
              @keyframes bounce-slow {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              @keyframes gradient {
                0% {
                  background-position: 0% 50%;
                }
                50% {
                  background-position: 100% 50%;
                }
                100% {
                  background-position: 0% 50%;
                }
              }
              .animate-gradient {
                background-size: 200% auto;
                animation: gradient 3s linear infinite;
              }
              .animate-bounce-slow {
                animation: bounce-slow 2s ease-in-out infinite;
              }
              .perspective-1000 {
                perspective: 1000px;
              }
              .rotate-y-12 {
                transform: rotateY(12deg);
              }
            `}</style>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
}
