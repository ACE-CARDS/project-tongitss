"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleBack = () => {
    const returnTo = sessionStorage.getItem("returnToHomeSection");
    
    if (returnTo) {
      // return to section
      router.push(`/#${returnTo}`);
      sessionStorage.removeItem("returnToHomeSection");
    } else {
      // default: return to hero section
      router.push("/#hero");
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-white hover:scale-105 hover:shadow-md transition-all text-[#011638] flex items-center justify-center backdrop-blur-md w-fit ${className}`}
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
  );
}