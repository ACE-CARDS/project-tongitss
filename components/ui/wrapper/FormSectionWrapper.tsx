"use client";

import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <div className="mb-6">
      <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-xl">
        <h2 className="text-lg font-oswald font-semibold">
          {title}
        </h2>
      </div>

      <div className="border-2 border-t-0 border-[#011638] rounded-b-xl p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}