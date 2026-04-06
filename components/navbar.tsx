"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useUser } from "./context/userContext";

const siteName = "ACE CARDS";

const routeTitles: Record<string, string> = {
  "/": "HOME",
  "/about-us": "ABOUT US",
  "/events": "EVENTS",
  "/survey": "RESEARCH SURVEYS",
  "/thesis": "THESIS REPOSITORY",
  "/member-appli": "BE A MEMBER",
  "/dashboard": "DASHBOARD",
  "/executives": "EXECUTIVES",
};

export default function NavBar() {
  const { user } = useUser();
  const [menuOpen, setMenuisOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const academicsRef = useRef<HTMLLIElement>(null);

  const pathname = usePathname();
  // const title = routeTitles[pathname] || "";
  const title = pathname && pathname !== "/" ? routeTitles[pathname] || "" : "";
  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setMenuisOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setAcademicsOpen(!academicsOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        academicsRef.current &&
        !academicsRef.current.contains(event.target as Node)
      ) {
        setAcademicsOpen(false);
        setMenuisOpen(false);
      }
    };

    document.addEventListener("wheel", handleClickOutside);
    document.addEventListener("scroll", handleClickOutside);
    return () => {
        document.removeEventListener("wheel", handleClickOutside);
        document.removeEventListener("scroll", handleClickOutside);
    };
  }, []);

  return (
    // class="w-full  mx-auto mb-10 max-w-[1920px]
    <div className={`${isActive("/") ? "fixed" : "sticky"} w-full top-0 z-50 inset-0`}>

      {/* Blur */}
      <div className="absolute inset-0 h-28 backdrop-blur-2xl bg-[#011638]/30 mask-[linear-gradient(to_bottom,black_20%,transparent)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative w-full mx-auto my-auto max-w-[1250px] top-3 h-14">
        <div className="flex flex-row items-center justify-between lg:px-8 px-2 w-full h-full lg:gap-4 gap-2 text-white ">

          {/* Title */}
          <a title="Go back to Home Page?" className="flex flex-row items-center h-full w-fit gap-2 rounded-full px-1 pr-4 bg-[#011638]/70 border-[#011638]/35 border-3 backdrop-blur-sm hover:bg-[#011638]/80 transition-all duration-200 hover:scale-[1.04]" href="/">
            <Image
              src="/assets/logos/ACE CARDS logo.png"
              alt="ACE CARDS Logo"
              className="w-11 h-11 shrink-0"
              width={40}
              height={40}
            ></Image>
            <div className="flex flex-col justify-center h-full gap-0 whitespace-nowrap">
              {title && title !== siteName && (
                <div className="text-sm opacity-75 font-bold leading-none title">
                  {siteName}
                </div>
              )}
              <div className="md:text-3xl sm:text-2xl text-xl font-bold leading-none whitespace-nowrap font-oswald">
                {title || siteName}
              </div>
            </div>
          </a>
          
          {/* Navigation   */}
          <div className={`fixed text-lg lg:right-[30px] right-[10px] top-[80px] flex flex-row xl:flex-row text-right xl:px-[4px] xl:items-end xl:h-full xl:static xl:w-full w-fit justify-end bg-[#011638]/70 border-[#011638]/34 border-3 backdrop-blur-sm rounded-[50px] pl-2 xl:gap-4 gap-2 ${menuOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 xl:scale-100 xl:opacity-100"} origin-top-right transition-all duration-300 ease-in-out`}>
            <ul className={`relative gap-2 flex xl:flex-row flex-col xl:h-full xl:items-center py-6 xl:py-0 px-4 xl:px-0 whitespace-nowrap xl:opacity-100 xl:visible`}>
              <Link href="/">
                <li className={`px-[10px] py-[2px] rounded-full border-2 duration-200 transition-all
                ${isActive("/") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  Home
                </li>
              </Link>

              <Link href="/about-us">
                <li className={`px-[10px] py-[2px] rounded-full border-2 duration-200 transition-all
                ${isActive("/about-us") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  About Us
                </li>
              </Link>

              <Link href="/events">
                <li className={`px-[10px] py-[2px] rounded-full border-2 duration-200 transition-all
                ${isActive("/events") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  Events
                </li>
              </Link>

              <Link href="/executives">
                <li className={`px-[10px] py-[2px] rounded-full border-2 duration-200 transition-all
                ${isActive("/executives") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  Executives
                </li>
              </Link>

              <li
                ref={academicsRef}
                onClick={toggleDropdown}
                className={`z-20 group relative flex-row flex gap-1 cursor-pointer px-[10px] py-[2px] rounded-full border-2 duration-200 transition-all
                ${isActive("/thesis") || isActive("/survey")
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }
                ${academicsOpen ? "bg-[#a6a6a6]/30 border-[#a6a6a6]/10 scale-[1.04]" : ""}
                `}
              >
                Academics
                {/* Arrow down */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
                <ul
                  className={`${academicsOpen ? "visible" : "invisible"} absolute shadow-[0_5px_10px_#011638]/80 bg-[#011638]/90 border-[#011638]/34 border-3 backdrop-blur-sm ease-in-out text-white p-4 rounded-[30px] xl:-left-10 -left-10 xl:top-8 top-10 w-50 gap-4 flex flex-col text-center`}
                >
                  <li className="hover:underline">
                    <Link href="/survey">Research Surveys</Link>
                  </li>
                  <li className="hover:underline">
                    <Link href="/thesis">Thesis Repository</Link>
                  </li>
                </ul>
              </li>

              {/* 1. If NO user is found, show Login and Join buttons */}
              {!user ? (
                <>
                  <Link href="/member-appli">
                    <li className={`w-[140px] py-[6px] rounded-full border-white/50 border-2 duration-200 transition-all ease-in-out bg-white/80 text-center text-black backdrop-blur-xs
                        ${isActive("/member-appli") 
                          ? "shadow-[0_0_15px_white] border-[#a6a6a6]/10 bg-white/100 scale-[1.04]"
                          : "hover:shadow-[0_0_15px_white] border-[#a6a6a6]/0 hover:border-[#a6a6a6]/10 hover:bg-white/100 hover:scale-[1.04]"
                        }`}>
                      Be A Member
                    </li>
                  </Link>

                  <Link href="/auth/login" >
                    <li className="w-[140px] py-[6px] hover:shadow-[0_0_25px_#d9b237] hover:scale-[1.04] hover:bg-[#d9b237] text-center ease-in-out duration-200 transition-all rounded-[50px] text-xl text-white bg-[#d9b237]/85 backdrop-blur-xs border-[#d9b237] border-2 cursor-pointer items-center justify-center ">
                      Login
                    </li>
                  </Link>
                </>
              ) : (
                /* 2. If user IS found, show Dashboard and Logout */
                <div className="flex xl:flex-row flex-col xl:items-center xl:justify-center justify-end gap-2 text-right py-[1px] xl:px-[4px] rounded-[50px] bg-white/0 xl:bg-white/80 xl:border-white/50 xl:border-2 duration-200 transition-all ease-in-out text-center xl:text-black text-white xl:backdrop-blur-xs  xl:hover:border-[#a6a6a6]/10 xl:hover:bg-white/100 xl:hover:scale-[1.04]">
                  <Link href="/dashboard">
                    <li
                      className={`px-[13px] py-[4px] rounded-[50px] border-2 duration-200 transition-all xl:text-black text-white
                      ${
                        isActive("/dashboard")
                          ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                          : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                      }`}
                    >
                      Dashboard
                    </li>
                  </Link>

                  <li
                    onClick={async () => {
                      const { createClient } =
                        await import("@/lib/supabase/client");
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      window.location.href = "/"; // Refresh to clear state
                    }}
                    className="cursor-pointer rounded-[50px] bg-red-500/60 xl:text-white border-red-500/80 text-white xl:text-red-500 border-2 duration-200 transition-all px-[13px] py-[4px] border-red-500/0 xl:hover:bg-red-500/90 xl:hover:border-red-500/10 xl:hover:scale-[1.04] xl:hover:scale-[1.04]"
                  >
                    Logout
                  </li>
                </div>
              )}
            </ul>
          </div>
          
          <div className="flex items-center gap-4 justify-center xl:hidden flex flex-row items-center h-full w-fit gap-2 rounded-full px-2 bg-[#011638]/70 border-[#011638]/35 border-3 backdrop-blur-sm">
            {/* hamburger */}
            <svg
              onClick={toggleMenu}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`duration-200 size-8 xl:hidden cursor-pointer ${menuOpen ? "hidden" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>

            {/* close icon */}
            <svg
              onClick={toggleMenu}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`duration-200 size-8 xl:hidden cursor-pointer ${menuOpen ? "" : "hidden"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>

        </div>
      </nav>

    </div>
  );
}
