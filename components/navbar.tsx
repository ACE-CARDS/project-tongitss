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
    <nav className="w-full h-20 px-8 bg-[#011638] text-white sticky top-0 z-50">
      <div className="flex flex-row items-center justify-between w-full h-full gap-8">
        {/* <div className="flex flex-row bg-red-500"> */}
        <a className="flex flex-row items-center h-full gap-2" href="/">
          <Image
            src="/assets/logos/ACE CARDS logo.png"
            alt="ACE CARDS Logo"
            className="w-10 h-10 flex-shrink-0"
            width={40}
            height={40}
          ></Image>
          <div className="flex flex-col justify-center h-full gap-0">
            {title && title !== siteName && (
              <div className="text-sm opacity-75 font-bold leading-none title">
                {siteName}
              </div>
            )}
            <div className="text-3xl font-bold leading-none">
              {title || siteName}
            </div>
          </div>
        </a>
        {/* </div> */}

        <div className="flex flex-row h-full items-center">
          <div
            id="mobile-menu"
            className={`duration-200 ease-in-out fixed left-0 top-20 bg-[#011638] text-white w-full lg:static lg:h-full lg:w-auto lg:block flex text-right justify-end ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"} lg:opacity-100 lg:visible lg:flex`}
          >
            <ul className="flex lg:flex-row flex-col gap-6 lg:gap-8 lg:h-full lg:items-center py-6 lg:py-0 px-8 lg:px-0">
              <li className="hover:underline">
                <Link href="/">Home</Link>
              </li>

              <li className="hover:underline">
                <Link href="/about-us">About Us</Link>
              </li>

              <li className="hover:underline">
                <Link href="/events">Events</Link>
              </li>

              <li className="hover:underline">
                <Link href="/executives">Executives</Link>
              </li>

              <li
                ref={academicsRef}
                onClick={toggleDropdown}
                className="group relative flex-row flex gap-1 hover:underline cursor-pointer"
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
                  className={`${academicsOpen ? "visible" : "invisible"} absolute bg-[#011638] ease-in-out text-white p-4 rounded-lg lg:-left-10 -left-20 lg:top-8 top-5 w-50 gap-4 flex flex-col text-center`}
                >
                  <li className="hover:underline">
                    <Link href="/survey">Research Surveys</Link>
                  </li>
                  <li className="hover:underline">
                    <Link href="/thesis">Thesis Repository</Link>
                  </li>
                </ul>
              </li>

              <li className="hover:underline">
                <Link href="/member-appli">Be A Member</Link>
              </li>

              <li className="hover:underline">
                <Link href="/login">Log In</Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-4">
            {/* hamburger */}
            <svg
              onClick={toggleMenu}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`duration-200 size-6 lg:hidden cursor-pointer ${isOpen ? "hidden" : ""}`}
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
              className={`duration-200 size-6 lg:hidden cursor-pointer ${isOpen ? "" : "hidden"}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}
