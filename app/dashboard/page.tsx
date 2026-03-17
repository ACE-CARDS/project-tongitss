"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Calendar from "@/components/calendar";

export default function Home() {
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isDialogueShowing, setIsDialogueShowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsDialogueShowing(false);
  }, []);

  useEffect(() => {
    const seenPopup = sessionStorage.getItem("seenPopup");

    if (!seenPopup) {
      setIsModalShowing(true);
      sessionStorage.setItem("seenPopup", "true");
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen">
      <NavBar />

      <div className="flex flex-col p-4 h-[30%] w-[50%]">
        <Calendar />
      </div>

      <Footer />
    </div>
  );
}
