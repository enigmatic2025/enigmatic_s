"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { useState, useEffect } from "react";

type IndustryItem = {
  name: string;
  description: string;
  icon?: LucideIcon;
  image?: string;
};

const industries: IndustryItem[] = [
  {
    name: "Transportations",
    image: "/images/home/transportation.svg",
    description: "Unify carrier networks into a single command center for seamless execution."
  },
  {
    name: "Supply Chain",
    image: "/images/home/supply chain.svg",
    description: "Replace manual tracking with intelligent orchestration to predict disruptions."
  },
  {
    name: "Manufacturing",
    image: "/images/home/manufacturing.svg",
    description: "Synchronize material flows with production schedules for zero-delay operations."
  },
  {
    name: "Construction",
    image: "/images/home/construction.svg",
    description: "Streamline coordination between sites and suppliers for precise delivery."
  },
  {
    name: "Storage",
    image: "/images/home/storage.svg",
    description: "Accelerate fulfillment through intelligent workflows that optimize inventory."
  },
  {
    name: "Energy",
    image: "/images/home/energy.svg",
    description: "Modernize compliance tracking to ensure safe, efficient infrastructure logistics."
  }
];

export function MissionQuote() {
  return (
    <section className="w-full flex flex-col items-center justify-center pt-16 md:pt-24 bg-background overflow-hidden space-y-24">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 md:gap-24">

        {/* Mission Statement */}
        <div className="w-full">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight text-left leading-[1.15] max-w-4xl"
          >
            <span className="text-foreground">The Mission. </span>
            <span className="text-muted-foreground">
              We architect your operational technology ecosystem to be more integrated, intelligent, and intuitive.
            </span>
          </motion.h2>
        </div>

        {/* Industry Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y border-border overflow-hidden">
          {industries.map((item, i) => (
            <div
              key={item.name}
              className="bg-background p-12"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col gap-4"
              >
                {item.image ? (
                   <div className="w-64 h-64 relative">
                     <img
                       src={item.image}
                       alt={item.name}
                       className="w-full h-full object-contain object-left"
                     />
                   </div>
                ) : (
                  <div className="p-2 w-fit rounded-lg bg-black dark:bg-white">
                    {item.icon && <item.icon className="w-5 h-5 text-background" />}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-foreground text-lg">{item.name}</h3>
                  <p className="text-base text-muted-foreground mt-2">{item.description}</p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="w-full bg-muted/30 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-7xl mx-auto px-6 flex flex-col gap-4"
          >
            <span className="text-5xl md:text-6xl font-light tracking-tight text-foreground">
              80%+
            </span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              of industrial enterprises struggle with fragmented data across disconnected legacy systems.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-7xl mx-auto px-6 flex flex-col gap-4"
          >
            <span className="text-5xl md:text-6xl font-light tracking-tight text-foreground">
              Up to 50%
            </span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              of operational bandwidth is consumed by manual coordination between field and office.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="max-w-7xl mx-auto px-6 flex flex-col gap-4"
          >
            <span className="text-5xl md:text-6xl font-light tracking-tight text-foreground">
              30–40%
            </span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              of potential margin is eroded by reactive problem-solving instead of strategic planning.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



