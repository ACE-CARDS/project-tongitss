"use client";

import Link from "next/link"; 

// Main export
export default function BackButton() {
  return (
    <Link 
      href="/" // Home page
      className="inline-flex items-center gap-2 text-[#011638] hover:text-[#1e4db7] font-ubuntu-mono transition-colors"
    >

      {/* Arrow SVG */}
      <svg 
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>Home</span>
    </Link>
  );
}