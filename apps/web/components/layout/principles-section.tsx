"use client";

import { motion } from "framer-motion";
import { UserCheck, ShieldCheck, Eye } from "lucide-react";
import Image from "next/image";

const principles = [
  {
    icon: <UserCheck className="w-6 h-6" />,
    title: "Humans in Command",
    description:
      "People stay firmly in control. AI amplifies productivity and catches errors, but your team always makes the final decisions and owns the outcomes.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Built for Zero Regret",
    description:
      "We engineer relentless reliability and bulletproof accuracy into every layer, because in logistics even a single failure can cost millions and destroy trust.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Radical Transparency",
    description:
      "Every process, status, and data point is visible in real time to you, your team, and your customers. No black boxes, no surprises, no excuses.",
  },
];

export function PrinciplesSection() {
  return (
    <section className="w-full flex items-center justify-center py-16 md:py-24 px-4 md:px-6">
      <div className="relative w-full max-w-[95%] rounded-3xl overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/principles-background.jpg"
            alt="Principles Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark Overlay for B&W Theme & Readability */}
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-stretch gap-0 relative z-10 py-20 px-4 md:px-6">
          {/* Left Column: Title & Intro */}
          <div className="flex-1 flex flex-col justify-center lg:pr-0 mb-12 lg:mb-0">
            <div className="flex flex-col gap-6 max-w-xl lg:ml-auto lg:text-left">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-4xl font-normal tracking-tight leading-[1.15]"
              >
                <span className="text-white">
                  Most logistics platforms promise to do everything.{" "}
                </span>
                <span className="text-gray-400">
                  Real operations are far more nuanced than that.
                </span>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-xl md:text-2xl font-light text-white">
                  We take a different approach, guided by three principles.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Middle Column: Animated SVG Lines (Desktop) */}
          <div className="hidden lg:flex w-48 relative flex-col justify-center items-center">
            <div className="absolute inset-0 w-full h-full">
              <svg
                className="w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Path 1: Top Branch */}
                <motion.path
                  d="M 0 50 C 50 50, 50 15, 100 15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-white/40"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 }}
                />

                {/* Path 2: Middle Branch */}
                <motion.path
                  d="M 0 50 L 100 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-white/40"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />

                {/* Path 3: Bottom Branch */}
                <motion.path
                  d="M 0 50 C 50 50, 50 85, 100 85"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-white/40"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </svg>
            </div>
          </div>

          {/* Right Column: Cards */}
          <div className="flex-1 flex flex-col justify-between gap-6 lg:pl-0 py-4">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex-1 flex items-center"
              >
                <div className="w-full p-6 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-white shrink-0">{principle.icon}</div>
                    <h3 className="text-xl md:text-2xl font-normal text-white">
                      {principle.title}
                    </h3>
                  </div>
                  <p className="text-base text-gray-300 leading-relaxed pl-10">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
