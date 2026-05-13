"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ApplicationHero({ deadline, signupLink }: { deadline: string; signupLink: string }) {
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (!deadline) return;
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(23, 59, 59, 999);
    
    if (new Date() > deadlineDate) {
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
  }, [deadline]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 lg:p-10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8 mb-8"
    >
      <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
        <div className="flex items-center justify-center lg:justify-start gap-3 w-full">
          <span className="header withspade">
            Application
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          {/* Dynamic Status Pill */}
          <div className={`inline-flex items-center gap-3 px-5 py-2 rounded-full border shadow-sm shrink-0 ${isClosed ? 'bg-red-50 border-red-200' : 'bg-green-100 border-green-200'}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isClosed ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
            <span className={`text-sm font-black tracking-widest uppercase ${isClosed ? 'text-red-700' : 'text-green-700'}`}>
              Status: {isClosed ? 'Closed' : 'Open'}
            </span>
          </div>

          {!isClosed && (
            <a 
              href={signupLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-2.5 bg-[#eec643] text-[#011638] rounded-full font-oswald font-bold tracking-widest uppercase hover:bg-[#d9b237] transition-colors shadow-md text-sm shrink-0"
            >
              Apply Now
            </a>
          )}
        </div>
      </div>

      <div className="bg-[#011638] text-white px-10 py-6 rounded-[1.5rem] shadow-xl text-center min-w-[280px] shrink-0">
        <h3 className="text-xs font-bold text-[#eec643] uppercase tracking-widest mb-2">
          Application Deadline
        </h3>
        <p className="text-2xl font-black leading-tight">
          {deadline}
        </p>
      </div>
    </motion.div>
  );
}