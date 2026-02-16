"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Map, PenTool, Cpu } from "lucide-react";

export function ProcessSection() {
  const t = useTranslations("Process");

  const steps = [
    {
      id: "step1",
      icon: Map,
      activeColor: "text-blue-400",
      activeBorder: "border-blue-400",
    },
    {
      id: "step2",
      icon: PenTool,
      activeColor: "text-violet-400",
      activeBorder: "border-violet-400",
    },
    {
      id: "step3",
      icon: Cpu,
      activeColor: "text-pink-400",
      activeBorder: "border-pink-400",
    },
  ];

  return (
    <section className="w-full min-h-full bg-background flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 w-full mb-8 md:mb-10">
        <div className="w-full px-0">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">{t("title")}{" "}</span>
            <span className="text-muted-foreground">
              {t("description")}
            </span>
          </motion.h2>
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

              <h3 className="text-xl font-medium mb-4">{t(`steps.${step.id}`)}</h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs">
                {t(`steps.${step.id}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
