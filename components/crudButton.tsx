import { useEffect, useRef, useState } from "react";
import Link from "next/link";


export default function CrudButton() {
  const [crudOpen, setCrudOpen] = useState(false);
  const crudRef = useRef<HTMLDivElement>(null);

  const toggleCrud = () => {
    setCrudOpen(!crudOpen);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        crudRef.current &&
        !crudRef.current.contains(event.target as Node) &&
        crudOpen
      ) {
        setCrudOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("wheel", handleClickOutside);
    document.addEventListener("scroll", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("wheel", handleClickOutside);
        document.removeEventListener("scroll", handleClickOutside);
    };
  }, []);
  return (
    <>
      <div ref={crudRef} className="fixed bg-[#0b1763] hover:bg-[#0b1763]/90 p-3 rounded-full lg:bottom-8 lg:right-8 md:bottom-4 md:right-4 bottom-2 right-2 flex flex-col gap-2">
            <svg
              onClick={toggleCrud}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className={`duration-200 ease-in-out size-10 3xl:size-15 text-white cursor-pointer ${crudOpen ? 'rotate-0' : 'rotate-45'}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
      </div>

      <div ref={crudRef} className={`bg-[#0b1763] w-fit p-2 rounded-4xl visible fixed lg:bottom-[110px] lg:right-8 md:bottom-[90px] bottom-[80px] md:right-4 right-2 flex flex-col gap-2 ${crudOpen ? 'opacity-100 visible scale-100' : 'scale-0 opacity-0 invisible'} origin-bottom-right transition-all duration-200 ease-in-out`}>
        <Link href="/dashboard/add" className="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600">
          New Announcement 
        </Link>
      </div>
    </>
  );
}