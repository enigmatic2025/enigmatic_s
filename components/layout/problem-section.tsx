"use client";

import React from "react";
import { FileSpreadsheet, Unplug, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export function ProblemSection() {
  return (
    <section className="flex items-center justify-center py-16 md:py-24 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div className="mb-12 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">
              The Logistics Fragmentation Problem.{" "}
            </span>
            <span className="text-muted-foreground">
              Modern supply chains are breaking under the weight of outdated
              tools and disconnected systems.
            </span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 md:gap-y-16">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="w-full h-px bg-border/50" />

              {/* Icon removed as requested */}
              <h3 className="text-xl md:text-2xl font-normal text-foreground">
                {item.title}
              </h3>
              <p className="text-base text-secondary-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const items = [
  {
    title: "Manual Workflows",
    description:
      "Your logistics teams are still glued to spreadsheets, emails, and manual EDI workarounds, so exceptions get missed, shipments delay, and everyone works from different playbooks.",
    icon: <FileSpreadsheet className="h-10 w-10 text-muted-foreground/80" />,
  },
  {
    title: "Disconnected Systems",
    description:
      "Disconnected TMS modules, carrier portals, ELD systems, and random AI tools each person picks create data silos, double-entry headaches, and constant workflow bottlenecks.",
    icon: <Unplug className="h-10 w-10 text-muted-foreground/80" />,
  },
  {
    title: "Hidden Costs",
    description:
      "All these fragmented processes and “everyone does it their own way” habits are quietly eating your margins, fueling demurrage fees, and costing your operation way more than you think.",
    icon: <TrendingDown className="h-10 w-10 text-muted-foreground/80" />,
  },
];
