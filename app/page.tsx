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


export default function Home() {
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isDialogueShowing, setIsDialogueShowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsModalShowing(true);
  }, []);

  useEffect(() => {
    setIsDialogueShowing(false);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen">
      <NavBar />

      <main>
      {/* HERO SECTION */}
      <section id="hero" className="bg-white/80 backdrop-blur-sm py-24 px-6 lg:px-20 overflow-hidden">
        <div className="relative flex flex-col lg:flex-row items-center justify-center lg:ml-8 max-w-7xl mx-auto">
          {/* TEXT */}
          <div className="relative z-20 flex-1 text-center lg:text-left max-w-lg lg:max-w-xl lg:mr-8">
            <h1 className="text-5xl sm:text-6xl lg:text-9xl font-black lg:-mr-24 bg-gradient-to-r from-[#eec643] via-[#0d21a1] to-[#011638] bg-clip-text text-transparent leading-none drop-shadow-lg">
              ACE CARDS
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-8 mx-auto lg:mx-0 rounded-full shadow-md"></div>

            <p className="mt-8 text-[#141414]/80 text-xl leading-relaxed backdrop-blur-sm bg-white/60 px-6 py-4 rounded-2xl shadow-xl max-w-xl mx-auto lg:mx-0">
              Uniting DOST-SEI scholars in Cordillera Administrative Region to lead, innovate, and serve with excellence, leadership, and social responsibility.
            </p>

            {/* learn more */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/about-us" 
                className="px-10 py-5 border-3 border-[#eec643]/50 bg-white/80 backdrop-blur-md text-[#0d21a1] font-bold text-lg rounded-3xl shadow-xl hover:shadow-2xl hover:bg-[#eec643]/10 hover:border-[#0d21a1]/70 transition-all duration-300 max-w-sm mx-auto lg:mx-0"
              >
                About Us
              </Link>
            </div>
          </div>
          
          {/* IMAGE */}
          <div className="relative z-10 flex-1 mt-10 lg:mt-0 lg:ml-8">
            <div className="relative">
              <img 
                src="/assets/logos/ACE CARDS logo.png" 
                alt="Ace Cards Image" 
                className="w-full max-w-lg mx-auto lg:mx-0 rounded-3xl object-contain ring-4 ring-white/50 hover:scale-105 transition-all duration-500 hover:shadow-3xl" 
              />
              <div className="absolute -inset-4 bg-gradient-to-r from-[#eec643]/20 to-[#011638]/20 rounded-3xl blur-xl animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* CORE VALUES */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-base sm:text-lg font-bold text-[#011638]/90 tracking-wide text-center">
          <span className="px-6 py-3 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all">Professional Excellence</span>
          <span className="hidden sm:inline text-[#011638]/50 font-normal px-2">•</span>
          <span className="px-6 py-3 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all">Social Responsibility</span>
          <span className="hidden sm:inline text-[#011638]/50 font-normal px-2">•</span>
          <span className="px-6 py-3 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all">Servant Leadership</span>
        </div>
      </section>

         </div>
      <Popup
        isShowing={isModalShowing}
        onClose={() => setIsModalShowing(false)}
      />
      <KidlaDialogue
        isShowing={isDialogueShowing}
        onClose={() => setIsDialogueShowing(false)}
        onAnnouncements={() => {
          setIsDialogueShowing(false);
          setIsModalShowing(true);
        }}
        onRedirectMemApp={() => {
          setIsDialogueShowing(false);
          router.push("/events");
        }}
       />
        <Kidla
          onClick={() => setIsDialogueShowing((prev) => !prev)}
          isDialogueShowing={isDialogueShowing}
        />
        <section id="wow" className="justify-center items-center text-center py-20 bg-blue-500 h-screen">
          <h1 className="text-3xl font-bold">[NEWS AND MEDIA]</h1>
        </section>


        {/* EVENTS SECTION */}
        <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-white/50 to-transparent">
          <div className="text-center mb-20 relative z-10">
            <h1 className="text-7xl sm:text-8xl lg:text-[200px] font-black text-[#011638] drop-shadow-2xl leading-none">
              67
            </h1>
            <h2 className="text-4xl sm:text-6xl lg:text-9xl font-bold text-[#011638]/90 mt-4 drop-shadow-xl">
              EVENTS
            </h2>
            <button className="mt-10 group px-10 py-4 border-2 border-[#011638] rounded-full font-bold text-lg text-[#011638] hover:bg-gradient-to-r hover:from-[#011638] hover:to-[#0d21a1] hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform">
              View All →
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1"></span>
            </button>
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
            <div className="absolute top-20 left-24 rotate-12 hover:-translate-y-6 hover:scale-105 transition-all duration-700 group">
              <img src="/assets/logos/upbfair.jpg" className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl" />
            </div>
            <div className="absolute top-32 right-24 -rotate-6 hover:-translate-y-6 hover:scale-105 transition-all duration-700 group">
              <img src="/assets/logos/uge26.jpeg" className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl" />
            </div>
            <div className="absolute bottom-20 left-45 rotate-3 hover:-translate-y-6 hover:scale-105 transition-all duration-700 group">
              <img src="/assets/logos/inadalan.jpg" className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl" />
            </div>
            <div className="absolute bottom-28 right-40 -rotate-15 hover:-translate-y-6 hover:scale-105 transition-all duration-700 group">
              <img src="/assets/logos/blooddonation.jpg" className="w-72 h-96 object-cover rounded-3xl shadow-2xl ring-4 ring-white/60 group-hover:shadow-3xl" />
            </div>
          </div>
        </section>

        {/* MEMBERS SECTION */}
        <section className="py-32 px-6 lg:px-24 bg-gradient-to-r from-white/70 to-transparent">
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
                208
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
                href = ""
                 className="group px-10 py-4 rounded-3xl bg-gradient-to-r from-[#011638] to-[#0d21a1] text-white font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 transform">
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
        </section>

       {/* PROVINCE SECTION */}
        <section className="bg-white/80 backdrop-blur-sm py-24 px-6 lg:px-20 relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            
            <div className="flex-1 w-full text-center lg:text-left">
              {/* Back + AT filter */}
              <div className="flex items-center justify-between mb-8 bg-white/50 px-6 py-4 rounded-2xl shadow-lg backdrop-blur-md">
                <button className="text-3xl font-bold text-[#011638] hover:scale-110 transition-transform duration-200">←</button>
                <select className="border-2 border-gray-200/50 rounded-2xl px-6 py-3 bg-white/80 font-semibold text-[#011638] shadow-md focus:ring-4 focus:ring-[#eec643]/30 focus:border-[#eec643] transition-all duration-200">
                  <option>AY 2025-2026</option>
                  <option>AY 2024-2025</option>
                  <option>AY 2023-2024</option>
                  <option>AY 2022-2023</option>
                </select>
              </div>
              
              {/* ttle */}
              <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-[#011638] drop-shadow-2xl leading-none mb-12">
                PROVINCE
              </h1>
              
              {/* total and uni list */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
                {/* total */}
                <h2 className="text-8xl font-black text-[#011638] flex-shrink-0 drop-shadow-2xl bg-gradient-to-b from-[#011638] to-[#0d21a1] bg-clip-text text-transparent">
                  208
                </h2>
                
                {/* uni list */}
                <div className="space-y-4 w-full max-w-lg">
                  <div className="group border-2 border-gray-200/60 rounded-3xl py-5 px-8 flex justify-between items-center bg-gradient-to-r from-white to-gray-50/50 shadow-xl backdrop-blur-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <span className="font-bold text-xl text-[#011638] group-hover:text-[#0d21a1]">Saint Louis University</span>
                    <span className="text-lg font-bold text-[#eec643] group-hover:scale-110 transition-transform">82</span>
                  </div>
                  <div className="group border-2 border-gray-200/60 rounded-3xl py-5 px-8 flex justify-between items-center bg-gradient-to-r from-white to-gray-50/50 shadow-xl backdrop-blur-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <span className="font-bold text-xl text-[#011638] group-hover:text-[#0d21a1]">University of the Philippines Baguio</span>
                    <span className="text-lg font-bold text-[#eec643] group-hover:scale-110 transition-transform">70</span>
                  </div>
                  <div className="group border-2 border-gray-200/60 rounded-3xl py-5 px-8 flex justify-between items-center bg-gradient-to-r from-white to-gray-50/50 shadow-xl backdrop-blur-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <span className="font-bold text-xl text-[#011638] group-hover:text-[#0d21a1]">Benguet State University</span>
                    <span className="text-lg font-bold text-[#eec643] group-hover:scale-110 transition-transform">20</span>
                  </div>
                  <div className="group border-2 border-gray-200/60 rounded-3xl py-5 px-8 flex justify-between items-center bg-gradient-to-r from-white to-gray-50/50 shadow-xl backdrop-blur-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                    <span className="font-bold text-xl text-[#011638] group-hover:text-[#0d21a1]">University of Baguio</span>
                    <span className="text-lg font-bold text-[#eec643] group-hover:scale-110 transition-transform">19</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IMAGE */}
            <div className="hidden lg:block relative z-10 flex-1 mt-10 lg:mt-0">
              <div className="relative">
                <img 
                  src="/assets/logos/webcarmap.png" 
                  alt="CAR map" 
                  className="w-full max-w-2xl mx-auto lg:mx-0 rounded-3xl object-contain shadow-2xl ring-8 ring-white/70 hover:scale-105 transition-all duration-700 hover:shadow-4xl"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#011638]/10 to-[#eec643]/10 rounded-3xl blur-xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* logows */}
          <div className="mt-16 pt-8 border-t border-gray-200/50 flex justify-center gap-8 flex-wrap">
            <img
              src="/assets/logos/KAINDS.jpg"
              alt="Logo 1"
              className="w-20 h-20 lg:w-24 lg:h-24 object-contain hover:scale-105 transition-transform duration-300 shadow-lg rounded-2xl"
            />
            <img
              src="/assets/logos/SIKAT.png"
              alt="Logo 2"
              className="w-20 h-20 lg:w-24 lg:h-24 object-contain hover:scale-105 transition-transform duration-300 shadow-lg rounded-2xl"
            />
            <img
              src="/assets/logos/BAGGS.png"
              alt="Logo 3"
              className="w-20 h-20 lg:w-24 lg:h-24 object-contain hover:scale-105 transition-transform duration-300 shadow-lg rounded-2xl"
            />
          </div>
        </section>

        {/* ACADEMICS SECTION */}
        <section className="py-32 px-6 lg:px-24 bg-gradient-to-r from-transparent to-white/70">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            {/* IMAGE */}
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

            {/* TEXT */}
            <div className="flex-1 text-center lg:text-left max-w-lg">
              <h2 className="text-5xl lg:text-8xl font-black text-[#011638] drop-shadow-2xl leading-tight">
                Academics
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-8 mx-auto lg:mx-0 rounded-full shadow-lg"></div>

              <p className="mt-8 text-[#141414]/85 text-lg lg:text-xl leading-relaxed backdrop-blur-sm bg-white/70 px-8 py-8 rounded-2xl shadow-xl">
                Supporting research and thesis initiatives
                of members. Promoting academic growth and 
                collaboration.
              </p>

              <div className="flex justify-center lg:justify-start gap-6 mt-12">
                <Link
                href = ""
                 className="group px-10 py-4 lg:px-12 lg:py-5 rounded-3xl bg-gradient-to-r from-[#011638] to-[#0d21a1] text-white font-bold text-lg lg:text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 transform">
                  Surveys
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/thesis"
                  className="group px-10 py-4 lg:px-12 lg:py-5 rounded-3xl border-2 border-[#011638] text-[#011638] font-bold text-lg lg:text-xl hover:bg-[#011638] hover:text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
                  >
                  Thesis →
                  </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}