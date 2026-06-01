"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function MotionButton({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <motion.button
      className={`px-8 py-4 rounded-full font-medium tracking-wide transition-colors ${
        dark 
          ? "bg-white text-black" 
          : "bg-neutral-950 text-white"
      }`}
      whileHover={{ 
        scale: 1.05,
        boxShadow: dark 
          ? "0px 0px 20px rgba(255, 255, 255, 0.5)" 
          : "0px 0px 20px rgba(0, 0, 0, 0.15)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {children}
    </motion.button>
  );
}
