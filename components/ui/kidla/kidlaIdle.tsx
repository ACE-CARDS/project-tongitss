"use client";
import { useState, useEffect } from "react";

const dialogue = [
  "Hey there!",
  "Psst...",
  "Need help?",
  "Click me!",
  "Hi!",
  "Wow!",
  "We're no strangers to love",
  "Helloooooooooooo",
];

export default function KidlaTalk({ isParentOpen }: { isParentOpen: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (isParentOpen) {
      setIsVisible(false);
      return;
    }

    const showPhrase = () => {
      const randomPhrase =
        dialogue[Math.floor(Math.random() * dialogue.length)];
      setText(randomPhrase);

      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 10000);
      const nextDelay = Math.floor(Math.random() * 10000) + 10000;
      timeoutId = setTimeout(showPhrase, nextDelay);
    };

    let timeoutId = setTimeout(showPhrase, 4000);
    return () => clearTimeout(timeoutId);
  }, [isParentOpen]);

  return (
    <div
      className={`mb-[2px] px-3 py-1 z-40 bg-[#fbfaf8] text-[10px] lg:text-xs md:text-xs font-ubuntu-mono rounded-lg shadow-lg border border-gray-200 transition-all duration-500
        ${isVisible ? "opacity-100 translate-y-0 scale-100 bubble-float" : "opacity-0 translate-y-2 scale-90 pointer-events-none"}`}
    >
      {text}
      <div className="absolute -bottom-1 right-6 w-2 h-2 bg-[#fbfaf8] border-r border-b border-gray-200 rotate-45"></div>
    </div>
  );
}
