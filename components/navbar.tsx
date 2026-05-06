"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useUser } from "./context/userContext";

const siteName = "ACE CARDS";

export default function NavBar({ isOverHero = false }) {
  const { user } = useUser();
  const [menuOpen, setMenuisOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const academicsRef = useRef<HTMLLIElement>(null);
  const membersRef = useRef<HTMLLIElement>(null);

  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setMenuisOpen(!menuOpen);
  };

  const toggleDropdown = () => {
    setAcademicsOpen(!academicsOpen);
    setMembersOpen(false);
  };

  const toggleMembers = () => {
    setMembersOpen(!membersOpen);
    setAcademicsOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        (academicsRef.current &&
        !academicsRef.current.contains(event.target as Node)) || 
        (membersRef.current &&
        !membersRef.current.contains(event.target as Node)
        )
      ) {
        setAcademicsOpen(false);
        setMenuisOpen(false);
        setMembersOpen(false);
      }
    };

    document.addEventListener("scroll", handleClickOutside);
    return () => {
      document.removeEventListener("scroll", handleClickOutside);
    };
  }, []);

   // Clear saved tab before logout
  const handleLogout = async () => {
    if (user?.email) {
      localStorage.removeItem(`dashboard_tab_${user.email}`);
    }
    
    // Logout
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
    <div className={`${isActive("/") ? "fixed" : "sticky"} w-full top-0 z-[100000]`}>

      {/* Blur */}
      <div className="absolute inset-0 h-28 backdrop-blur-2xl bg-[#011638]/30 mask-[linear-gradient(to_bottom,black_20%,transparent)] pointer-events-none" />

      {/* Navbar */}
      <nav
        className={`relative w-full mx-auto my-auto max-w-[1150px] top-3 h-14 transition-all duration-300
        `}
      >
        <div className="flex flex-row items-center justify-between lg:px-8 px-2 w-full h-full lg:gap-4 gap-2 text-white">

          {/* Title */}
          <Link title="Go back to Home Page?" className={`flex flex-row items-center h-full w-fit gap-2 rounded-full pl-[7px] pr-4 bg-[#011638]/70 backdrop-blur-sm hover:bg-[#011638]/80 transition-all duration-200 ease-in-out hover:scale-[1.04] ${isOverHero ? "ring-[1.5px] ring-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : ""} ring-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]`} href="/">
            <Image
              src="/assets/logos/ACE CARDS logo.png"
              alt="ACE CARDS Logo"
              className="w-11 h-11 shrink-0"
              width={100}
              height={100}
            />
            <div className="flex flex-col justify-center h-full gap-0 whitespace-nowrap md:text-3xl sm:text-2xl text-xl font-bold leading-none font-oswald">
                {siteName}
            </div>
          </Link>

          {/* Navigation */}
          <div
            ref={academicsRef}
            className={`
              shadow-[0_0_15px_rgba(255,255,255,0.3)]
              fixed text-lg lg:right-[30px] right-[10px] top-[80px]
              flex xl:flex-row text-right
              xl:px-[4px] xl:items-end xl:h-full xl:static xl:w-full
              justify-end
              bg-[#011638]/70 backdrop-blur-sm rounded-[50px] pl-2
              xl:gap-4 gap-2
              w-[220px] xl:w-auto
              overflow-hidden xl:overflow-visible
              ${menuOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 xl:scale-100 xl:opacity-100"}
              origin-top-right transition-all duration-200 ease-in-out
              ring-0
              ${isOverHero ? "ring-[1.5px] ring-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : ""}
            `}
          >
            <ul
              className={`
                relative gap-2 flex xl:flex-row flex-col
                xl:h-full xl:items-center
                py-6 xl:py-0 px-4 xl:px-0
                xl:whitespace-nowrap xl:opacity-100 xl:visible
                overflow-y-auto xl:overflow-visible
                max-h-[calc(100svh-100px)] xl:max-h-none
                w-full xl:w-auto
                custom-scrollbar-white
              `}
            >
              <Link href="/">
                <li className={`px-[10px] py-[2px] rounded-full duration-200 transition-all
                  ${isActive("/")
                    ? "bg-[#a6a6a6]/35 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                    : "hover:bg-[#a6a6a6]/30 hover:scale-[1.04]"
                  }`}>
                  Home
                </li>
              </Link>

              <Link href="/about-us">
                <li className={`px-[10px] py-[2px] rounded-full duration-200 transition-all
                  ${isActive("/about-us")
                    ? "bg-[#a6a6a6]/35 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                    : "hover:bg-[#a6a6a6]/30 hover:scale-[1.04]"
                  }`}>
                  About Us
                </li>
              </Link>

              <Link href="/events">
                <li className={`px-[10px] py-[2px] rounded-full duration-200 transition-all
                  ${isActive("/events")
                    ? "bg-[#a6a6a6]/35 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                    : "hover:bg-[#a6a6a6]/30 hover:scale-[1.04]"
                  }`}>
                  Events
                </li>
              </Link>

              <li
                ref={membersRef}
                onClick={toggleMembers}
                className={`z-20 group relative flex flex-col xl:flex-row gap-1 px-[10px] py-[2px] cursor-pointer rounded-[25px] duration-200 transition-all
                  ${isActive("/executives") || isActive("/committee")
                    ? "bg-[#a6a6a6]/35 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                    : "hover:bg-[#a6a6a6]/30 hover:scale-[1.04]"
                  }
                  ${membersOpen ? "bg-[#a6a6a6]/30 scale-[1.04]" : ""}
                `}
              >
                {/* Label row */}
                <div className="flex flex-row items-center gap-1 whitespace-nowrap justify-end xl:justify-start">
                  Members
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`size-4 transition-transform duration-200 ${membersOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  
                </div>

                {/* Submenu — inline on mobile, absolute on xl */}
                <ul
                  className={`
                    ${membersOpen ? "flex" : "hidden"}
                    flex-col gap-1 xl:gap-3 text-left
                    whitespace-normal xl:whitespace-nowrap
                    xl:absolute xl:shadow-[0_5px_15px_rgba(255,255,255,0.3)]
                    xl:bg-[#011638]/90 xl:backdrop-blur-sm
                    p-1 xl:p-4 xl:rounded-[30px]
                    xl:-left-5 xl:top-8 xl:w-40 xl:text-center
                  `}
                >
                  <li className="hover:underline">
                    <Link href="/committee">Committees</Link>
                  </li>
                  <li className="hover:underline">
                    <Link href="/executives">Executives</Link>
                  </li>
                </ul>
              </li>

              {/*
                Academics dropdown
                — On mobile: submenu renders as normal flow (no absolute),
                  so it's never clipped by the scrollable ul.
                — On xl: submenu is absolute-positioned as before.
              */}
              <li
                ref={academicsRef}
                onClick={toggleDropdown}
                className={`z-20 group relative flex flex-col xl:flex-row gap-1 cursor-pointer rounded-[25px] duration-200 transition-all xl:mb-0 mb-3
                  ${isActive("/thesis") || isActive("/survey")
                    ? "bg-[#a6a6a6]/35 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                    : "hover:bg-[#a6a6a6]/30 hover:scale-[1.04]"
                  }
                  ${academicsOpen ? "bg-[#a6a6a6]/30 scale-[1.04]" : ""}
                `}
              >
                <span className="animate-shine px-[10px] py-[2px]">
                {/* Label row */}
                <div className="flex flex-row items-center gap-1 whitespace-nowrap justify-end xl:justify-start">
                  Academics
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`size-4 transition-transform duration-200 ${academicsOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  
                </div>
                </span>
                {/* Submenu — inline on mobile, absolute on xl */}
                <ul
                  className={`
                    ${academicsOpen ? "flex" : "hidden"}
                    flex-col gap-1 xl:gap-3 text-left
                    whitespace-normal xl:whitespace-nowrap
                    xl:absolute xl:shadow-[0_5px_15px_rgba(255,255,255,0.3)]
                    xl:bg-[#011638]/90 xl:backdrop-blur-sm
                    p-1 xl:p-4 xl:rounded-[30px]
                    xl:-left-10 xl:top-8 xl:w-50 xl:text-center
                  `}
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
                    <li className={`px-[13px] py-[6px] rounded-full duration-200 transition-all ease-in-out bg-white/80 text-center text-black backdrop-blur-xs
                      ${isActive("/member-appli")
                        ? "shadow-[0_0_15px_white] bg-white/100 scale-[1.04]"
                        : "hover:shadow-[0_0_15px_white] hover:bg-white/100 hover:scale-[1.04]"
                      }`}>
                      Be A Member
                    </li>
                  </Link>

                  <Link href="/auth/login">
                    <li className="px-[13px] py-[6px] mr-[4px] hover:shadow-[0_0_25px_#d9b237] hover:scale-[1.04] hover:bg-[#d9b237] text-center ease-in-out duration-200 transition-all rounded-[50px] text-xl text-white bg-[#d9b237]/85 backdrop-blur-xs cursor-pointer items-center justify-center">
                      Login
                    </li>
                  </Link>
                </>
              ) : (
                /* 2. If user IS found, show Dashboard and Logout */
                <div className="flex xl:flex-row flex-col xl:items-center xl:justify-center justify-end gap-2 text-right p-[4px] pl-[6px] mr-0.5 rounded-[50px] bg-white/0 xl:bg-white/80 duration-200 transition-all ease-in-out text-center xl:text-black text-white xl:backdrop-blur-xs xl:hover:bg-white/100 xl:hover:scale-[1.04]">
                  <Link href="/dashboard">
                    <li
                      className={`px-[13px] py-[6px] xl:py-[4px] rounded-[50px] duration-200 transition-all xl:text-black text-black bg-white/80 text-center backdrop-blur-xs xl:bg-
                        ${isActive("/dashboard")
                          ? "shadow-[0_0_15px_white] xl:shadow-0 xl:bg-[#a6a6a6]/35 xl:hover:bg-[#a6a6a6]/40 scale-[1.04]"
                          : "hover:bg-[#a6a6a6]/30 xl:bg-[#a6a6a6]/35 hover:scale-[1.04]"
                        }`}
                    >
                      Dashboard
                    </li>
                  </Link>

                  <li
                    onClick={handleLogout}
                    className="text-center cursor-pointer rounded-[50px] py-[6px] bg-red-500/60 xl:text-white text-white xl:text-red-500 duration-200 transition-all px-[13px] py-[4px] xl:hover:bg-red-500/90 xl:hover:scale-[1.04]"
                  >
                    Logout
                  </li>
                </div>
              )}
            </ul>
          </div>

          <div className={`
          flex flex-row 
          shadow-[0_0_15px_rgba(255,255,255,0.3)]
          items-center justify-center 
          xl:hidden transition-all duration-200 ease-in-out 
          rounded-full p-3 max-h-full max-w-fit
          bg-[#011638]/70 backdrop-blur-sm
          ring-0
          ${isOverHero ? "ring-2 ring-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]" : ""}
          `}>
            {/* hamburger */}
            <svg
              onClick={toggleMenu}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`duration-200 size-8 xl:hidden cursor-pointer ${menuOpen ? "hidden" : ""}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>

            {/* close icon */}
            <svg
              onClick={toggleMenu}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`duration-200 size-8 xl:hidden cursor-pointer ${menuOpen ? "" : "hidden"}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>

        </div>
      </nav>

      <style jsx> 
        {`
          @keyframes occasional-shine {
            0% { transform: translateX(-150%) skewX(-30deg); }
            100% { transform: translateX(150%) skewX(-30deg); }
          }

          .animate-shine {
            position: relative;
            overflow: hidden;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
          }

          .animate-shine::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
            animation: occasional-shine 6s infinite;
          }
        `}
      </style>

    </div>
    <div className={`${isActive('/') ? "hidden" : "fixed"} bg-[#fbfaf8] top-0 z-[10000] h-14 min-w-[1920px] left-1/2 -translate-x-1/2`}
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}>
    </div>
    </>
  );
}