"use client";

import { useState, useEffect } from "react";

type BackToTopProps = {
  targetId: string;
  top?: boolean;
};

export default function BackToTop({ targetId, top = false }: BackToTopProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById(targetId);
      if (!element) return;
      // const height = document.getElementById(targetId)?.offsetHeight || 0;
      const elementBottom = element.offsetTop + element.offsetHeight;
      // setShowBackToTop(window.scrollY > height - 50);
      setShowBackToTop(window.scrollY > elementBottom - 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [targetId]);

  const scrollToTarget = () => {
    if (top === true) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!showBackToTop) return null;

  return (
    <button
      onClick={scrollToTarget}
      aria-label="Back to top"
      className="cursor-pointer border-2 border-yellow-500 fixed bottom-6 left-10 z-[10000] bg-white/80 backdrop-blur-md hover:bg-white shadow-xl px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 hover:scale-105"
    >
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
  );
}