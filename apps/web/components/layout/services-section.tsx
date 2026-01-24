"use client";

import React from "react";
import { motion } from "framer-motion";
import { Workflow, Network, Users } from "lucide-react";

export function ServicesSection() {
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
              <span className="text-foreground">Orchestrate Your Operations. </span>
              <span className="text-muted-foreground">
                Move from chaos to clarity. Enigmatic unifies your fragmented tools and workflows into a single, intelligent digital ecosystem.
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
                  Strategic Digital Transformation
                </h3>
                <p className="text-base text-muted-foreground mb-6">
                  We don't just patch holes. We re-engineer your core operational
                  workflows, replacing manual bottlenecks with scalable, automated
                  solutions tailored to your unique infrastructure.
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
                  The Nodal Operating System
                </h3>
                <p className="text-base text-muted-foreground mb-6">
                  The central nervous system for your business. Nodal connects
                  your teams, tools, and data into a single, intelligent
                  interface—executing actions so you don't have to.
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
                  <Workflow className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-normal mb-3">
                  Intelligent Triggers
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Automatically initiate complex workflows based on real-time
                  signals—whether it's an incoming email, a status update, or an
                  API event.
                </p>
              </div>

              {/* Item 2 */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-normal mb-3">
                  Human-Centric Control
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Amplify your workforce. Intelligent routing ensures only
                  critical exceptions reach your team, while standard tasks are
                  handled instantly.
                </p>
              </div>

              {/* Item 3 */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <Network className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl md:text-2xl font-normal mb-3">
                  Total Connectivity
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Bridge the gap between legacy systems and modern tools. Unify
                  data from ERPs, field devices, and external partners into one
                  source of truth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
