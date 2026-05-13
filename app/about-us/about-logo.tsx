"use client";

import { motion } from "framer-motion";

export default function AboutLogo() {
  return (
    <section id="about-logo" className="relative flex flex-col pt-10 pb-20 px-6 lg:px-20 z-10">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-4">
            <span className="w-10 lg:w-16 h-[2px] bg-[#eec643]"></span>
            <h2 className="text-3xl lg:text-4xl font-oswald font-black text-[#011638] uppercase tracking-wide">
              The Logo
            </h2>
            <span className="w-10 lg:w-16 h-[2px] bg-[#eec643]"></span>
          </div>
        </motion.div>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full"
          >
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-xl hover:shadow-2xl border border-slate-100 relative cursor-default transition-shadow"
            >
              {/* Quote Icon */}
              <span className="absolute -top-6 left-8 text-8xl text-[#eec643]/30 font-serif leading-none select-none">
                &ldquo;
              </span>
              
              <div className="space-y-6 relative z-10 text-slate-600 font-ubuntu-mono text-sm lg:text-base leading-relaxed">
                <p>
                  On the rightmost side, we have the ACE CARDS logo. Its design is inspired by the DOST logo&apos;s color scheme.{" "}
                  <strong className="text-[#011638] font-bold">Black</strong> represents the unknown,{" "}
                  <strong className="text-[#011638] font-bold">White</strong> stands for truth and enlightenment, and{" "}
                  <strong className="text-blue-700 font-bold">Blue</strong> symbolizes progress.{" "}
                  <strong className="text-[#eec643] font-bold">Yellow </strong> was also added to show that we&apos;re always looking toward the future.
                </p>

                <p>
                  At the center is the ace of spades, the highest card in a deck. This represents the values and objectives of DOST scholars — aiming to be citizens of high value. 
                  Surrounding it are the six provinces of CAR — Abra, Apayao, Benguet, Ifugao, Kalinga, and Mountain Province — symbolizing unity among scholars across the region.
                </p>

                <p>
                  Finally, the blue and black colors give an illusion of movement, showing continual progress in Science and Technology, just like the official DOST logo.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="w-full lg:w-[45%] flex justify-center lg:justify-end perspective-1000"
          >
            <div className="relative animate-bounce-slow rotate-y-12">
              <img 
                src="/assets/logos/ACE CARDS logo.png" 
                alt="Ace Cards Logo" 
                loading="eager"
                width={406}
                height={406}
                className="bg-[#e0ae04] w-[clamp(220px,30vw,420px)] transition-all duration-700 ease-out hover:scale-105 hover:shadow-[0_0_100px_#d9b237] rounded-full"
              />
            </div>
          </motion.div>

        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
      `}</style>
    </section>
  );
}