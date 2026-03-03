"use client";
export default function Kidla({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-white font-bold py-2 px-4 rounded"
    ></button>
  );
}
