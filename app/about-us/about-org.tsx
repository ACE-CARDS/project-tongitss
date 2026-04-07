"use client";

import { motion } from "framer-motion";

export default function AboutOrg() {
  return (
    <section id="about-org" className="relative flex flex-col pt-8 pb-16 px-6 lg:px-20 z-10">
      
      <div className="max-w-5xl mx-auto w-full flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
              The Org
            </h1>
            <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full h-[35vh] lg:h-[45vh] relative shadow-lg overflow-hidden rounded-[2rem] border-4 border-white z-20 mb-8"
        >
          <img  
            src="/assets/logos/ga.jpg"  
            alt="Ace Cards Organization Group Photo"
            className="w-full h-full object-cover" 
          />
        </motion.div>


        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center relative z-30"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white px-8 py-8 rounded-[2rem] shadow-sm text-lg text-slate-700 leading-relaxed font-medium">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </motion.div>
      </div>

    </section>
  );
}