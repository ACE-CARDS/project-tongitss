"use client";

import { motion } from "framer-motion";

export default function AboutMascot() {
  return (
    <section id="about-mascot" className="relative flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 pt-8 pb-24 z-10">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full">
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-white shadow-sm mb-6"
          >
            <span className="text-xs font-bold text-[#0d21a1] tracking-widest uppercase">The Face of the Org</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase mb-8"
          >
            The Mascot, Kidla
          </motion.h1>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-md border border-white px-8 py-6 rounded-3xl shadow-sm max-w-lg mx-auto lg:mx-0 cursor-default transition-shadow hover:shadow-lg"
          >
            <p className="text-lg text-slate-700 font-medium">
              Running on caffeine but always delivering excellence—our mascot represents the true spirit of a DOST-SEI scholar in the Cordilleras.
            </p>
          </motion.div>
        </motion.div>

        {/* FLOATING MASCOT IMAGE */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="flex-1 flex justify-center relative"
        >
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="p-4 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl"
          >
            <img 
              src="/assets/logos/mascot.png" 
              className="w-[300px] lg:w-[500px] h-auto object-contain rounded-[2.5rem]" 
              alt="ACE CARDS Mascot" 
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}