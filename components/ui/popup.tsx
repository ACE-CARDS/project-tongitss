"use client";

import { useEffect, useRef, ReactNode } from "react";
import ModalBlur from "./modalBlur";

interface PopupProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl"; // Optional customizable width
  className?: string;
}

export default function Popup({ isOpen, title, onClose, children, maxWidth = "md", className }: PopupProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", // Your default dashboard standard
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // useEffect must be called before any conditional return
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (frameRef.current && !frameRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Don't render anything if popup is not open (after all hooks)
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <span className="z-[10000]">
        <ModalBlur onClose={onClose} />
      </span>

      <div className={`fixed inset-0 z-[10001] flex items-center justify-center ${className}`}>
        <div
          ref={frameRef}
          className={`bg-[#fbfaf8] w-full mx-4 shadow-2xl rounded-lg transition-all ${maxWidthClasses[maxWidth]}`}
        >
          {/* Visual Header Banner */}
          <div className="bg-[#011638] px-6 py-4 flex rounded-t-lg justify-between items-center">
            <h3 className="text-xl font-oswald font-bold text-[#fbfaf8]">
              {title}
            </h3>
            {/* Optional small close "X" in banner */}
            <button 
              onClick={onClose} 
              className="text-[#fbfaf8]/70 hover:text-[#fbfaf8] text-sm font-ubuntu-mono transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content Body Slot */}
          <div className="px-6 pb-6 pt-2 text-[#011638]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}