"use client";

import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="relative h-16 w-16">
          {/* Outer elegant ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-foreground/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Rotating arc 1 */}
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-foreground/80"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Rotating arc 2 (Inner, counter-rotation) */}
          <motion.div
            className="absolute inset-2 rounded-full border-b-2 border-foreground/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Center breathing dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div 
               className="h-2 w-2 rounded-full bg-foreground"
               animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
