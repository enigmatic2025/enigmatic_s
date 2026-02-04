"use client";

import { motion } from "framer-motion";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 h-12">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-foreground"
            initial={{ height: "20%" }}
            animate={{ height: ["20%", "80%", "20%"] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15, // Stagger effect creates the wave
            }}
          />
        ))}
      </div>
    </div>
  );
}
