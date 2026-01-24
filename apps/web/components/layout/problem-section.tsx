"use client";

import React from "react";
import { FileSpreadsheet, Unplug, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { DottedIcon } from "@/components/ui/dotted-icon";

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
                The Operational Fragmentation Problem.{" "}
              </span>
              <span className="text-muted-foreground">
                Modern industrial operations are breaking under the weight of outdated
                tools and disconnected systems.
              </span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-8 md:gap-y-12">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="flex flex-col h-full"
              >
                <div className="relative w-full aspect-square mb-10 rounded-xl overflow-hidden flex items-center justify-center p-8 border hover:bg-muted/5 transition-colors">
                  <DottedIcon 
                    pattern={item.pattern} 
                    className="w-full h-full max-w-[180px] max-h-[180px]"
                    dotColor="bg-foreground"
                  />
                </div>

                <h3 className="text-xl md:text-2xl font-normal text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed grow">
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

const manualWorkflowsPattern = [
  [0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,0,0,0,0],
  [0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,1,1,1,1,0,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,0,1,1,1,0,0,0,0],
  [0,0,1,0,0,0,1,1,1,0,0,0],
  [0,0,0,0,0,0,0,1,1,0,0,0],
];

const disconnectedPattern = [
  [1,1,1,0,0,0,0,0,0,1,1,1],
  [1,1,1,0,0,0,0,0,0,1,1,1],
  [1,1,1,0,0,0,0,0,0,1,1,1],
  [0,0,0,1,0,0,0,0,1,0,0,0],
  [0,0,0,0,1,0,0,1,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,1,0,0,1,0,0,0,0],
  [0,0,0,1,0,0,0,0,1,0,0,0],
  [1,1,1,0,0,0,0,0,0,1,1,1],
  [1,1,1,0,0,0,0,0,0,1,1,1],
  [1,1,1,0,0,0,0,0,0,1,1,1],
];

const hiddenCostsPattern = [
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,1,1,0,1,1,0,1,1,0,0],
  [0,0,1,1,0,1,1,0,0,0,0,0],
  [0,0,1,1,0,1,1,0,0,0,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,0,1,1,0,0],
  [0,0,0,0,0,1,1,0,1,1,0,0],
  [0,0,1,1,0,1,1,0,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0],
];

const items = [
  {
    title: "Manual Coordination",
    description:
      "Teams are still glued to spreadsheets, emails, and phone calls to coordinate complex operations. Critical updates get missed, schedules slip, and everyone works from different playbooks.",
    pattern: manualWorkflowsPattern,
  },
  {
    title: "Disconnected Data",
    description:
      "Silos between ERPs, specialized software, and field tools create blind spots. Data is double-entered, inaccurate, and trapped in systems that don't talk to each other.",
    pattern: disconnectedPattern,
  },
  {
    title: "Reactive Firefighting",
    description:
      "All this fragmentation forces your best people to spend their day chasing information and fixing errors instead of optimizing performance and driving growth.",
    pattern: hiddenCostsPattern,
  },
];
