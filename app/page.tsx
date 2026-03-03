"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import NavBar from "@/components/navbar";
import Popup from "@/components/pop-up";
import Kidla from "@/components/kidlaButton";

export default function Home() {
  const [isModalShowing, setIsModalShowing] = useState(false);

  useEffect(() => {
    setIsModalShowing(true);
  }, []);

  return (
    <div className="">
      <NavBar />
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

        <Kidla onClick={() => setIsModalShowing(true)} />
        <section>
          <button
            onClick={() => setIsModalShowing(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          >
            Button
          </button>
        </section>

        <section
          id="wow"
          className="justify-center items-center text-center py-20 bg-yellow-500 h-screen"
        >
          <h1 className="text-3xl font-bold">Welcome to ACE CARDS!</h1>
          <p className="text-lg mt-4">
            This is the home page of our card game application.
          </p>
        </section>

        <Popup
          isShowing={isModalShowing}
          onClose={() => setIsModalShowing(false)}
        />
      </main>
    </div>
  );
}
