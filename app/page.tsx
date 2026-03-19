"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: eventTotal } = await supabase
        .from("event")
        .select("*", { count: "exact", head: true });
      const { count: memberTotal } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true });
      setEventCount(eventTotal || 0);
      setMemberCount(memberTotal || 0);
    };
    fetchCounts();
  }, []);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provinceMembers, setProvinceMembers] = useState(0);

  useEffect(() => {
    const fetchProvinceMembers = async () => {
      if (!selectedProvince) return;
      const { count, error } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true })
        .eq("province", selectedProvince);
      if (!error) {
        setProvinceMembers(count || 0);
      }
    };
    fetchProvinceMembers();
  }, [selectedProvince]);

  //awa nalang cguro (province count)
  const [provinceSchools, setProvinceSchools] = useState([]);

  useEffect(() => {
    const fetchProvinceData = async () => {
      let schools = [];

      if (selectedProvince) {
        const { data: provinceData, error: provError } = await supabase
          .from("province")
          .select("id")
          .eq("prov_name", selectedProvince)
          .single();
        if (provError || !provinceData) return;
        const provinceId = provinceData.id;

        const { data: schoolData, error: schoolError } = await supabase
          .from("school")
          .select("id, school_name")
          .eq("province", provinceId);
        if (schoolError || !schoolData) return;
        schools = schoolData;
      } else {
        //def
        const { data: schoolData, error: schoolError } = await supabase
          .from("school")
          .select("id, school_name");
        if (schoolError || !schoolData) return;
        schools = schoolData;
      }

      const schoolsWithCounts = await Promise.all(
        schools.map(async (school) => {
          const { count } = await supabase
            .from("member")
            .select("*", { count: "exact", head: true })
            .eq("school", school.id);
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
  }, [selectedProvince]);

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

  return (
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen">
      <NavBar />
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
            height="5rem"
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
          className="relative bg-cover bg-center bg-no-repeat py-24 px-6 lg:px-20 overflow-hidden"
          style={{ backgroundImage: "url('/assets/logos/hero-bg.png')" }}
        >
          <div className="absolute inset-0 bg-black/25"></div>

          <div className="w-full mx-auto mb-10 max-w-[1920px]">
            <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
              <div className="relative flex flex-col items-center">
                {/* logo */}
                <img
                  src="/assets/logos/ACE CARDS logo.png"
                  alt="Ace Cards Logo"
                  className="w-80 lg:w-105 rounded-3xl shadow-2xl"
                />

                {/* txt overlap logo */}
                <h1 className="absolute text-7xl sm:text-7xl md:text-8xl lg:text-[150px] font-black text-white drop-shadow-2xl top-1 -translate-y-1/2 whitespace-nowrap">
                  ACE CARDS
                </h1>
              </div>

              {/* desktop */}
              <div className="hidden lg:flex justify-start w-full gap-8 lg:h-64 xl:h-80 -mt-75">
                {/* desc */}
                <div className="flex-1 flex flex-col justify-center items-center bg-white/70 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl max-w-xs self-start translate-x-10">
                  <p className="text-[#141414] text-lg leading-relaxed font-semibold">
                    Uniting DOST-SEI scholars in Cordillera Administrative
                    Region to lead, innovate, and serve with excellence,
                    leadership, and social responsibility.
                  </p>
                </div>

                {/* Core Values */}
                <div className="flex-1 flex flex-col justify-center items-center bg-white/70 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl max-w-xs self-end translate-x-130">
                  <ul className="text-[#141414] text-lg font-semibold space-y-2">
                    <li>Professional Excellence</li>
                    <li>Social Responsibility</li>
                    <li>Servant Leadership</li>
                  </ul>
                </div>
              </div>

              {/* Mobile CorVal*/}
              <div className="flex lg:hidden flex-wrap justify-center gap-4 mt-8 text-center">
                <span className="px-4 py-2 bg-white/70 backdrop-blur-md rounded-xl shadow-md font-semibold">
                  Professional Excellence
                </span>
                <span className="px-4 py-2 bg-white/70 backdrop-blur-md rounded-xl shadow-md font-semibold">
                  Social Responsibility
                </span>
                <span className="px-4 py-2 bg-white/70 backdrop-blur-md rounded-xl shadow-md font-semibold">
                  Servant Leadership
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* EVENTS SECTION */}
        <section
          className="py-8 px-6 lg:px-24 relative w-full mx-auto mb-10 max-w-[1920px]"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          <div className="w-full mx-auto mb-10 max-w-[1920px] relative">
            <div className="text-center mb-20 relative z-10">
              <h1 className="text-7xl sm:text-8xl lg:text-[200px] font-black text-[#011638] drop-shadow-2xl leading-none">
                {eventCount}
              </h1>
              <h2 className="text-4xl sm:text-6xl lg:text-9xl font-bold text-[#011638]/90 mt-4 drop-shadow-xl">
                EVENTS
              </h2>
              <button className="mt-10 group px-10 py-4 border-2 border-[#011638] rounded-full font-bold text-lg text-[#011638] hover:bg-gradient-to-r hover:from-[#011638] hover:to-[#0d21a1] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
                View All →
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1"></span>
              </button>
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
            <div className="absolute top-32 right-24 -rotate-6 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
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
            <div className="absolute bottom-28 right-40 -rotate-15 transition-all duration-700 group z-10 hover:z-50 hover:-translate-y-6 hover:scale-105">
              <img
                src="/assets/logos/blooddonation.jpg"
                className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl"
              />
            </div>
          </div>
        </section>

        {/* MEMBERS SECTION */}
        <section
          className="py-8 px-6 lg:px-24 bg-gradient-to-r from-white/70 to-transparent"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
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
                  {memberCount}
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
                    className="group px-10 py-4 rounded-3xl bg-gradient-to-r from-[#011638] to-[#0d21a1] text-white font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 transform"
                  >
                    Committees
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>

                  <Link
                    href="/executives"
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
          className="py-8 px-6 lg:px-24 relative"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        >
          <div className="w-full mx-auto mb-10 max-w-[1920px] relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="flex-1 w-full text-center lg:text-left">
                <div className="flex items-center justify-between mb-8 bg-white/50 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md">
                  <button
                    onClick={() => {
                      setSelectedProvince(null);
                      setProvinceMembers(0);
                      setProvinceSchools([]);
                    }}
                    className="text-3xl font-bold text-[#011638] hover:scale-110 transition-transform duration-200"
                  >
                    ←
                  </button>
                  <select className="border-2 border-gray-200/50 rounded-2xl px-6 py-3 bg-white/80 font-semibold text-[#011638] shadow-md focus:ring-4 focus:ring-[#eec643]/30 focus:border-[#eec643] transition-all duration-200">
                    <option>AY 2025-2026</option>
                    <option>AY 2024-2025</option>
                    <option>AY 2023-2024</option>
                    <option>AY 2022-2023</option>
                  </select>
                </div>

                {/* ttle */}
                <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-[#011638] drop-shadow-2xl leading-none mb-12">
                  {selectedProvince
                    ? selectedProvince.toUpperCase()
                    : "PROVINCE"}
                </h1>

                {/* total and uni list */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
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

                  <h2 className="text-8xl font-black text-[#011638] flex-shrink-0 drop-shadow-2xl bg-gradient-to-b from-[#011638] to-[#0d21a1] bg-clip-text text-transparent">
                    {selectedProvince ? provinceMembers : memberCount}
                  </h2>

                  {/* uni list */}
                  <div className="space-y-4 w-full max-w-lg max-h-[400px] overflow-y-auto custom-scrollbar">
                    {provinceSchools.length > 0 ? (
                      provinceSchools.map((school) => (
                        <div
                          key={school.id}
                          className="border-2 border-gray-200/60 rounded-3xl py-5 px-8 flex justify-between items-center bg-gray-50 shadow-xl backdrop-blur-md cursor-default"
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
                  <div className="absolute inset-0 bg-gradient-to-r from-[#011638]/10 to-[#eec643]/10 rounded-3xl blur-xl animate-pulse"></div>

                  {/* sorkils */}
                  {/* Abra */}
                  <div className="absolute left-[35%] top-[40%] group">
                    <button
                      onClick={() => setSelectedProvince("Abra")}
                      className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Abra
                    </span>
                  </div>

                  {/* Apayao */}
                  <div className="absolute left-[52%] top-[20%] group">
                    <button
                      onClick={() => setSelectedProvince("Apayao")}
                      className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Apayao
                    </span>
                  </div>

                  {/* Kalinga */}
                  <div className="absolute left-[58%] top-[43%] group">
                    <button
                      onClick={() => setSelectedProvince("Kalinga")}
                      className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Kalinga
                    </span>
                  </div>

                  {/* Benguet */}
                  <div className="absolute left-[31%] top-[75%] group">
                    <button
                      onClick={() => setSelectedProvince("Benguet")}
                      className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Benguet
                    </span>
                  </div>

                  {/* Ifugao */}
                  <div className="absolute left-[50%] top-[65%] group">
                    <button
                      onClick={() => setSelectedProvince("Ifugao")}
                      className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
                    ></button>
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#011638]/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50">
                      Ifugao
                    </span>
                  </div>

                  {/* Mountain Province */}
                  <div className="absolute left-[53%] top-[56.5%] group">
                    <button
                      onClick={() => setSelectedProvince("Mountain Province")}
                      className="w-8 h-8 bg-[#eec643] rounded-full shadow-lg hover:bg-[#0d21a1] transition-all duration-300 z-20"
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
          className="py-8 px-6 lg:px-24 relative"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
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
                    className="group px-10 py-4 border-2 border-[#011638] rounded-full font-bold text-lg text-[#011638] hover:bg-gradient-to-r hover:from-[#011638] hover:to-[#0d21a1] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
                  >
                    Surveys
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <Link
                    href="/thesis"
                    className="group px-10 py-4 border-2 border-[#011638] rounded-full font-bold text-lg text-[#011638] hover:bg-gradient-to-r hover:from-[#011638] hover:to-[#0d21a1] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
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
