"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar";
import Popup from "@/components/pop-up";
import Kidla from "@/components/kidlaButton";
import KidlaDialogue from "@/components/kidlaDialogue";

export default function Home() {
  const [isModalShowing, setIsModalShowing] = useState(false);
  const [isDialogueShowing, setIsDialogueShowing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsModalShowing(true);
  }, []);

  useEffect(() => {
    setIsDialogueShowing(false);
  }, []);

  return (
    <div className="">
      <NavBar />
      <Popup
        isShowing={isModalShowing}
        onClose={() => setIsModalShowing(false)}
      />
      <KidlaDialogue
        isShowing={isDialogueShowing}
        onClose={() => setIsDialogueShowing(false)}
        onAnnouncements={() => {
          setIsDialogueShowing(false);
          setIsModalShowing(true);
        }}
        onRedirectMemApp={() => {
          setIsDialogueShowing(false);
          router.push("/events");
        }}
      />
      <main className="">
        <section
          id="hero"
          className="justify-center items-center text-center py-20 bg-red-500 h-screen"
        >
          <h1 className="text-3xl font-bold">Welcome to ACE CARDS!</h1>
          <p className="text-lg mt-4">
            This is the home page of our card game application.
          </p>
        </section>

        <Kidla
          onClick={() => setIsDialogueShowing((prev) => !prev)}
          isDialogueShowing={isDialogueShowing}
        />

        <section
          id="wow"
          className="justify-center items-center text-center py-20 bg-yellow-500 h-screen"
        >
          <h1 className="text-3xl font-bold">Welcome to ACE CARDS!</h1>
          <p className="text-lg mt-4">
            This is the home page of our card game application.
          </p>
        </section>
      </main>
    </div>
  );
}
