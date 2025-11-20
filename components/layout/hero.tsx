"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { AuroraBackground } from "@/components/ui/aurora-background";

export function Hero() {
  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-20">
      <AuroraBackground />
      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            We are <span className="bg-gradient-to-r from-slate-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Enigmatic</span>.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl text-foreground/80 sm:text-2xl font-light"
        >
          Solving complex logistic tech problems.
        </motion.div>
      </div>
    </section>
  );
}
