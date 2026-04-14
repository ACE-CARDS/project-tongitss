"use client";

import { motion } from "framer-motion";

export default function AboutMascot() {
  return (
    <section id="about-mascot" className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 py-24 z-10">
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex-1 text-center lg:text-left z-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white shadow-sm mb-6">
            <span className="text-xs font-bold text-[#0d21a1] tracking-widest uppercase">The Face of the Org</span>
          </div>

          {/* TITLE */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
            <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
            <h1 className="text-5xl md:text-6xl leading-none font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
              The Mascot
            </h1>
            <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md border border-white px-8 py-6 rounded-3xl shadow-sm max-w-lg mx-auto lg:mx-0">
            <p className="text-lg text-slate-700 font-medium leading-relaxed">
              Whether they are grinding through a late-night coding session, cramming for a major exam, or organizing the next big ACE CARDS event, our mascot represents the true spirit of a DOST-SEI scholar in the Cordilleras: running on caffeine, but always delivering excellence.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 100, rotate: -5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", bounce: 0.4, duration: 1 }}
          className="flex-1 flex justify-center mt-10 lg:mt-0 relative z-20"
        >
          <div className="p-4 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl relative">
            <img 
              src="/assets/logos/mascot.png" 
              className="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] object-cover rounded-[2.5rem]" 
              alt="Ace Cards Mascot working on a laptop" 
            />
          </div>
        </motion.div>

      </div>

    </section>
  );
}