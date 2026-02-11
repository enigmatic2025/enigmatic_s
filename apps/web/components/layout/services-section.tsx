"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function ServicesSection() {
  const t = useTranslations("Services");

  return (
    <section className="w-full min-h-dvh flex items-center justify-center py-16 md:py-24 px-4 md:px-6">
      <div className="w-full max-w-[95%] bg-muted/25 text-foreground rounded-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
          {/* Section Header */}
          <div className="mb-8 md:mb-10 w-full">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15] mb-8"
            >
              <span className="text-foreground">{t("title")}{" "}</span>
              <span className="text-muted-foreground">
                {t("description")}
              </span>
            </motion.h2>
          </div>

          {/* Main Grid Layout */}
          <div className="border-t border-border">
            {/* Top Row - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left Panel */}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h3 className="text-xl md:text-2xl font-normal mb-4">
                  {t("panels.consulting")}
                </h3>
                <p className="text-base text-muted-foreground mb-6">
                  {t("panels.consultingDesc")}
                </p>
                {/* Visual Placeholder */}
                <div className="w-full h-64 bg-muted/30 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/home/consultation.jpg"
                    alt="Consulting Service"
                    className="object-cover w-full h-full rounded-xl"
                  />
                </div>
              </div>

              {/* Right Panel */}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h3 className="text-xl md:text-2xl font-normal mb-4">
                  {t("panels.nodal")}
                </h3>
                <p className="text-base text-muted-foreground mb-6">
                  {t("panels.nodalDesc")}
                </p>
                {/* Visual Placeholder */}
                <div className="w-full h-64 flex items-center justify-center p-4">
                  <img
                    src="/images/brand/nodal-logo.svg?v=3"
                    alt="Nodal Platform"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
              {/* Item 1 */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-normal mb-3">
                  {t("grid.triggers")}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t("grid.triggersDesc")}
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-normal mb-3">
                  {t("grid.human")}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t("grid.humanDesc")}
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <div className="w-2 h-2 rounded-full bg-pink-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-normal mb-3">
                  {t("grid.connectivity")}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t("grid.connectivityDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
