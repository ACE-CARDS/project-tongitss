"use client";

import { motion } from "framer-motion";

const points = [
  {
    title: "Spiky hair & bright smile",
    text: "Kidla's spiky hair represents resilience through academic challenges, while the bright smile and blue eyes reflect optimism, curiosity, and a passion for learning and service.",
  },
  {
    title: "Seated in a beaker",
    text: "The laboratory beaker symbolizes science, research, and innovation, reflecting how DOST scholars are grounded in knowledge and driven to serve the community.",
  },
  {
    title: "Blue, white, black & gray",
    text: "Kidla's colors are inspired by the DOST logo, representing excellence, integrity, service, and nation-building.",
  },
];

export default function AboutMascot() {
  return (
    <section id="about-mascot" className="relative flex flex-col pt-6 pb-10 lg:pt-10 lg:pb-20 lg:px-20 z-5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-10 lg:gap-16 w-full">
        
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-center lg:text-left"
        >

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase mb-6 lg:mb-8"
          >
            The Mascot, Kidla
          </motion.h1>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-white/80 backdrop-blur-md border border-white px-6 py-5 sm:px-8 sm:py-6 rounded-3xl shadow-sm max-w-sm w-full sm:max-w-lg mx-auto lg:mx-0 cursor-default transition-shadow hover:shadow-lg text-left"
          >
            <p className="text-sm sm:text-base text-slate-700 mb-4">
              Kidla embodies the spirit of a DOST scholar: resilient in the face of challenges, driven by knowledge, and dedicated to making a meaningful impact on society.
            </p>

            <ul className="space-y-3">
              {points.map((point) => (
                <li key={point.title} className="flex gap-2.5">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                  <p className="text-sm sm:text-base text-slate-700">
                    <span className="font-bold text-slate-900">{point.title}.</span>{" "}
                    {point.text}
                  </p>
                </li>
              ))}
            </ul>
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
            className="p-3 sm:p-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[3rem] border border-white shadow-2xl"
          >
            <img 
              src="/assets/logos/kidla.png" 
              className="w-[240px] sm:w-[300px] md:w-[380px] lg:w-[500px] h-auto object-contain rounded-[2.5rem]"
              alt="ACE CARDS Mascot" 
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}