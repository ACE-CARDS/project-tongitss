'use client';

import { useState } from 'react';

// Main export
export default function ThesisAbstract({ abstract }: { abstract: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  // CASE 1: If no abstract
  if (!abstract) {
    return (
      <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed min-h-[63px]"> {/* placeholder */}
        No abstract available
      </p>
    );
  }

  // CASE 2: Short Abstract
  if (abstract.length <= 200) {
    return (
      <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed min-h-[63px] break-words overflow-wrap-anywhere"> {/* Display normally all */}
        {abstract}
      </p>
    );
  }

  // CASE 3: Long Abstract -> Read More option
  return (
    <div>
      {/* Collapse or expand depend on isOpen state */}
      {!isOpen ? (
        // COLLAPSED
        <div>
          <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed line-clamp-3 break-words overflow-wrap-anywhere"> {/* Display first 3 lines */}
            {abstract}
          </p>
          <button
            onClick={() => setIsOpen(true)} // Read more button if clicked sets isOpen to true -> expand
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors"
          >
            Read more →
          </button>
        </div>
      ) : (
        // EXPANDED
        <div>
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed max-h-48 overflow-y-auto pr-2 break-words overflow-wrap-anywhere custom-scrollbar-blue"> {/* Scroll full abstract */}
            {abstract}
          </div>
          
          {/* "Read less" button */}
          <button
            onClick={() => setIsOpen(false)} // isOpen to false
            className="text-[#0d21a1] text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors"
          >
            Read less ↑
          </button>
        </div>
      )}
    </div>
  );
}