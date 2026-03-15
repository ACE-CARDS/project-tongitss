"use client";
import Image from "next/image";

export default function Kidla({
  onClick,
  isModalOpen,
  isDialogueShowing,
}: {
  onClick: () => void;
  isModalOpen?: boolean;
  isDialogueShowing?: boolean;
}) {
  const isOpen = isModalOpen ?? isDialogueShowing ?? false;

  return (
    <button
      onClick={onClick}
      className={`p-0 h-30 w-17 lg:w-33 lg:h-45 md:w-33 md:h-45 ${isOpen ? "modal-open" : ""}`}
      id="kidla"
    ></button>
  );
}
