"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  href?: string;
}

export default function BackButton({ className = "", href }: BackButtonProps) {
  const router = useRouter();

const handleBack = () => {
    if (href) {
      router.push(href);
      return;
    }

    const rawPath = sessionStorage.getItem('successReturnPath');
    
    if (rawPath) {
      // Clear it IMMEDIATELY so other components stop reacting to it
      sessionStorage.removeItem('successReturnPath');

        // Split by '?' to manually handle the query string
        const [basePath, search] = rawPath.split('?');
        
        if (search) {
          const params = new URLSearchParams(search);
          params.delete('page'); // Explicitly kill the page tag
          
          const newSearch = params.toString();
          const cleanPath = newSearch ? `${basePath}?${newSearch}` : basePath;
          
          router.push(cleanPath);
        } else {
          router.push(basePath);
        }
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`bg-white/90 p-3 mb-6 sm:p-4 rounded-2xl cursor-pointer shadow-sm border border-white hover:scale-105 hover:shadow-md transition-all text-[#011638] flex items-center justify-center backdrop-blur-md w-fit ${className}`}
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
      <span className="font-black pl-2">Back</span>
    </button>
  );
}