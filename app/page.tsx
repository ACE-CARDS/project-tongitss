"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/layout/navbar";
import Popup from "@/components/features/landing_page/announcements/announcementPopup";
import Kidla from "@/components/ui/kidla/kidlaButton";
import KidlaDialogue from "@/components/ui/kidla/kidlaDialogue";
import Footer from "@/components/layout/footer";
import { createClient } from "@/utils/supabase/client";
import BottomBlur from "@/components/ui/bottomBlur";
import NewsMedia from "@/components/features/landing_page/newsMedia";
import Hero from "@/components/features/landing_page/hero";
import Events from "@/components/features/landing_page/events";
import Members from "@/components/features/landing_page/members";
import Province from "@/components/features/landing_page/province";
import Acedemics from "@/components/features/landing_page/academics";
import BackToTop from "@/components/ui/backToTop";

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
  // function useCountUp(target, duration = 1000) {
  //   const [count, setCount] = useState(0);

  //   useEffect(() => {
  //     let start = 0;
  //     if (target === 0) return setCount(0);
  //     const increment = target / (duration / 16);
  //     const interval = setInterval(() => {
  //       start += increment;
  //       if (start >= target) {
  //         setCount(target);
  //         clearInterval(interval);
  //       } else {
  //         setCount(Math.floor(start));
  //       }
  //     }, 16);

  //     return () => clearInterval(interval);
  //   }, [target, duration]);

  //   return count;
  // }


  //arrow up&down
  const [isAtTop, setIsAtTop] = useState(true);


  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("error")) {
      router.push("/auth/login?error=" + query.get("error_description"));
    }
  }, []);

  //button pataas hi

  //count animation for members section
  const [isOverHero, setIsOverHero] = useState(true);


useEffect(() => {
    const handleScroll = () => {
      const heroHeight = document.getElementById("hero")?.offsetHeight || 0;
      setIsAtTop(window.scrollY < 50);
      setIsOverHero(window.scrollY < heroHeight - 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="text-[#141414] min-h-screen flex flex-col overflow-hidden">
        <BackToTop targetId="hero" />

        <NavBar isOverHero={isOverHero} />
        
        <div className="relative">
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

          <BottomBlur />
          
          <div className={`
            fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] 
            text-white text-6xl 
            pointer-events-none 
            bounce transition-opacity duration-500 ${isAtTop ? "opacity-100" : "opacity-0"} `}
          >
            ↓
          </div>

          {/* HERO SECTION */}
          <Hero id="hero" />

          <main className="relative max-w-[1920px] w-full mx-auto flex-1">
            <NewsMedia />

            {/* EVENTS SECTION */}
            <Events id="events-section" />

            {/* MEMBERS SECTION */}
            <Members id="members-section" />

            {/* PROVINCE SECTION */}
            <Province id="province-section" />

            {/* ACADEMICS SECTION */}
            <Acedemics id="academics-section" />

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
            `}
            </style>
        </main>
      </div>
      <Footer />
    </>
  );
}
