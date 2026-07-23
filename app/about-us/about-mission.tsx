"use client";

import { motion, Variants } from "framer-motion";

export default function AboutMission() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const objectives = [
    "Promote Student leadership, Nation-building, and Empowerment to the youth.",
    "Bring more recognition to Scholarships offered by the Department of Science and Technology.",
    "Establish a network among DOST scholars in and out of the Cordillera Administrative Region.",
    "To encourage exchange of ideas and cooperation among its members.",
    "To promote awareness on the cultural background of the region and strengthen the attachment of its members to CAR.",
    "To render service to the people of CAR.",
    "To give due recognition to its members for meritorious and outstanding achievements or contributions."
  ];

  return (
    <section id="about-mission" className="relative flex flex-col pt-6 pb-10 lg:pt-10 lg:pb-20 lg:px-20 z-5">
      <div className="max-w-7xl mx-auto w-full space-y-10 lg:space-y-16">
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[480px]">
          
          {/* Vision Text Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[60%] h-full"
          >
            <div className="bg-[#011638] p-6 sm:p-8 md:p-10 lg:p-14 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col justify-center h-full group border border-white/10 transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute -bottom-4 -right-4 text-[60px] sm:text-[80px] md:text-[100px] lg:text-[140px] font-black text-white/5 select-none pointer-events-none tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">
                VISION
              </div>

              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-8"
                >
                  <h2 className="text-[#eec643] font-bold uppercase tracking-[0.2em] text-xs sm:text-sm lg:text-base">
                    Our Vision
                  </h2>
                </motion.div>
                
                <div className="relative w-full">
                  <span className="absolute -top-6 -left-6 text-6xl text-[#eec643]/30 font-serif leading-none select-none">
                    &ldquo;
                  </span>
                  
                  <p className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black leading-tight z-10 relative">
                    Building the next generation of S&T professionals committed to the well-being of every Filipino.
                  </p>
                  
                  <span className="absolute -bottom-8 right-0 lg:-right-4 text-6xl text-[#eec643]/30 font-serif leading-none select-none">
                    &rdquo;
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Vision Images Stack */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-[40%] flex flex-col sm:flex-row lg:flex-col gap-6 h-[400px] sm:h-[300px] lg:h-full"
          >
            <div className="flex-1 relative overflow-hidden rounded-[2.5rem] shadow-xl group bg-slate-200">
              <img 
                src="/assets/logos/mission-1.jpg" 
                alt="ACE CARDS Vision Action 1" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                  <h3 className="text-white font-bold text-sm">Inadalan</h3>
                  <p className="text-white/80 text-xs">2024</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden rounded-[2.5rem] shadow-xl group bg-slate-200">
              <img 
                src="/assets/logos/mission-2.jpg" 
                alt="ACE CARDS Vision Action 2" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                  <h3 className="text-white font-bold text-sm">Undergraduate Examination</h3>
                  <p className="text-white/80 text-xs">2025</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="flex flex-col lg:flex-row-reverse gap-6 lg:gap-8 lg:h-[480px]">
          
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full lg:w-[60%] h-full"
          >
            <div className="bg-white/95 backdrop-blur-2xl border-2 border-white p-6 sm:p-8 md:p-10 lg:p-14 rounded-[2.5rem] shadow-xl h-full flex flex-col justify-center relative overflow-hidden group transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute -bottom-4 -right-4 text-[60px] sm:text-[80px] md:text-[100px] lg:text-[140px] font-black text-[#011638]/5 select-none pointer-events-none tracking-tighter leading-none group-hover:scale-110 transition-transform duration-700">
                MISSION
              </div>

              <div className="relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-8"
                >
                  <h2 className="text-[#eec643] font-bold uppercase tracking-[0.2em] text-xs sm:text-sm lg:text-base">
                    Our Mission
                  </h2>
                </motion.div>
                
                <div className="relative mb-8 w-full">
                  <span className="absolute -top-6 -left-6 text-6xl text-[#011638]/10 font-serif leading-none select-none">
                    &ldquo;
                  </span>
                  
                  <p className="text-slate-700 text-base sm:text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed relative z-10">
                    To develop the country&apos;s S&T human resource and improve science education through responsive scholarships and innovative programs.
                  </p>
                  
                  <span className="absolute -bottom-8 right-0 lg:-right-4 text-6xl text-[#011638]/10 font-serif leading-none select-none">
                    &rdquo;
                  </span>
                </div>
                <div className="pt-6 border-t-2 border-slate-100 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#eec643]"></div>
                   <p className="text-2xl text-slate-500 font-medium">
                     <strong className="text-[#011638] uppercase tracking-wider">Established September 28, 2022</strong>
                   </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="w-full lg:w-[40%] flex flex-col sm:flex-row lg:flex-col gap-6 h-[400px] sm:h-[300px] lg:h-full"
          >
            <div className="flex-1 relative overflow-hidden rounded-[2.5rem] shadow-xl group bg-slate-200">
              <img 
                src="/assets/logos/mission-3.jpg" 
                alt="ACE CARDS Mission Action 1" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                  <h3 className="text-white font-bold text-sm">Undergraduate Examination</h3>
                  <p className="text-white/80 text-xs">2026</p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden rounded-[2.5rem] shadow-xl group bg-slate-200">
              <img 
                src="/assets/logos/mission-4.jpg" 
                alt="ACE CARDS Mission Action 2" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 w-full p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <div className="bg-black/60 backdrop-blur-md rounded-2xl px-4 py-2">
                  <h3 className="text-white font-bold text-sm">Undergraduate Examination</h3>
                  <p className="text-white/80 text-xs">2026</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <div className="pt-10 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center gap-4">
              <span className="w-10 lg:w-16 h-[3px] bg-gradient-to-r from-transparent to-[#eec643] rounded-full"></span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#011638] uppercase tracking-tight">
                Core Objectives
              </h2>
              <span className="w-10 lg:w-16 h-[3px] bg-gradient-to-l from-transparent to-[#eec643] rounded-full"></span>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {objectives.map((obj, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex gap-4 cursor-default ${
                  i === 6 ? "md:col-span-2 lg:col-span-3 lg:w-2/3 mx-auto" : ""
                }`}
              >
                <div className="size-8 rounded-full bg-[#011638] text-[#eec643] flex items-center justify-center shrink-0 font-black text-sm shadow-inner">
                  {i + 1}
                </div>
                <p className="text-slate-600 font-medium text-xs sm:text-sm leading-relaxed">{obj}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}