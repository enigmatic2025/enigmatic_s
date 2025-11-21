"use client";

import { motion } from "framer-motion";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { CTAButtons } from "@/components/ui/cta-buttons";

export function Hero() {
  return (
    <section className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden px-4 md:px-6 py-20">
      <AuroraBackground />
      <div className="container relative z-10 flex flex-col items-center text-center">
        {/* Logo-sized Enigmatic at top */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-block text-4xl font-light tracking-tight sm:text-6xl md:text-7xl lg:text-8xl bg-linear-to-r from-slate-400 via-purple-400 to-blue-400 bg-clip-text text-transparent px-1 pb-4 -mb-4">
            Enigmatic
          </div>
        </motion.div>

        {/* Main headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-light tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            Map. Automate. Own.
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-xl text-foreground/80 sm:text-2xl font-light"
        >
          We design, connect, and orchestrate the processes your core systems
          ignore.
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <CTAButtons />
        </motion.div>
      </div>
    </section>
  );
}
