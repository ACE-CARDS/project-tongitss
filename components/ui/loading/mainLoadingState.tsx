"use client";

import Image from "next/image";
import NavBar from "@/components/layout/navbar";

export default function LoadingState() {
  return (
    <>
      <NavBar isLoading={true} />
      <div 
        className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8] h-screen flex flex-col select-none"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="relative flex flex-col items-center justify-center w-full">
            {/* Injecting hardware-accelerated keyframe animation natively */}
            <style jsx global>{`
              @keyframes aceCardsPulse {
                0%, 100% {
                  transform: scale(1);
                  opacity: 1;
                  filter: drop-shadow(0px 4px 0px rgba(0, 0, 0, 0.25));
                  --shine-op: 0;
                }
                50% {
                  transform: scale(0.92);
                  opacity: 0.7;
                  filter: drop-shadow(0px 4px 15px rgba(0, 0, 0, 0.25));
                  --shine-op: 1;
                }
              }
              .animate-logo-pulse {
                animation: aceCardsPulse 2s ease-in-out infinite;
              }
            `}</style>

            <div 
              className="relative mx-auto animate-logo-pulse"
              style={{
                width: 'clamp(160px, 35vw, 260px)',
                height: 'clamp(160px, 35vw, 260px)',
                willChange: 'transform, opacity, filter' // 💡 Direct hint telling GPU to separate this layer
              }}
            >
              {/* Shine Overlay using pure CSS transition math handles */}
              <div 
                className="absolute inset-0 pointer-events-none z-10 rounded-full transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.6) 0%, 
                    rgba(255, 255, 255, 0.2) 30%,
                    transparent 60%
                  )`,
                  opacity: 'var(--shine-op, 0)'
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
    </>
  );
}