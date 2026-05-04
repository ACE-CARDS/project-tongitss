"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import NavBar from "@/components/navbar";

export default function LoadingState() {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);
  const [shadowIntensity, setShadowIntensity] = useState(0);
  const [shineIntensity, setShineIntensity] = useState(0);

  // Pulses
  useEffect(() => {
    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 8000; // 8 seconds
    const pulseCount = 4; // 4 pulses
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = (elapsed % duration) / duration;
      
      // Sinusoidal Wave
      const angle = progress * Math.PI * 2 * pulseCount;
      const sinValue = (Math.sin(angle) + 1) / 2; // Math.sin() create waves (0 → 1 → 0 → -1 → 0 and again)
      // Adding 1 and dividing by 2 turns it to: 0.5 → 1 → 0.5 → 0 → 0.5 (between 0 and 1)
      
      const newScale = 1 - (sinValue * 0.08); // Scale: 1 (peak) to 0.92 (valley) to 1 (next peak)
      const newOpacity = 1 - (sinValue * 0.3); // Opacity: 1 (peak) to 0.7 (valley) to 1 (next peak)
      const newShadowIntensity = sinValue * 15; // Shadow pulsing from 0 to 15px
      const newShineIntensity = sinValue;  // Shine strongest at peak 

      setScale(newScale);
      setOpacity(newOpacity);
      setShadowIntensity(newShadowIntensity);
      setShineIntensity(newShineIntensity);
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div 
      className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] min-h-[101vh] flex flex-col"
      style={{
        backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <NavBar />
      <div className="flex-1 flex items-center justify-center">
        <div className="relative flex flex-col items-center justify-center w-full">
          <div 
            className="relative transition-all duration-75 ease-linear mx-auto"
            style={{
              width: 'clamp(160px, 35vw, 260px)',
              height: 'clamp(160px, 35vw, 260px)',
              transform: `scale(${scale})`,
              opacity: opacity,
              filter: `drop-shadow(0px 4px ${shadowIntensity}px rgba(0, 0, 0, 0.25))`,
            }}
          >
            {/* Shine */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 rounded-full"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, ${0.6 * shineIntensity}) 0%, 
                  rgba(255, 255, 255, ${0.2 * shineIntensity}) 30%,
                  transparent 60%
                )`,
                opacity: shineIntensity > 0.1 ? shineIntensity : 0,
              }}
            />
            <Image
              src="/assets/logos/ACE CARDS logo.png"
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