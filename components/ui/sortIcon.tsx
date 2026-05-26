interface SortIconProps {
  field: string;
  sortField: string | null;
  sortOrder: "asc" | "desc" | null;
}

export default function SortIcon({ field, sortField, sortOrder }: SortIconProps) {
  const isCurrentField = sortField === field;

  return (
    <div className="flex flex-col gap-0.5" aria-hidden="true">
      {/* Up Arrow */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className={`w-3.5 h-3.5 -mb-1 ${
          isCurrentField && sortOrder === "asc" ? "text-[#eec643]" : "text-[#eff0f2]/30"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 15.75 7.5-7.5 7.5 7.5"
        />
      </svg>

      {/* Down Arrow */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className={`w-3.5 h-3.5 -mt-1 ${
          isCurrentField && sortOrder === "desc" ? "text-[#eec643]" : "text-[#eff0f2]/30"
        }`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </div>
  );
}