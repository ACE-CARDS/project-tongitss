"use client";

import { motion } from "framer-motion";

export default function ApplicationHero({ deadline }: { deadline: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] p-6 lg:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 mb-8"
    >
      <div className="flex flex-col items-center md:items-start gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
          <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-slate-900 via-black to-slate-800 bg-clip-text text-transparent uppercase tracking-tight">
            Application
          </h1>
          <span className="text-3xl lg:text-4xl text-[#eec643]">♠</span>
        </div>
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-green-100 border border-green-200 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-sm font-black text-green-700 tracking-widest uppercase">
            Status: Open
          </span>
        </div>
      </div>

      <div className="bg-[#011638] text-white px-10 py-6 rounded-[1.5rem] shadow-xl text-center min-w-[280px]">
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