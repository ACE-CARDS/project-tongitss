"use client";

import Link from "next/link";

interface FormActionsProps {
  cancelHref?: string;
  onCancelClick?: () => void;
  cancelLabel?: string;

  onSubmitClick?: () => void;
  submitLabel: string;
  submittingLabel?: string;
  
  isStatus?: boolean;
  noChange?: boolean;
  
  variant: "blue" | "red";
  showBorder?: boolean;
}

export default function FormActions({
  cancelHref,
  onCancelClick,
  cancelLabel = "Cancel",
  onSubmitClick,
  submitLabel,
  submittingLabel,
  isStatus = false,
  noChange,
  variant,
  showBorder = true,
}: FormActionsProps) {
  
  const primaryBtnClass = variant === "red" ? "form_btn-red" : "form_btn-blue";
  
  return (
    <div 
      className={`flex items-center justify-end gap-3 ${
        showBorder ? "pt-4 border-t border-[#e0e7ff]" : ""
      }`}
    >
      {cancelHref ? (
        <Link 
          href={cancelHref} 
          className="form_btn-cancel"
          onClick={onCancelClick}
        >
          {cancelLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCancelClick}
          disabled={isStatus}
          className="form_btn-cancel"
        >
          {cancelLabel}
        </button>
      )}

      {/* Main Action Button */}
      <button
        type={onSubmitClick ? "button" : "submit"}
        onClick={onSubmitClick}
        disabled={isStatus || noChange}
        className={primaryBtnClass}
      >
        {isStatus ? submittingLabel : submitLabel}
      </button>
    </div>
  );
}