"use client";

import { motion } from "framer-motion";

export default function ApplicationInfo({ reminders, instructions }: { reminders: string[], instructions: string[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      
      {/* Reminders Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white border-slate-200 border rounded-[2rem] p-8 lg:p-10 shadow-lg flex flex-col h-full"
      >
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-red-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
            Reminders
          </h3>
        </div>

        <ul className="space-y-4 text-slate-700 font-medium list-disc ml-6 marker:text-red-500 text-lg">
          {reminders.length > 0 ? (
            reminders.map((reminder, idx) => (
              <li key={idx} className="pl-2 leading-relaxed whitespace-pre-wrap break-words">
                {reminder}
              </li>
            ))
          ) : (
            <p className="italic text-slate-500 list-none -ml-6">
              No reminders posted.
            </p>
          )}
        </ul>
      </motion.div>

      {/* Instructions Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-[#011638] border border-slate-800 rounded-[2rem] p-8 lg:p-10 shadow-xl text-white flex flex-col h-full relative overflow-hidden"
      >
        <div className="relative z-10 flex items-center gap-4 mb-6 pb-5 border-b border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-[#eec643] flex items-center justify-center shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-[#011638]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-wide">
            Instructions
          </h3>
        </div>

        <ol className="relative z-10 space-y-4 text-slate-300 font-medium list-decimal ml-6 marker:text-[#eec643] marker:font-black text-lg marker:text-xl">
          {instructions.length > 0 ? (
            instructions.map((instruction, idx) => (
              <li key={idx} className="pl-2 leading-relaxed whitespace-pre-wrap break-words">
                {instruction}
              </li>
            ))
          ) : (
             <p className="italic text-slate-400 list-none -ml-6">
              No instructions posted.
            </p>
          )}
        </ol>
      </motion.div>
    </div>
  );
}