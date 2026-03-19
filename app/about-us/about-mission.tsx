"use client";

import { motion } from "framer-motion";

export default function AboutMission() {
  return (
    <section id="about-mission" className="relative flex flex-col justify-center items-center text-center py-32 min-h-screen overflow-hidden z-10">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl px-8 py-16 z-30 rounded-[3rem] backdrop-blur-2xl bg-[#011638]/90 border border-white/20 shadow-2xl mx-6"
      >
        <span className="text-[#eec643] text-4xl mb-4 block">♠</span>
        <h1 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-widest uppercase">
          Our Mission
        </h1>
        <p className="text-white/90 text-lg lg:text-2xl leading-relaxed font-medium">
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
        <div className="w-72 h-96 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white p-2">
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
        <div className="w-72 h-96 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white p-2">
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
        <div className="w-72 h-96 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white p-2">
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
        <div className="w-72 h-96 bg-white/50 backdrop-blur-md rounded-[2rem] shadow-2xl border-4 border-white p-2">
          <img src="/placeholder1.jpg" className="w-full h-full object-cover rounded-[1.5rem]" alt="Mission Card 4" />
        </div>
      </motion.div>

    </section>
  );
}