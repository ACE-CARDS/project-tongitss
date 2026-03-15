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
      className={`p-0 w-20 lg:w-30 md:w-30 ${isOpen ? "modal-open" : ""}`}
      id="kidla"
    >
      <Image src="/images/D2.png" alt="" width={2278} height={3719} />
    </button>
  );
}
