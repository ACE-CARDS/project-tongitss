import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function CrudButton() {
  const [crudOpen, setCrudOpen] = useState(false);
  const crudRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleCrud = () => {
    setCrudOpen(!crudOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        crudRef.current &&
        !crudRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        crudOpen
      ) {
        setCrudOpen(false);
      }
    };

    const handleCloseOnScroll = () => {
      if (crudOpen) {
        setCrudOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("wheel", handleCloseOnScroll);
    document.addEventListener("scroll", handleCloseOnScroll);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("wheel", handleCloseOnScroll);
      document.removeEventListener("scroll", handleCloseOnScroll);
    };
  }, [crudOpen]);

  return (
    <>
      <div
        ref={crudRef}
        className="z-50 fixed bg-[#0b1763] hover:bg-[#0b1763]/90 p-3 rounded-full lg:bottom-8 lg:right-8 md:bottom-4 md:right-4 bottom-2 right-2 flex flex-col gap-2 cursor-pointer shadow-lg transition-all duration-200"
        onClick={toggleCrud}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className={`duration-200 ease-in-out size-10 3xl:size-15 text-white cursor-pointer ${crudOpen ? "rotate-0" : "rotate-45"}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>

      {/* Options */}
      <div
        ref={menuRef}
        className={`z-50 w-fit p-2 rounded-xl fixed lg:bottom-[110px] lg:right-8 md:bottom-[90px] bottom-[80px] md:right-4 right-2 flex flex-col gap-2 ${
          crudOpen ? "opacity-100 visible scale-100" : "scale-0 opacity-0 invisible"
        } origin-bottom-right transition-all duration-200 ease-in-out`}
      >
        <Link
          href="/dashboard/add/announcement"
          className="bg-[#0b1763] text-white py-2 px-4 rounded-full hover:bg-[#2f3f61] whitespace-nowrap shadow-md transition-all duration-200 hover:scale-105 text-center"
        >
          Add Announcement
        </Link>
        <Link
          href="/dashboard/add/news-media"
          className="bg-[#0b1763] text-white py-2 px-4 rounded-full hover:bg-[#2f3f61] whitespace-nowrap shadow-md transition-all duration-200 hover:scale-105 text-center"
        >
          Add News & Media
        </Link>
        <Link
          href="/dashboard/add/event"
          className="bg-[#0b1763] text-white py-2 px-4 rounded-full hover:bg-[#2f3f61] whitespace-nowrap shadow-md transition-all duration-200 hover:scale-105 text-center"
        >
          Add Event
        </Link>
      </div>
    </>
  );
}