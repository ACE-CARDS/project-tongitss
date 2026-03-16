"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

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
  const [isOpen, setIsOpen] = useState(false);
  const [academicsOpen, setAcademicsOpen] = useState(false);
  const academicsRef = useRef<HTMLLIElement>(null);

  const pathname = usePathname();
  // const title = routeTitles[pathname] || "";
  const title = pathname && pathname !== "/" ? routeTitles[pathname] || "" : "";
  const isActive = (path: string) => pathname === path;

  const toggleMenu = () => {
    setIsOpen((o) => !o);
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
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    // class="w-full  mx-auto mb-10 max-w-[1920px]
    <div className="sticky top-0 z-50">

      {/* Blur */}
      <div className="absolute inset-0 h-28 backdrop-blur-2xl bg-[#011638]/30 mask-[linear-gradient(to_bottom,black_20%,transparent)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative w-full mx-auto my-auto max-w-[1400px] top-3 h-16">
        <div className="flex flex-row items-center justify-between lg:px-8 px-2 w-full h-full lg:gap-4 gap-2 text-white ">
          {/* <div className="flex flex-row bg-red-500"> */}
          <a className="shadow-[0_5px_10px_#011638]/80 flex flex-row items-center h-full w-fit gap-2 rounded-[50px] px-4 pr-6 bg-[#011638]/70 border-[#011638]/35 border-3 backdrop-blur-sm hover:bg-[#011638]/80 transition-all duration-200 hover:scale-[1.04]" href="/">
            <Image
              src="/assets/logos/ACE CARDS logo.png"
              alt="ACE CARDS Logo"
              className="w-10 h-10 flex-shrink-0"
              width={40}
              height={40}
            ></Image>
            <div className="flex flex-col justify-center h-full gap-0 whitespace-nowrap">
              {title && title !== siteName && (
                <div className="text-sm opacity-75 font-bold leading-none title">
                  {siteName}
                </div>
              )}
              <div className="lg:text-3xl text-[22px] font-bold leading-none whitespace-nowrap">
                {title || siteName}
              </div>
            </div>
          </a>
          {/* </div> */}

          <div className={`absolute text-lg lg:right-[30px] right-[10px] top-[80px] flex flex-row 2xl:flex-row text-right 2xl:px-[13px] 2xl:items-end 2xl:h-full 2xl:static 2xl:w-full w-fit justify-end shadow-[0_5px_10px_#011638]/80 bg-[#011638]/70 border-[#011638]/34 border-3 backdrop-blur-sm rounded-[50px] pl-2 2xl:gap-4 gap-2 duration-200 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"} 2xl:opacity-100 2xl:visible`}>
            <ul className="gap-2 flex 2xl:flex-row flex-col 2xl:h-full 2xl:items-center py-6 2xl:py-0 px-4 2xl:px-0 whitespace-nowrap">
              <Link href="/">
                <li className={`px-[13px] py-[4px] rounded-[50px] border-2 duration-200 transition-all
                ${isActive("/") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  Home
                </li>
              </Link>

              <Link href="/about-us">
                <li className={`px-[13px] py-[4px] rounded-[50px] border-2 duration-200 transition-all
                ${isActive("/about-us") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  About Us
                </li>
              </Link>

              <Link href="/events">
                <li className={`px-[13px] py-[4px] rounded-[50px] border-2 duration-200 transition-all
                ${isActive("/events") 
                  ? "bg-[#a6a6a6]/35 border-[#a6a6a6]/15 hover:bg-[#a6a6a6]/40 scale-[1.04]"
                  : "border-[#a6a6a6]/0 hover:bg-[#a6a6a6]/30 hover:border-[#a6a6a6]/10 hover:scale-[1.04]"
                }`}>
                  Events
                </li>
              </Link>

              <Link href="/executives">
                <li className={`px-[13px] py-[4px] rounded-[50px] border-2 duration-200 transition-all
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
                className={`z-20 group relative flex-row flex gap-1 cursor-pointer px-[15px] py-[4px] rounded-[50px] border-2 duration-200 transition-all
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
                  className={`${academicsOpen ? "visible" : "invisible"} absolute shadow-[0_5px_10px_#011638]/80 bg-[#011638]/70 border-[#011638]/34 border-3 backdrop-blur-sm ease-in-out text-white p-4 rounded-[30px] 2xl:-left-10 -left-10 2xl:top-8 top-10 w-50 gap-4 flex flex-col text-center`}
                >
                  <li className="hover:underline">
                    <Link href="/survey">Research Surveys</Link>
                  </li>
                  <li className="hover:underline">
                    <Link href="/thesis">Thesis Repository</Link>
                  </li>
                </ul>
              </li>

              
              <Link href="/member-appli">
                <li className={`w-[140px] py-[8px] rounded-[50px] border-white/50  border-2 duration-200 transition-all ease-in-out bg-white/80 text-center text-black backdrop-blur-xs
                    ${isActive("/member-appli") 
                      ? "shadow-[0_0_15px_white] border-[#a6a6a6]/10 bg-white/100 scale-[1.04]"
                      : "hover:shadow-[0_0_15px_white] border-[#a6a6a6]/0 hover:border-[#a6a6a6]/10 hover:bg-white/100 hover:scale-[1.04]"
                    }`}>
                  Be A Member
                </li>
              </Link>

              <Link href="/login" >
                <li className="w-[140px] py-[8px] hover:shadow-[0_0_25px_#d9b237] hover:scale-[1.04] text-center ease-in-out duration-200 transition-all rounded-[50px] text-xl text-white bg-[#d9b237]/85 backdrop-blur-xs border-[#d9b237] border-2 cursor-pointer items-center justify-center">
                  Login
                </li>
              </Link>
            </ul>
          </div>

          <div className="flex items-center gap-4 shadow-[0_5px_10px_#011638]/80 bg-[#011638]/70 border-[#011638]/34 border-3 backdrop-blur-sm rounded-[50px] w-[70px] h-16 justify-center 2xl:hidden">
            {/* hamburger */}
            <svg
              onClick={toggleMenu}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`duration-200 size-8 2xl:hidden cursor-pointer ${isOpen ? "hidden" : ""}`}
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
              className={`duration-200 size-8 2xl:hidden cursor-pointer ${isOpen ? "" : "hidden"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>

          


          {/*shadow-[0_0_0px_#eec643] hover:shadow-[0_5px_20px_#eec643] ease-in-out duration-100 transition-all */}
        </div>
      </nav>
    </div>
  );
}
