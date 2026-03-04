"use client";
import Image from "next/image";

export default function Kidla({
  onClick,
  isModalOpen,
}: {
  onClick: () => void;
  isModalOpen: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-0 w-30 ${isModalOpen ? "modal-open" : ""}`}
      id="kidla"
    >
      <Image src="/images/D2.png" alt="" width={2278} height={3719} />
    </button>
  );
}
