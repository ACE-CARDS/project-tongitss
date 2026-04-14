"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar";
import Popup from "@/components/pop-up";
import Kidla from "@/components/kidlaButton";
import KidlaDialogue from "@/components/kidlaDialogue";
import Footer from "@/components/footer";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GradualBlur from "@/components/GradualBlur";
import NewsMedia from "@/components/newsMedia";

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

  //Counts poexcz for events and members separate si province kasi wait lang iiyaq aq dyan
  const [eventCount, setEventCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [selectedAY, setSelectedAY] = useState("AY 2025-2026"); //here ichchange po yung current year thnx
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provinceMembers, setProvinceMembers] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: eventTotal } = await supabase
        .from("event")
        .select("*", { count: "exact", head: true });

      const { count: memberTotal } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true })
        .eq("acadyear", selectedAY);

      setEventCount(eventTotal || 0);
      setMemberCount(memberTotal || 0);
    };

    fetchCounts();
  }, [selectedAY]);

  useEffect(() => {
    setMemberDisplayCount(0);
    setHasMemberAnimated(false);
  }, [selectedAY]);

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

      const totalMembers = schoolsWithCounts.reduce(
        (acc, curr) => acc + curr.memberCount,
        0,
      );

      setProvinceMembers(totalMembers);
      setProvinceSchools(schoolsWithCounts);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        } else {
          setDisplayCount(0); // reset pag umalis
        }
      },
      { threshold: 0.5 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [eventCount]);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        } else {
          setMemberDisplayCount(0); // reset pag umalis
        }
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
    const el = provinceSectionRef.current;
    if (!el) return;

    let interval;
    let hasAnimated = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (hasAnimated) return;

        hasAnimated = true;

        const target = provinceMembers || 0;

        setProvinceDisplayCount(0);

        let current = 0;
        const step = target / 30;

        interval = setInterval(() => {
          current += step;

          if (current >= target) {
            setProvinceDisplayCount(target);
            clearInterval(interval);
          } else {
            setProvinceDisplayCount(Math.floor(current));
          }
        }, 16);
      },
      { threshold: 0.4 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [provinceMembers, selectedProvince]);

  useEffect(() => {
    setProvinceDisplayCount(0);
    setProvinceAnimKey((prev) => prev + 1);
  }, [selectedProvince, selectedAY]);

  useEffect(() => {
  const handleScroll = () => {
    const heroHeight = document.getElementById("hero")?.offsetHeight || 0;

    setShowBackToHero(window.scrollY > heroHeight - 50);

    // 👇 ADD THIS
    setIsOverHero(window.scrollY < heroHeight - 80);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
  return (
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen flex flex-col">
      {showBackToHero && (
        <button
          onClick={() => {
            document
              .getElementById("hero")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          className="fixed bottom-6 left-10 z-[10000] bg-white/80 backdrop-blur-md hover:bg-white shadow-xl border border-white/40 px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
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
          <span className="text-sm font-semibold text-[#011638] hidden sm:block">
            Back to Top
          </span>
        </button>
      )}

      <NavBar isOverHero={isOverHero} />
      <div className="relative z-[10000]">
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
          className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[10001] bounce text-white text-6xl pointer-events-none transition-opacity duration-500 ${isAtTop ? "opacity-100" : "opacity-0"} `}
        >
          ↓
        </div>

        {/* HERO SECTION */}
        <section
          id="hero"
          className="relative min-h-[100vh] flex items-center justify-center overflow-hidden px-6 lg:px-20"
        >
          {/* background */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: "url('/assets/logos/hero-bg.png')" }}
          />

          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

          {/* glow blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#eec643]/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#0d21a1]/30 rounded-full blur-[120px]" />

          {/* CONTENT */}
          <div className="relative z-10 max-w-7xl mx-auto text-center flex flex-col items-center gap-8">
            {/* TITLE LAYER WRAPPER */}
            <div className="translate-y-6  relative flex items-center justify-center">
              {/* BOTTOM SOLID TEXT (ONE LINE) */}
              <h1
                className="absolute text-[90px] sm:text-[130px] lg:text-[200px] font-black tracking-tight text-white select-none leading-none whitespace-nowrap translate-y-39"
                style={{
                  color: "white",
                  WebkitTextStroke: "3px rgba(238, 198, 67, 1)",
                }}
              >
                ACE CARDS
              </h1>

              {/* LOGO */}
              <div className="relative z-20 group bg-white/0">
                <img
                  src="/assets/logos/ACE CARDS logo.png"
                  alt="Ace Cards Logo"
                  className="w-52 lg:w-72 rounded-3xl shadow-5xl transition-all duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 rounded-3xl bg-[#eec643]/25 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
              </div>

              {/* TOP OUTLINE TEXT (ONE LINE) */}
              <h1
                className="absolute text-[90px] sm:text-[130px] lg:text-[200px] font-black tracking-tight pointer-events-none select-none leading-none whitespace-nowrap z-[20] translate-y-39"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "3px rgba(238, 198, 67, 0.5)",
                }}
              >
                ACE CARDS
              </h1>
            </div>

            {/* SUBTEXT */}
            <p className="max-w-2xl text-white/80 text-lg lg:text-xl leading-relaxed bg-[#011638]/0 px-6 py-4 rounded-2xl shadow-xl border border-white/0 z-[1001] mt-27">
              A unified organization of DOST-SEI scholars in the Cordillera
              Administrative Region that aims to develop scholars in excellence,
              leadership, and service through science, innovation, and
              volunteerism.
            </p>

            {/* CORE VALUES */}
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Professional Excellence",
                "Social Responsibility",
                "Servant Leadership",
              ].map((val) => (
                <span
                  key={val}
                  className="px-4 py-2 text-sm bg-[#011638]/10 backdrop-blur-md text-white rounded-xl border border-white/20 hover:bg-white/20 transition"
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        </section>

        <NewsMedia />

        {/* EVENTS SECTION */}
        <section
          id="events-section"
          ref={sectionRef}
          className="py-8 px-6 lg:px-24 relative w-full mx-auto max-w-[1920px] bg-[#fbfaf8]"
          style={{
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", //dotted
            backgroundSize: "20px 20px",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="w-full mx-auto mb-10 max-w-[1920px] relative">
            <div className="text-center mb-20 relative z-10 flex flex-col items-center">
              <h1 className="text-7xl sm:text-8xl lg:text-[200px] font-black text-[#011638] drop-shadow-2xl leading-none">
                {displayCount}
              </h1>
              <h3 className="text-xl sm:text-6xl lg:text-7xl font-bold text-[#011638]/90 mt-4 drop-shadow-xl">
                Total
              </h3>
              <h2 className="text-4xl sm:text-6xl lg:text-9xl font-bold text-[#011638]/90 mt-1 drop-shadow-xl">
                Events
              </h2>
              <Link
                href="/events"
                onClick={() =>
                  sessionStorage.setItem(
                    "returnToHomeSection",
                    "events-section",
                  )
                }
                className="group inline-block px-10 py-4 rounded-3xl border-2 border-[#011638] text-[#011638] font-bold text-lg hover:bg-[#011638] hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform mt-8"
              >
                View Events →
              </Link>
            </div>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-2 gap-6 lg:hidden">
            <img
              src="/assets/logos/upbfair.jpg"
              alt="event 1"
              className="w-full h-72 object-cover rounded-3xl shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-500 ring-2 ring-white/50"
            />
            <img
              src="/assets/logos/uge26.jpeg"
              alt="event 2"
              className="w-full h-72 object-cover rounded-3xl shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-500 ring-2 ring-white/50"
            />
            <img
              src="/assets/logos/inadalan.jpg"
              alt="event 3"
              className="w-full h-72 object-cover rounded-3xl shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-500 ring-2 ring-white/50"
            />
            <img
              src="/assets/logos/blooddonation.jpg"
              alt="event 4"
              className="w-full h-72 object-cover rounded-3xl shadow-2xl hover:scale-105 hover:shadow-3xl transition-all duration-500 ring-2 ring-white/50"
            />
          </div>

          {/* Desktop */}
          <div className="hidden lg:block">
            <div className="absolute top-20 left-24 rotate-12 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
              <img
                src="/assets/logos/upbfair.jpg"
                className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl"
              />
            </div>
            <div className="absolute top-20 right-24 -rotate-6 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
              <img
                src="/assets/logos/uge26.jpeg"
                className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl"
              />
            </div>
            <div className="absolute bottom-20 left-45 rotate-3 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
              <img
                src="/assets/logos/inadalan.jpg"
                className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl"
              />
            </div>
            <div className="absolute bottom-20 right-45 -rotate-15 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
              <img
                src="/assets/logos/blooddonation.jpg"
                className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl"
              />
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
              <div className="flex-1 flex justify-center lg:justify-end">
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
              <div className="flex-1 text-center lg:text-left max-w-lg">
                <h1 className="text-8xl lg:text-[180px] font-black text-[#011638] tracking-tight drop-shadow-2xl leading-none">
                  {memberDisplayCount}
                </h1>
                <h2 className="text-4xl lg:text-6xl font-bold text-[#141414]/90 mt-4 drop-shadow-lg">
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
                    className="group inline-block px-10 py-4 rounded-3xl border-2 border-[#011638] text-[#011638] font-bold text-lg hover:bg-[#011638] hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
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
                    className="group inline-block px-10 py-4 rounded-3xl border-2 border-[#011638] text-[#011638] font-bold text-lg hover:bg-[#011638] hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
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
          className="py-4 sm:py-8 px-4 sm:px-6 lg:px-24 relative w-full mx-auto max-w-[1920px] bg-[#fbfaf8] relative"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="w-full mx-auto mb-10 max-w-[1920px] relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-start justify-between gap-8 lg:gap-16">
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex items-center justify-between mb-4 sm:mb-8 bg-white/50 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md">
                  <select
                    value={selectedAY}
                    onChange={(e) => setSelectedAY(e.target.value)}
                    className="border-2 border-gray-200/50 rounded-2xl px-6 py-3 bg-white/80 font-semibold text-[#011638] shadow-md focus:ring-4 focus:ring-[#eec643]/30 focus:border-[#eec643] transition-all duration-200"
                  >
                    <option value="AY 2025-2026">AY 2025-2026</option>
                    <option value="AY 2024-2025">AY 2024-2025</option>
                    <option value="AY 2023-2024">AY 2023-2024</option>
                    <option value="AY 2022-2023">AY 2022-2023</option>
                  </select>
                </div>

                {/* Province label (smaller, secondary) */}
                <p className="text-lg sm:text-xl tracking-[0.3em] uppercase text-gray-500 font-semibold mb-2">
                  {selectedProvince ? "Province" : "Region"}
                </p>

                {/* Province name (still visible but not dominant) */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#011638]/80 leading-none mb-6">
                  {selectedProvince ? selectedProvince.toUpperCase() : "CAR"}
                </h1>

                {/* total and uni list */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12">
                  {/* Mobile dropdown */}
                  <div className="lg:hidden mb-6">
                    <select
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200/50 bg-white/80 font-semibold text-[#011638] shadow-md focus:ring-4 focus:ring-[#eec643]/30 focus:border-[#eec643] transition-all duration-200"
                      value={selectedProvince || ""}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                      <option value="">Select a Province</option>
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h2 className="text-6xl sm:text-7xl lg:text-9xl font-black text-[#011638] flex-shrink-0 drop-shadow-2xl">
                    {provinceDisplayCount}
                  </h2>

                  {/* uni list */}
                  <div className="space-y-4 w-full max-w-lg max-h-[250px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
                    {provinceSchools.length > 0 ? (
                      provinceSchools.map((school) => (
                        <div
                          key={school.id}
                          className="border-2 border-gray-200/60 rounded-3xl py-3 sm:py-5 px-4 sm:px-8 flex justify-between items-center bg-gray-50 shadow-xl backdrop-blur-md cursor-default"
                        >
                          <span className="font-bold text-xl text-[#011638]">
                            {school.name}
                          </span>
                          <span className="text-lg font-bold text-[#eec643]">
                            {school.memberCount}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-6">
                        No schools found
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* img */}
              <div className="hidden lg:block relative z-10 flex-1 mt-10 lg:mt-0">
                <div className="relative">
                  <img
                    src="/assets/logos/webcarmap.png"
                    alt="CAR map"
                    className="w-full max-w-2xl mx-auto lg:mx-0 rounded-3xl object-contain shadow-2xl ring-8 ring-white/70 hover:scale-105 transition-all duration-700 hover:shadow-4xl"
                  />
                  <button
                    onClick={() => {
                      setSelectedProvince(null);
                      setProvinceMembers(0);
                      setProvinceSchools([]);
                    }}
                    className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md hover:bg-white shadow-lg p-3 rounded-full border border-white/50 hover:scale-110 transition-all duration-200 z-50"
                  >
                    <img
                      src="/assets/logos/homeicon1.png"
                      alt="Home"
                      className="w-6 h-6 object-contain"
                    />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-r from-[#011638]/10 to-[#eec643]/10 rounded-3xl blur-xl animate-pulse"></div>

                  {/* sorkils */}
                  {/* Abra */}
                  <div className="absolute left-[35%] top-[40%] group">
                    <button
                      onClick={() => setSelectedProvince("Abra")}
                      className="relative w-7 h-7 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] hover:scale-125 transition-all duration-300 z-20 ring-4 ring-white/50 hover:ring-[#eec643]/40 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-[#eec643]/40 after:animate-ping"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Abra
                    </span>
                  </div>

                  {/* Apayao */}
                  <div className="absolute left-[52%] top-[20%] group">
                    <button
                      onClick={() => setSelectedProvince("Apayao")}
                      className="relative w-7 h-7 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] hover:scale-125 transition-all duration-300 z-20 ring-4 ring-white/50 hover:ring-[#eec643]/40 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-[#eec643]/40 after:animate-ping"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Apayao
                    </span>
                  </div>

                  {/* Kalinga */}
                  <div className="absolute left-[58%] top-[43%] group">
                    <button
                      onClick={() => setSelectedProvince("Kalinga")}
                      className="relative w-7 h-7 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] hover:scale-125 transition-all duration-300 z-20 ring-4 ring-white/50 hover:ring-[#eec643]/40 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-[#eec643]/40 after:animate-ping"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Kalinga
                    </span>
                  </div>

                  {/* Benguet */}
                  <div className="absolute left-[31%] top-[75%] group">
                    <button
                      onClick={() => setSelectedProvince("Benguet")}
                      className="relative w-7 h-7 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] hover:scale-125 transition-all duration-300 z-20 ring-4 ring-white/50 hover:ring-[#eec643]/40 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-[#eec643]/40 after:animate-ping"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Benguet
                    </span>
                  </div>

                  {/* Ifugao */}
                  <div className="absolute left-[50%] top-[65%] group">
                    <button
                      onClick={() => setSelectedProvince("Ifugao")}
                      className="relative w-7 h-7 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] hover:scale-125 transition-all duration-300 z-20 ring-4 ring-white/50 hover:ring-[#eec643]/40 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-[#eec643]/40 after:animate-ping"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Ifugao
                    </span>
                  </div>

                  {/* Mountain Province */}
                  <div className="absolute left-[53%] top-[56.5%] group">
                    <button
                      onClick={() => setSelectedProvince("Mountain Province")}
                      className="relative w-7 h-7 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] hover:scale-125 transition-all duration-300 z-20 ring-4 ring-white/50 hover:ring-[#eec643]/40 after:content-[''] after:absolute after:inset-0 after:rounded-full after:bg-[#eec643]/40 after:animate-ping" //without pulse: className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Mountain Province
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ACADEMICS SECTION */}
        <section
          id="academics-section"
          className="py-8 px-6 lg:px-24 relative w-full mx-auto max-w-[1920px] bg-[#fbfaf8] relative"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="w-full mx-auto mb-10 max-w-[1920px]">
            {" "}
            <div className="flex flex-col lg:flex-row items-center gap-20">
              {/* img */}
              <div className="hidden lg:block flex-1 flex justify-center lg:justify-start">
                <div className="relative">
                  <img
                    src="/assets/logos/acad.jpg"
                    alt="Academics"
                    className="w-full max-w-lg lg:max-w-3xl rounded-3xl object-cover shadow-2xl ring-8 ring-white/70 hover:scale-105 transition-all duration-700 hover:shadow-4xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#011638]/20 rounded-3xl"></div>
                </div>
              </div>

              {/* txt */}
              <div className="flex-1 text-center lg:text-left max-w-lg">
                <h2 className="text-5xl lg:text-8xl font-black text-[#011638] drop-shadow-2xl leading-tight">
                  ACADEMICS
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-8 mx-auto lg:mx-0 rounded-full shadow-lg"></div>

                <p className="mt-4 text-[#141414]/85 text-lg lg:text-xl leading-relaxed backdrop-blur-sm bg-white/70 px-8 py-6 rounded-2xl shadow-xl">
                  Supporting research and thesis initiatives of members.
                  Promoting academic growth and collaboration.
                </p>

                <div className="flex justify-center lg:justify-start gap-6 mt-6">
                  <Link
                    href="/survey"
                    onClick={() =>
                      sessionStorage.setItem(
                        "returnToHomeSection",
                        "academics-section",
                      )
                    }
                    className="group inline-block px-10 py-4 rounded-3xl border-2 border-[#011638] text-[#011638] font-bold text-lg hover:bg-[#011638] hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                  >
                    Survey →
                  </Link>
                  <Link
                    href="/thesis"
                    onClick={() =>
                      sessionStorage.setItem(
                        "returnToHomeSection",
                        "academics-section",
                      )
                    }
                    className="group inline-block px-10 py-4 rounded-3xl border-2 border-[#011638] text-[#011638] font-bold text-lg hover:bg-[#011638] hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                  >
                    Thesis →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
