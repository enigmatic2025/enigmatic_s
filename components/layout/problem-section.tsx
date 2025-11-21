"use client";

import React from "react";
import { FileSpreadsheet, Unplug, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function ProblemSection() {
  return (
    <section className="w-full min-h-dvh flex items-center justify-center py-16 md:py-24 px-4 md:px-6 bg-background">
      <div className="w-full max-w-7xl mx-auto px-6 text-foreground">
        <div className="w-full">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex flex-col h-full p-6 rounded-3xl border border-border/50 bg-card text-card-foreground shadow-sm"
              >
                <div className="relative w-full aspect-4/3 mb-4 rounded-xl overflow-hidden bg-muted/50 min-h-[180px] md:min-h-[220px]">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <h3 className="text-xl md:text-2xl font-normal text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-base text-secondary-foreground leading-relaxed grow">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
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
    image: "/images/home/manual-workflows.jpg",
  },
  {
    title: "Disconnected Systems",
    description:
      "Disconnected TMS modules, carrier portals, ELD systems, and random AI tools each person picks create data silos, double-entry headaches, and constant workflow bottlenecks.",
    icon: <Unplug className="h-10 w-10 text-muted-foreground/80" />,
    image: "/images/home/disconnected-systems.jpg",
  },
  {
    title: "Hidden Costs",
    description:
      "All these fragmented processes and “everyone does it their own way” habits are quietly eating your margins, fueling demurrage fees, and costing your operation way more than you think.",
    icon: <TrendingDown className="h-10 w-10 text-muted-foreground/80" />,
    image: "/images/home/hidden-costs.jpg",
  },
];
