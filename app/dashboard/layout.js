//temporary protection kasi aaralin ko pa how to make protected routes hehehehehehe

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // if (error || !session) {
      //   console.log("No session found, redirecting...");
      //   router.push("/auth/login");
      // } else {
      //   setIsAuthenticated(true);
      // }
      setIsLoading(false);
    };

    checkUser();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#011638]">
          <p>wait lang...</p>
        </div>
      </div>
    );
  }

  // return isAuthenticated ? <>{children}</> : null;
  return <>{children}</>;
}
