"use client";

import { motion } from "framer-motion";

export default function ApplicationTestimony({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center relative pb-16">
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-wrap items-center justify-center gap-3 mb-8"
      >
        <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 uppercase tracking-tight text-center drop-shadow-sm">
          Hear From Our Scholars
        </h2>
        <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        className="relative w-full aspect-video bg-white/50 backdrop-blur-md border-4 border-white shadow-2xl rounded-[2.5rem] overflow-hidden z-10"
      >
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={videoUrl}
          title="Scholar Testimony"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </motion.div>

      {/* MASCOT */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute -bottom-6 -right-8 w-44 h-44 lg:w-48 lg:h-48 drop-shadow-2xl z-20 pointer-events-none hidden md:block"
      >
        <img
          src="/assets/logos/mascot.png"
          alt="Ace Cards Mascot"
          className="w-full h-full object-contain"
        />
      </motion.div>
    </div>
  );
}