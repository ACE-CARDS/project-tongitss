"use client";

import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";

export default function Committee() {
  return (
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen">
      <NavBar />

      <div className="m-5 w-200 mx-auto">
        <Image
          src="/images/committee-organization.png"
          alt="Current Month"
          width={1238}
          height={613}
          className="mx-auto"
        />
      </div>
      <Footer />
    </div>
  );
}
