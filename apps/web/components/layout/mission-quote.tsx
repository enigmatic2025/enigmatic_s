"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Factory,
  Truck,
  Network,
  Warehouse,
  Plane,
  Ship,
  Container
} from "lucide-react";
import { useState, useEffect } from "react";

const industries = [
  {
    name: "Enterprise Shippers",
    icon: Factory,
    description: "Orchestrate complex supply chains."
  },
  {
    name: "Freight Brokers",
    icon: Network,
    description: "Connect capacity with demand."
  },
  {
    name: "Motor Carriers",
    icon: Truck,
    description: "Optimize fleet operations."
  },
  {
    name: "3PL & Warehousing",
    icon: Warehouse,
    description: "Streamline inventory & fulfillment."
  },
  {
    name: "Freight Forwarders",
    icon: Plane,
    description: "Manage global air & ocean flows."
  },
  {
    name: "Drayage & Intermodal",
    icon: Container,
    description: "Connect ports to rail & road."
  }
];

export function MissionQuote() {
  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center py-16 md:py-24 px-4 md:px-6 bg-background overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-12 md:gap-24">

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
                We architect your logistics technology ecosystem to be more integrated, intelligent, and intuitive.
              </span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link 
                href="/product/use-cases"
                className="mt-8 inline-flex items-center gap-2 text-lg font-light text-muted-foreground hover:text-foreground transition-colors group"
              >
                Explore complex, repeatable operations.
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* Industry Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
            {industries.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="p-6 rounded-xl border bg-card text-card-foreground flex flex-col gap-4"
              >
                <div className="p-2 w-fit rounded-lg bg-black dark:bg-white">
                  <item.icon className="w-5 h-5 text-background" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border/40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-2"
            >
              <span className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
                80%+
              </span>
              <p className="text-muted-foreground leading-relaxed">
                of logistics organizations operate across 8–15 disconnected systems
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-2"
            >
              <span className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
                Up to 50%
              </span>
              <p className="text-muted-foreground leading-relaxed">
                of daily logistics work is still coordinated through email,
                spreadsheets, and messaging
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col gap-2"
            >
              <span className="text-4xl md:text-5xl font-light tracking-tight text-foreground">
                30–40%
              </span>
              <p className="text-muted-foreground leading-relaxed">
                of operations capacity in complex supply chains is consumed by
                exceptions and rework
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}



