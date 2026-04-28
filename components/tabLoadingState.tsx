"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function TabLoadingState() {
  const [dots, setDots] = useState("."); // Start with 1 dot

  // Interval
  useEffect(() => {
    const interval = setInterval(() => { 
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        if (prev === "...") return ".";  
        return ".";
      });
    }, 500); // 500ms per change

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-[500px] flex items-center justify-center">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative flex flex-col items-center justify-center gap-1">
          {/* Ellipsis sa taas ng image */}
          <div className="text-center min-h-[48px]">
            <p className="text-3xl md:text-4xl font-bold tracking-wider" style={{ color: '#141414' }}>
              {dots}
            </p>
          </div>
          
          {/* Image, for now just one pic but I wanna try randomizing the graphics soon (if may time pa) */}
          <div className="relative w-[40vw] h-[40vw] max-w-[320px] max-h-[320px] min-w-[180px] min-h-[180px]">
            <Image
              src="/images/Search.png"
              alt="Loading"
              fill
              sizes="(max-width: 768px) 40vw, 320px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}