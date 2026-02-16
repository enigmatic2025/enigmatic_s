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
    },
    {
      id: "step2",
      icon: PenTool,
    },
    {
      id: "step3",
      icon: Cpu,
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-6 bg-background flex justify-center">
      <div className="w-full max-w-[95%] border border-border rounded-3xl overflow-hidden py-12 md:py-20">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="mb-12 md:mb-24">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-linear-to-r from-transparent via-border to-transparent z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 mb-8 rounded-full flex items-center justify-center bg-background">
                <step.icon className="w-24 h-24 text-blue-500" strokeWidth={0.5} />
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
