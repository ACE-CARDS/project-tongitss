"use client";

import Image from "next/image";

export default function TabLoadingState() {
  return (
    <div className="min-h-[500px] flex items-center justify-center select-none">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative flex flex-col items-center justify-center gap-1 w-full">
          <style jsx global>{`
            @keyframes tabLogoPulse {
              0%, 100% {
                transform: scale(1);
                opacity: 1;
                filter: drop-shadow(0px 4px 0px rgba(0, 0, 0, 0.1));
                --tab-shine-op: 0;
              }
              50% {
                transform: scale(0.92);
                opacity: 0.7;
                filter: drop-shadow(0px 4px 15px rgba(0, 0, 0, 0.1));
                --tab-shine-op: 1;
              }
            }
            .animate-tab-pulse {
              animation: tabLogoPulse 2s ease-in-out infinite;
            }
          `}</style>

          <div 
            className="relative w-[40vw] h-[40vw] max-w-[250px] max-h-[250px] min-w-[180px] min-h-[180px] animate-tab-pulse"
            style={{
              willChange: "transform, opacity, filter"
            }}
          >
            <div 
              className="absolute inset-0 pointer-events-none z-10 rounded-full transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.6) 0%, 
                  rgba(255, 255, 255, 0.2) 30%,
                  transparent 60%
                )`,
                opacity: "var(--tab-shine-op, 0)",
              }}
            />
            <Image
              src="/images/Busy.png"
              alt="Loading"
              fill
              sizes="(max-width: 768px) 40vw, 250px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}