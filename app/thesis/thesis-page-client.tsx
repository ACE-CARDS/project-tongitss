"use client";

import { useState, useEffect } from "react";
import LoadingState from "@/components/mainLoadingState";

export default function ThesisPageClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return <>{children}</>;
}