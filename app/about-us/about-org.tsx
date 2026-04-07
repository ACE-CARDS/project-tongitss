"use client";

import { motion } from "framer-motion";

export default function AboutOrg() {
  return (
    <section id="about-org" className="relative min-h-screen flex flex-col pt-32 px-6 lg:px-20 z-10">
      
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black bg-gradient-to-r from-[#eec643] via-[#0d21a1] to-[#011638] bg-clip-text text-transparent uppercase tracking-tight drop-shadow-sm">
            THE ORG
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mt-6 mx-auto rounded-full shadow-sm"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full h-[40vh] lg:h-[50vh] relative shadow-2xl overflow-hidden rounded-[2.5rem] border-4 border-white z-20"
        >
          <img  
            src="/assets/logos/ga.jpg"  
            alt="Ace Cards Organization Group Photo"
            className="w-full h-full object-cover" 
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mt-[-3rem] relative z-30"
        >
          <div className="bg-white/70 backdrop-blur-xl border border-white px-8 py-10 rounded-[2rem] shadow-xl text-lg lg:text-xl text-[#141414]/80 leading-relaxed font-medium">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </motion.div>
      </div>

    </section>
  );
}