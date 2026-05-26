import React from "react";
import Link from "next/link";

interface TableActionsProps {
  item: any;
  onDeleteClick: (item: any) => void;
  // Both of these are now optional!
  onEditClick?: (item: any) => void; 
  editHref?: string; 
}

export default function TableActions({ 
  item, 
  onEditClick, 
  onDeleteClick, 
  editHref 
}: TableActionsProps) {
  
  // Shared styling for the edit action element
  const editClassName = "text-[#0d21a1] hover:scale-110 transition-transform cursor-pointer";

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Dynamic Edit Element: Renders a Next.js Link OR a standard state Button */}
      {editHref ? (
        <Link href={editHref} className={editClassName} aria-label="Edit item">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
        </Link>
      ) : (
        <button 
          onClick={() => onEditClick?.(item)} 
          className={editClassName} 
          aria-label="Edit item"
        >
          <svg 
            className="w-5 h-5"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      {/* Delete Button (Always consistent) */}
      <button
        onClick={() => onDeleteClick(item)}
        className="text-red-600 hover:scale-110 transition-transform cursor-pointer"
        aria-label="Delete item"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24">
          <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="1.5" 
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    </div>
  );
}