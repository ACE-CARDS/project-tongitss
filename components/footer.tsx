"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#011638]/80 text-white py-8 backdrop-blur-sm">
      <div className="max-w-[1450px] flex lg:flex-row flex-col justify-center items-center mx-auto gap-10 lg:gap-0 px-6">

        {/* Logo and Title */}
        <div className="container flex lg:flex-row flex-col items-center gap-5">
          <Image
            src="/assets/logos/ACE CARDS logo.png"
            alt="ACE CARDS Logo"
            className="w-22 h-22"
            width={100}
            height={100}
          ></Image>

          <div className="h-full my-auto flex flex-col justify-center lg:items-start mx-auto gap-3 items-center">
            <span className="md:text-[1.7rem] flex font-oswald sm:text-2xl whitespace-nowrap">Association of Competent and Empowered CAR DOST Scholars</span>
            <span className="text-md">&copy; 2026 ACE CARDS. All rights reserved.</span>
          </div>
        </div>
        {/* {new Date().getFullYear()} */}

        {/* Social Media Links */}
        <div className="container mx-auto flex lg:items-end items-center text-sm flex-col">
          <Link href="https://www.facebook.com/acecards.CAR" className="hover:underline hover:text-[#a6a6a6] transition-colors cursor-pointer" aria-label="Go to facebook page" target="_blank" rel="noopener noreferrer">
            <svg 
              role="img" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="size-6 m-2">
                <title>Facebook</title>
                <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
            </svg>
          </Link>

          <Link href="mailto:support@acecards.com" className="hover:text-[#a6a6a6] text-white text-lg" aria-label="Send us an email" target="_blank" rel="noopener noreferrer">
            acecards.dostcarscholars@gmail.com
          </Link>
        </div>
      </div>
    </footer>
  );
}