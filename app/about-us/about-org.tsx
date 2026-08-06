"use client";

import AnimatedTitle from "@/components/ui/animatedTitle";
import { motion } from "framer-motion";

const schoolOrgs = [
  { name: "D-SALENG", school: "Benguet State University", province: "Benguet", logo: "/assets/logos/DSALENG.png", fb: "https://www.facebook.com/profile.php?id=61592526025538" },
  { name: "UB TALAS", school: "University of Baguio", province: "Baguio City", logo: "/assets/logos/TALAS.png", fb: "https://www.facebook.com/profile.php?id=61586830391225" },
  { name: "UC CATS", school: "University of the Cordilleras", province: "Baguio City", logo: "/assets/logos/CATS.png", fb: "https://www.facebook.com/uccats.dost" },
  { name: "UP SIKAT", school: "University of the Philippines - Baguio", province: "Baguio CIty", logo: "/assets/logos/SIKAT.png", fb: "https://www.facebook.com/sikat.upb" },
  { name: "KAINDS", school: "Kalinga State University", province: "Kalinga", logo: "/assets/logos/KAINDS.png", fb: "https://www.facebook.com/KalingaDOSTscholars" },
  { name: "BAGGS", school: "Saint Louis University", province: "Baguio City", logo: "/assets/logos/BAGGS.png", fb: "https://www.facebook.com/BAGGSSLUPAGE", note: "Not DOST-exclusive" },
];

export default function AboutOrg() {
  return (
    <section id="about-org" className="relative flex flex-col pt-6 pb-10 lg:pt-10 lg:pb-20 lg:px-20 z-5">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center">
        
        {/* TITLE ANIMATION */}
        <AnimatedTitle title="About Us" />

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
          {/* CAMPAIGN BADGE */}
          <div className="flex justify-center relative z-40 mb-[-1.25rem]">
            <div className="bg-[#011638] text-white rounded-full px-5 py-2.5 shadow-xl border-4 border-white flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
              <span className="text-xs sm:text-sm lg:text-base font-semibold tracking-wide">
                All in for Progress, All in for Service
              </span>
              <span className="hidden sm:block text-white/50">•</span>
              <span className="text-xs sm:text-sm lg:text-base font-extrabold text-[#FACC15]">
                #AceCardsAllIn
              </span>
            </div>
          </div>
          <div className="bg-white/95 backdrop-blur-2xl border border-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 md:p-10 lg:p-16 flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-12 items-stretch">
            
            <div className="flex-1 space-y-8 flex flex-col justify-center">
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                className="text-sm sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-medium"
              >
                The <strong className="text-[#011638] font-bold">Association of Competent and Empowered Cordillera Administrative Region DOST Scholars (ACE CARDS)</strong> serves as the official mother organization for all scholars across the Cordilleras.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
                className="text-sm sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-medium"
              >
                We embody the ideals of a Patriot Scholar, committed to Professional Excellence, Servant Leadership, and Social Responsibility.
              </motion.p>
            </div>

            <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#fefce8] to-white rounded-[2rem] p-6 sm:p-8 lg:p-12 border border-[#fde047] shadow-lg relative overflow-hidden transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-center text-center sm:text-left cursor-default">
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                  <div className="size-12 rounded-full bg-[#011638] flex items-center justify-center text-white shadow-md shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h3 className="text-[#011638] font-bold uppercase tracking-widest text-xs sm:text-sm lg:text-base">Official Status</h3>
                </div>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base lg:text-lg font-medium">
                  ACE CARDS is a regional socio-civic group <strong className="text-[#011638]">duly certified by DOST-SEI</strong>, acting as the mother organization for all DOST orgs in CAR.
                </p>
              </div>
            </div>
            
          </div>
        </motion.div>

        {/* MEMBER ORGANIZATIONS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="w-full max-w-5xl mt-10 lg:mt-14"
        >
          <div className="text-center mb-8">
            <h3 className="text-[#011638] font-extrabold uppercase tracking-widest text-xs sm:text-sm lg:text-base mb-1">
              School Associations
            </h3>
            <p className="text-slate-500 text-sm sm:text-base">
              The university-based DOST scholar organizations.
            </p>
          </div>

          <div className="flex justify-center items-start gap-2 sm:gap-8 w-full">
            {schoolOrgs.map((org, i) => (
              <motion.a
                key={org.name}
                href={org.fb}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 * i }}
                className="group flex flex-col items-center text-center flex-1 min-w-0 max-w-[7rem]"
              >
                <div className="size-10 xs:size-12 sm:size-16 rounded-full bg-[#011638]/5 border border-[#011638]/10 overflow-hidden flex items-center justify-center group-hover:border-[#FACC15]/60 group-hover:scale-105 transition-all duration-300">
                  <img
                    src={org.logo}
                    alt={`${org.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="hidden sm:block font-bold text-[#011638] text-xs sm:text-sm mt-2">
                  {org.name}
                </span>
                <span className="hidden sm:block text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-snug">
                  {org.school}
                </span>
                <span className="hidden sm:block text-slate-400 text-[10px] sm:text-[11px] mt-0.5">
                  {org.province}
                </span>
                {org.note && (
                  <span className="hidden sm:block mt-1.5 text-[6px] sm:text-[11px] text-[#011638] bg-[#FACC15]/20 border border-[#FACC15]/40 rounded-full px-2 py-0.5 leading-snug">
                    {org.note}
                  </span>
                )}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}