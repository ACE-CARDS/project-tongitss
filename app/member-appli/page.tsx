"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function MembershipApplication() {
  const router = useRouter();

  return (
    <div className="bg-[#f8f9fa] text-[#141414] min-h-screen flex flex-col relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#eec643] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10 fixed"></div>
      <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] bg-[#0d21a1] rounded-full blur-[150px] opacity-10 pointer-events-none -z-10 fixed"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-[#011638] rounded-full blur-[150px] opacity-5 pointer-events-none -z-10 fixed"></div>

      <NavBar />

      <main className="flex-grow relative z-10 pb-20">

        <div className="absolute top-24 left-4 sm:left-6 lg:left-12 z-50">
          <button 
            onClick={() => router.back()}
            className="bg-white/90 p-3 sm:p-4 rounded-2xl shadow-sm border border-white hover:scale-105 hover:shadow-md transition-all text-[#011638] flex items-center justify-center backdrop-blur-md"
            aria-label="Go back"
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <line x1="19" y1="12" x2="5" y2="12" />
               <polyline points="12 19 5 12 12 5" />
             </svg>
          </button>
        </div>
        <section className="pt-32 pb-20 px-6 lg:px-20 relative flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl -z-10 border-b border-white/60"></div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-4xl flex flex-col items-center mt-12"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 shadow-sm mb-8">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-black text-green-600 tracking-widest uppercase">Status: Open</span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black bg-gradient-to-r from-[#eec643] via-[#0d21a1] to-[#011638] bg-clip-text text-transparent uppercase tracking-tight drop-shadow-sm mb-6 leading-none">
              Member <br /> Application
            </h1>
            
            <div className="w-24 h-1.5 bg-gradient-to-r from-[#eec643] to-[#0d21a1] mx-auto rounded-full shadow-sm mb-12"></div>

            <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border-2 border-white rounded-[2.5rem] py-12 px-8 shadow-2xl transition-transform hover:-translate-y-2 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#eec643] rounded-full blur-[60px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <h2 className="text-3xl lg:text-5xl font-black text-[#011638] tracking-widest uppercase mb-2 relative z-10">
                Deadline
              </h2>
              <p className="text-xl lg:text-2xl text-gray-500 font-bold relative z-10">
                To Be Announced
              </p>
            </div>
          </motion.div>
        </section>

        <section className="py-24 px-6 lg:px-20 relative z-10">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex-1 w-full relative group"
            >
              <div className="h-full bg-white/60 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-[#011638] flex items-center justify-center mb-8 text-white">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <h3 className="text-3xl font-black text-[#011638] mb-8 uppercase tracking-wide">General Reminders</h3>
                <ul className="space-y-6 text-lg text-[#141414]/80 font-medium">
                  <li className="flex items-start gap-4">
                    <span className="text-[#eec643] text-2xl mt-[-4px]">✦</span> 
                    <span>Ensure all application documents are fully completed and signed.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[#eec643] text-2xl mt-[-4px]">✦</span> 
                    <span>Double-check your contact information before submitting to avoid missed updates.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="text-[#eec643] text-2xl mt-[-4px]">✦</span> 
                    <span>Prepare a digital copy of your DOST-SEI scholarship documentation.</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1 w-full relative group"
            >
              <div className="h-full bg-[#011638]/90 backdrop-blur-xl border border-[#011638] rounded-[2.5rem] p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 text-white">
                <div className="w-14 h-14 rounded-2xl bg-[#eec643] flex items-center justify-center mb-8 text-[#011638]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-wide">Instructions</h3>
                <ol className="space-y-6 text-lg text-white/80 font-medium list-decimal list-inside marker:text-[#eec643] marker:font-black">
                  <li>Click the application link provided on our official Facebook page.</li>
                  <li>Fill out the Google Form completely and honestly.</li>
                  <li>Upload all necessary attachments in PDF format.</li>
                  <li>Wait for an email confirmation regarding your interview schedule.</li>
                </ol>
              </div>
            </motion.div>

          </div>
        </section>

        <section className="py-24 px-6 relative flex flex-col items-center justify-center overflow-hidden min-h-[80vh]">
          
          <div className="relative z-10 w-full max-w-5xl text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-[#011638] uppercase tracking-widest mb-6">
              Hear From Our Scholars
            </h2>
            <div className="w-16 h-1.5 bg-[#eec643] mx-auto rounded-full shadow-sm mb-16"></div>

            <div className="relative w-full max-w-4xl mx-auto aspect-video bg-white/40 backdrop-blur-xl border-4 border-white shadow-2xl flex items-center justify-center rounded-[2.5rem] overflow-hidden group cursor-pointer hover:border-[#eec643] transition-colors duration-500">

              <div className="absolute inset-0 bg-gradient-to-tr from-[#011638]/80 to-[#0d21a1]/40 flex flex-col items-center justify-center z-10 transition-opacity duration-300 group-hover:opacity-90">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 group-hover:bg-[#eec643] group-hover:border-[#eec643] transition-all duration-300 shadow-xl">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-2 group-hover:text-[#011638] text-white transition-colors"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <span className="mt-6 text-white font-bold tracking-widest uppercase text-sm">Watch Testimony</span>
              </div>
              
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#011638 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
            </div>

            <div className="absolute top-20 left-4 lg:left-10 text-6xl text-[#eec643]/30 -rotate-12 select-none pointer-events-none">"</div>
            <div className="absolute bottom-32 right-4 lg:right-10 text-8xl text-[#0d21a1]/10 rotate-12 select-none pointer-events-none">"</div>
            <div className="absolute top-1/2 -left-10 text-9xl text-[#011638]/5 -rotate-6 select-none pointer-events-none hidden lg:block">"</div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", bounce: 0.4, duration: 1 }}
            className="absolute -bottom-10 right-0 lg:right-10 z-20 w-56 h-56 lg:w-80 lg:h-80 drop-shadow-2xl pointer-events-none"
          >
            <img 
              src="/assets/mascot.png" 
              alt="Ace Cards Mascot" 
              className="w-full h-full object-contain" 
            />
          </motion.div>

        </section>

      </main>

      <Footer />
    </div>
  );
}