"use client";

import { useState, useEffect, Suspense } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import BackButton from "@/components/backButton";
import LoadingState from "@/components/mainLoadingState";

function CommitteeContent() {
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

  return (
    <>
    <NavBar />
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen">
              <div className="container mx-auto py-8 px-4 max-w-7xl">
                <BackButton />
              </div>
      <div className="m-5 w-250 mx-auto">
        <Image
          src="/images/committee-organization.png"
          alt="Current Month"
          width={1238}
          height={613}
          className="mx-auto"
        />
      </div>
    </div>
    <Footer />
    </>
  );
}

export default function Committee() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CommitteeContent />
    </Suspense>
  );
}