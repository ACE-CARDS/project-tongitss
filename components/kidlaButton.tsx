"use client";
import Image from "next/image";
import KidlaTalk from "./kidlaIdle";

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
    <div
      className={`fixed bottom-4 right-4 z-40 flex flex-col items-end group 
      ${isOpen ? "is-open" : "huh"}`}
    >
      <KidlaTalk isParentOpen={isOpen} />

      <button
        onClick={onClick}
        id="kidla"
        className={`h-30 w-17 lg:w-33 lg:h-45 md:w-33 md:h-45  ${isOpen ? "modal-open" : ""}`}
      ></button>
    </div>
  );
}
