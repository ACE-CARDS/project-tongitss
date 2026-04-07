"use client";

import { motion } from "framer-motion";

export default function AboutMission() {
  return (
    <section id="about-mission" className="relative flex flex-col justify-center items-center text-center py-24 min-h-screen overflow-hidden z-10">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl px-8 py-20 z-30 rounded-[3rem] backdrop-blur-2xl bg-[#011638]/95 border border-white/20 shadow-2xl mx-6"
      >
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase">
            Our Mission
          </h1>
          <span className="text-4xl md:text-5xl text-[#eec643]">♠</span>
        </div>

        <p className="text-white/90 text-xl lg:text-3xl leading-relaxed font-medium px-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: -50, y: -50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-10 left-10 -rotate-12 transition-transform duration-500 hover:-translate-y-6 hover:scale-105 hover:z-40 hidden lg:block"
      >
        <div className="w-72 h-96 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border-4 border-white p-2">
          <img src="/placeholder1.jpg" className="w-full h-full object-cover rounded-[1.5rem]" alt="Mission Card 1" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: -50, y: 50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute bottom-10 left-24 rotate-6 transition-transform duration-500 hover:-translate-y-6 hover:scale-105 hover:z-40 hidden lg:block"
      >
        <div className="w-72 h-96 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border-4 border-white p-2">
          <img src="/placeholder1.jpg" className="w-full h-full object-cover rounded-[1.5rem]" alt="Mission Card 2" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50, y: -50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute top-10 right-10 rotate-12 transition-transform duration-500 hover:-translate-y-6 hover:scale-105 hover:z-40 hidden lg:block"
      >
        <div className="w-72 h-96 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border-4 border-white p-2">
          <img src="/placeholder1.jpg" className="w-full h-full object-cover rounded-[1.5rem]" alt="Mission Card 3" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50, y: 50 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="absolute bottom-10 right-24 -rotate-6 transition-transform duration-500 hover:-translate-y-6 hover:scale-105 hover:z-40 hidden lg:block"
      >
        <div className="w-72 h-96 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl border-4 border-white p-2">
          <img src="/placeholder1.jpg" className="w-full h-full object-cover rounded-[1.5rem]" alt="Mission Card 4" />
        </div>
      </motion.div>

    </section>
  );
}