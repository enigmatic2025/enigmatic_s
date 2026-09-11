"use client";

import React from "react";
import { motion } from "framer-motion";
import { Map, PenTool, Cpu, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    id: "step1",
    title: "Map Current State",
    description: "We partner with your team to visualize your current operations, identifying bottlenecks, inefficiencies, and hidden opportunities for improvement.",
    icon: Map,
    activeColor: "text-blue-400",
    activeBorder: "border-blue-400",
  },
  {
    id: "step2",
    title: "Design Future State",
    description: "We blueprint an optimized workflow designed to maximize financial value and operational fluidity.",
    icon: PenTool,
    activeColor: "text-violet-400",
    activeBorder: "border-violet-400",
  },
  {
    id: "step3",
    title: "Build & Implement",
    description: "We build the solution using modern technologies, tailoring the architecture to your exact operating model, infrastructure, and business constraints.",
    icon: Cpu,
    activeColor: "text-pink-400",
    activeBorder: "border-pink-400",
  },
];

export function ProcessSection() {
  return (
    <section className="w-full min-h-full bg-background flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 w-full mb-8 md:mb-10">
        <div className="w-full px-0 flex flex-col items-start gap-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">From Chaos to Clarity.{" "}</span>
            <span className="text-muted-foreground">
              Our three-step approach to modernizing your operations.
            </span>
          </motion.h2>

          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-violet-500 text-lg"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[95%]  border-border rounded-3xl overflow-hidden py-12 md:py-20">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] border-t border-dashed z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div
                className="relative w-24 h-24 mb-8 flex items-center justify-center bg-background rounded-full"
              >
                {/* Base Border (Always visible, muted) */}
                <div className="absolute inset-0 rounded-full border-2 border-muted" />

                {/* Animated Active Border & Glow */}
                <motion.div
                  className={`absolute inset-0 rounded-full border ${step.activeColor.replace("text-", "border-")}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.2, 1], // Quick fade in, hold, fade out
                    delay: i * 1, // Staggered start: 0s, 1s, 2s
                    repeatDelay: 3
                  }}
                  style={{ color: step.activeColor.includes("blue") ? "#3b82f6" : step.activeColor.includes("violet") ? "#8b5cf6" : "#ec4899" }}
                />

                {/* Base Icon (Muted) */}
                <step.icon
                  className="w-12 h-12 text-muted transition-colors duration-300"
                  strokeWidth={1}
                />

                {/* Animated Colored Icon Overlay */}
                <motion.div
                  className={`absolute inset-0 flex items-center justify-center`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.2, 1],
                    delay: i * 1, // Sync with border
                    repeatDelay: 3
                  }}
                >
                  <step.icon className={`w-12 h-12 ${step.activeColor}`} strokeWidth={0.5} />
                </motion.div>
              </div>

              <h3 className="text-xl font-medium mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
