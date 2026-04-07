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
    <div>
      <div
        className={`fixed right-8 absolute z-50 flex flex-col items-end group transition-opacity duration-300 bottom-[-3] md:bottom-[-6] md:right-8 
        ${isOpen ? "hidden" : "block"} `}
      >
        <Image
          src="/images/Handsmol.png"
          width={1272}
          height={223}
          alt="hehe"
          className="kidla-hands md:w-25 w-11"
        />
      </div>
      <div
        className={`fixed bottom-2 right-5 md:bottom-4 md:right-4 z-40 flex flex-col items-end group 
        ${isOpen ? "is-open" : "huh"}`}
      >
        <KidlaTalk isParentOpen={isOpen} />

        <button
          onClick={onClick}
          id="kidla"
          className={`h-30 w-17 lg:w-33 lg:h-45 md:w-33 md:h-45  ${isOpen ? "modal-open" : ""}`}
        ></button>
      </div>
    </div>
  );
}
