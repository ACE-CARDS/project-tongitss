"use client";

import { motion } from "framer-motion";

export default function ApplicationInfo({ reminders, instructions }: { reminders: string[], instructions: string[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white border-slate-200 border rounded-[2rem] p-8 lg:p-10 shadow-lg flex flex-col h-full"
      >
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shadow-sm shrink-0">
            <img
              src="/assets/logos/reminders.png"
              alt="Reminders Icon"
              className="w-7 h-7 object-contain opacity-80"
            />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
            Reminders
          </h3>
        </div>

        <ul className="space-y-4 text-slate-700 font-medium list-disc ml-6 marker:text-red-500 text-lg">
          {reminders.length > 0 ? (
            reminders.map((reminder, idx) => (
              <li key={idx} className="pl-2 leading-relaxed">
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
            <img
              src="/assets/logos/instructions.png"
              alt="Instructions Icon"
              className="w-7 h-7 object-contain opacity-90"
            />
          </div>
          <h3 className="text-2xl font-black text-white uppercase tracking-wide">
            Instructions
          </h3>
        </div>

        <ol className="relative z-10 space-y-4 text-slate-300 font-medium list-decimal ml-6 marker:text-[#eec643] marker:font-black text-lg marker:text-xl">
          {instructions.length > 0 ? (
            instructions.map((instruction, idx) => (
              <li key={idx} className="pl-2 leading-relaxed">
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