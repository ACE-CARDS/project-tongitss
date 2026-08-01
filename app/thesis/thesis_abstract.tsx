'use client';

// Main export
export default function ThesisAbstract({ abstract }: { abstract: string | null }) {

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
        <div className="flex flex-end flex-col">
          <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed line-clamp-3 break-words overflow-wrap-anywhere"> {/* Display first 3 lines */}
            {abstract}
          </p>
          <span className="text-[#0d21a1] text-xs font-ubuntu-mono mt-1 ml-auto">
            Read more
          </span>
        </div>
    </div>
  );
}