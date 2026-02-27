"use client";

import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);

    const openIcon = document.querySelector("svg:nth-child(1)");
    const closeIcon = document.querySelector("svg:nth-child(2)");

    if (openIcon && closeIcon) {
      openIcon.classList.toggle("hidden");
      closeIcon.classList.toggle("hidden");
    }
  }

  return (
    <nav className="w-full py-4 px-8 bg-blue-500 text-white fixed">
      <div className="flex flex-row items-center justify-between w-full gap-4">
        
        <div className="text-lg font-bold">ACE CARDS</div>

        <div className="flex flex-row">
          <div id="mobile-menu" className={`duration-200 ease-in-out fixed left-0 top-15 bg-blue-500 text-white min-h-[30vh] w-full md:static md:min-h-fit md:w-auto md:block flex items-center justify-center ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"} md:opacity-100 md:visible md:flex`}>
            <ul className="flex md:flex-row flex-col gap-4 items-end right-5 absolute">
              <li className="hover:underline">
                <Link href="/">Home</Link>
              </li>

              <li className="hover:underline">
                <Link href="/about-us">About Us</Link>
              </li>

              <li className="hover:underline">
                <Link href="/events">Events</Link>
              </li>

              <li>
                Academics
                <ul className="hover:underline md:hidden hidden">
                  <li>
                    <Link href="/research">Research Surveys</Link>
                  </li>
                  <li>
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
            <svg onClick={() => toggleMenu()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="duration-200 size-6 md:hidden cursor-pointer">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>

            <svg onClick={() => toggleMenu()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="duration-200 size-6 hidden cursor-pointer">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}