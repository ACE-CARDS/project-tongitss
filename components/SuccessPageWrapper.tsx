"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function SuccessPageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Extract parent path from the current path
    const pathParts = pathname.split('/');
    const parentPath = `/${pathParts[1]}`; // Gets first folder after root
    
    // Store the return path for the back button
    sessionStorage.setItem('successReturnPath', parentPath);
    
  }, [pathname]);

  return <>{children}</>;
}