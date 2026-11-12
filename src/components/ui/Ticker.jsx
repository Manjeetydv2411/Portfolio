import { motion } from 'framer-motion'

const CONTENT = [
  "SOFTWARE ENGINEER",
  "FULL-STACK DEVELOPER",
  "550+ DSA PROBLEMS",
  "REACT",
  "NODE.JS",
  "TYPESCRIPT",
  "SYSTEM DESIGN",
  "PROBLEM SOLVER"
]

export default function Ticker() {
  return (
    <div className="w-full bg-[#0a0a0a] border-t border-b border-[#222222] py-4 overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {[...CONTENT, ...CONTENT].map((item, index) => (
          <div key={index} className="flex items-center mx-4">
            <span className="text-sm font-mono text-[#a09c9a] uppercase tracking-widest hover:text-brandAccent transition-colors duration-300">
              {item}
            </span>
            <span className="text-brandAccent mx-4">·</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
