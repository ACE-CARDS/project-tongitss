"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NavBar from "@/components/navbar";
import Popup from "@/components/pop-up";
import Kidla from "@/components/kidlaButton";
import KidlaDialogue from "@/components/kidlaDialogue";
import Footer from "@/components/footer";

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
      <section id="hero" className="py-50 bg-[#eff0f2] h-screen">
        <div className="flex flex-col lg:flex-row items-center justify-between pl-20 lg:pl-20 relative h-full">

          <div className="flex-1 relative z-10">
            <h1 className="text-[#011638] text-6xl lg:text-9xl font-extrabold -mr-10 lg:-mr-40 " 
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>ACE CARDS</h1>
            <div className="space-y-2 mt-4 text-lg lg:text-xl">
              <div>lorem ipsum</div>
              <div>lorem ipsum</div>
              <div>lorem ipsum</div>
              <div>lorem ipsum</div>
            </div>
          </div>

          <div className="flex-1 relative z-0 mt-10 lg:mt-0">
            <img  
              src="/placeholder1.jpg"  
              alt="Ace Cards Image"
              width={650}            
              height={600}           
              className="object-cover rounded-xl shadow-lg" 
            />
          </div>

         </div>
      </section>
        <Kidla
          onClick={() => setIsDialogueShowing((prev) => !prev)}
          isDialogueShowing={isDialogueShowing}
        />
        <section id="wow" className="justify-center items-center text-center py-20 bg-blue-500 h-screen">
          <h1 className="text-3xl font-bold">[NEWS AND MEDIA]</h1>
        </section>

        <section className="relative bg-white h-screen flex items-center justify-center overflow-hidden">

          <div className="text-center z-10">
            <h1 className="text-[200px] font-bold text-[#011638]">67</h1>
            <h1 className="text-9xl font-bold text-[#011638]">EVENTS</h1>
            <button className="mt-7 px-15 py-2 border border-gray-900 rounded-full hover:bg-gray-100 transition">
              →
            </button>
          </div>

          <div className="absolute top-10 left-15 rotate-12 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute top-15 left-90 -rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute top-15 right-90 -rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute top-15 right-20 rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute bottom-15 left-30 rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute bottom-16 right-35 -rotate-12 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
