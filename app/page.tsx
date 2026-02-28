"use client";

import { useState } from "react";
import Image from "next/image";
import NavBar from "@/components/navbar";
import Modal from "@/components/modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        <section>
          <button
            onClick={() => setIsModalOpen(true)}
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

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-gray-600 mt-2">heloooooooooooooooooo</p>
        </Modal>
      </main>
    </div>
  );
}
