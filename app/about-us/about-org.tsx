"use client";

import { motion } from "framer-motion";

export default function AboutOrg() {
  return (
    <section id="about-org" className="relative flex flex-col pt-0 pb-20 px-6 lg:px-20 z-10">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        
        {/* TITLE ANIMATION */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.span 
              initial={{ opacity: 0, rotate: -180, scale: 0 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="text-4xl md:text-5xl text-[#eec643]"
            >
              ♠
            </motion.span>
            
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
              The Org
            </h1>
            
            <motion.span 
              initial={{ opacity: 0, rotate: 180, scale: 0 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="text-4xl md:text-5xl text-[#eec643]"
            >
              ♠
            </motion.span>
          </div>
        </motion.div>

        {/* IMAGE ENTRANCE */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="w-full max-w-5xl shadow-2xl overflow-hidden rounded-[2.5rem] border-[6px] border-white relative z-20 aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]"
        >
          <img  
            src="/assets/logos/ga.jpg"  
            alt="Ace Cards Group"
            className="w-full h-full object-cover object-[center_20%] md:object-center" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
        </motion.div>

        {/* CONTENT CARD ENTRANCE */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full max-w-5xl mt-6 lg:mt-[-6rem] relative z-30 px-2 lg:px-6"
        >
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-2xl p-10 lg:p-16 flex flex-col lg:flex-row gap-12 items-stretch">
            
            <div className="flex-1 space-y-8 flex flex-col justify-center">
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="text-xl lg:text-2xl text-slate-800 leading-relaxed font-medium"
              >
                The <strong className="text-[#011638] font-bold">Association of Competent and Empowered Cordillera Administrative Region DOST Scholars (ACE CARDS)</strong> serves as the official mother organization for all scholars across the Cordilleras.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                className="text-lg lg:text-xl text-slate-600 leading-relaxed font-medium"
              >
                We embody the ideals of a Patriot Scholar, committed to Professional Excellence, Servant Leadership, and Social Responsibility.
              </motion.p>
            </div>

            <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#fefce8] to-white rounded-[2rem] p-10 lg:p-12 border border-[#fde047] shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-center text-center sm:text-left cursor-default">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="size-12 rounded-full bg-[#011638] flex items-center justify-center text-white shadow-md shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="text-[#011638] font-bold uppercase tracking-widest text-sm lg:text-base">Official Status</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-base lg:text-lg font-medium">
                  ACE CARDS is a regional socio-civic group <strong className="text-[#011638]">duly certified by DOST-SEI</strong>, acting as the mother organization for all DOST orgs in CAR.
                </p>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
}