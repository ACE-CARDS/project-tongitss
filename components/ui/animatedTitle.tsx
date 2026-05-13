import { motion } from "framer-motion";

export default function AnimatedTitle({ title }: { title: string }) {

  return (
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
        
        <h1 className="header">
          {title}
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
  )
};