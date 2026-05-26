"use client";

import { ReactNode } from "react";
import BackButton from "@/components/ui/backButton"; // Adjust path to your BackButton

interface FormWrapperProps {
  title: string;
  children: ReactNode;
  backHref?: string;
}

export default function FormWrapper({
  title,
  children,
  backHref,
}: FormWrapperProps) {
  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header Grid containing the Back Button and Page Title */}
      <div className="flex flex-col gap-4 mb-6">
        <BackButton
          href={backHref}
          className="!mb-0"
        />
      </div>

      {/* Form Card Body */}
      <div className="bg-[#fbfaf8] rounded-xl shadow-xl border border-[#e0e7ff] p-6">
        <h1 className="text-2xl sm:text-3xl font-oswald font-bold text-[#011638] mb-6">
          {title}
        </h1>
        {children}
      </div>
    </main>
  );
}