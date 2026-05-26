"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FilterDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const FilterDropdown = ({ 
  value, 
  options, 
  onChange, 
  className = "" 
}: FilterDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 1. Packaged layout math inside a useCallback to safely reference across effects
  const updateDirection = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuExpectedHeight = 260; // max-h-60 (240px) + gap/margins (20px)

    // If space below is too tight, flip it up. Otherwise, default down.
    if (spaceBelow < menuExpectedHeight) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
  }, []);

  // 2. Handle active window resizing / zooming behaviors while open
  useEffect(() => {
    if (!open) return;

    // Run the check instantly upon open flag toggling
    updateDirection();

    // Set up window layout change listener (fires continuously during user zoom actions)
    window.addEventListener("resize", updateDirection);
    return () => window.removeEventListener("resize", updateDirection);
  }, [open, updateDirection]);

  // Handle click outside to close menu frame
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const selectedLabel = selectedOption ? selectedOption.label : value;

  return (
    <div ref={ref} className={`relative w-full md:w-auto z-[20] font-sans ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer w-full px-5 py-2.5 bg-white border border-[#011638] rounded-xl text-[#011638] font-bold font-ubuntu-mono uppercase tracking-widest text-sm shadow-sm hover:shadow-md transition flex items-center justify-between min-w-[160px]"
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ml-3 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute right-0 md:left-0 w-full min-w-[160px] bg-white border border-[#011638] rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${
            openUpward 
              ? "bottom-full mb-2 origin-bottom" 
              : "top-full mt-2 origin-top"
          }`}
        >
          {/* Using fluid max-h-[35vh] mixed with desktop sm:max-h-60 keeps height robust on massive zoom settings */}
          <ul className="py-1 max-h-[40vh] overflow-y-auto custom-scrollbar-blue">
            {options.map((o) => (
              <li
                key={o.value}
                onClick={() => {
                  if (o.disabled) return;
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`px-5 py-3 transition-colors text-sm font-bold font-ubuntu-mono uppercase tracking-widest ${
                  o.disabled
                    ? "opacity-40 bg-slate-50 text-slate-500 cursor-not-allowed"
                    : o.value === value
                    ? "bg-[#011638] text-white cursor-pointer"
                    : "hover:bg-slate-100 text-[#011638] cursor-pointer"
                }`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;