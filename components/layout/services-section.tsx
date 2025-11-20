"use client";

import React from "react";
import { motion } from "framer-motion";
import { Workflow, Network, Users } from "lucide-react";

export function ServicesSection() {
  return (
    <section className="min-h-screen flex items-center justify-center py-20 bg-muted/50 text-foreground mx-4 md:mx-6 rounded-3xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        {/* Section Header */}
        <div className="mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15] mb-6"
          >
            Take Back Control
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-left font-light"
          >
            Swivel chairing, niche processes, and tribal knowledge all come from
            the inherent complexity of logistics. Organizations with tighter
            control over their operations dominate in a highly competitive
            market where every load counts.
          </motion.p>
        </div>

        {/* Main Grid Layout */}
        <div className="border-t border-border">
          {/* Top Row - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Panel */}
            <div className="p-8 md:p-12 flex flex-col h-full">
              <h3 className="text-xl md:text-2xl font-normal mb-4">
                Strategic Engineering
              </h3>
              <p className="text-base text-secondary-foreground mb-8">
                Our experts embed with your team to audit your workflows and
                tech stack. We design and build custom solutions that solve your
                unique operational bottlenecks.
              </p>
              {/* Visual Placeholder */}
              <div className="w-full aspect-4/3 bg-muted/30 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center">
                <img
                  src="/images/services/consultation-home.jpg"
                  alt="Consulting Service"
                  className="object-cover w-full h-full rounded-xl"
                />
              </div>
            </div>

            {/* Right Panel */}
            <div className="p-8 md:p-12 flex flex-col h-full">
              <h3 className="text-xl md:text-2xl font-normal mb-4">
                The Nodal Platform
              </h3>
              <p className="text-base text-secondary-foreground mb-8">
                The business process platform where technical engineers design
                Action Flows that blend AI, automation, and human expertise into
                one consistent operation.
              </p>
              {/* Visual Placeholder */}
              <div className="w-full aspect-4/3 flex items-center justify-center p-12">
                <img
                  src="/images/services/nodal-logo.svg?v=3"
                  alt="Nodal Platform"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Bottom Row - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
            {/* Item 1 */}
            <div className="p-8 md:p-12">
              <div className="mb-4">
                <Workflow className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-normal mb-3">
                Event-Driven Triggers
              </h3>
              <p className="text-base text-secondary-foreground leading-relaxed">
                Kick off workflows automatically based on email receipts, TMS
                status changes, or API webhooks.
              </p>
            </div>

            {/* Item 2 */}
            <div className="p-8 md:p-12">
              <div className="mb-4">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-normal mb-3">
                Human-in-the-Loop
              </h3>
              <p className="text-base text-secondary-foreground leading-relaxed">
                Ensure consistency with native validation steps. When confidence
                is low, Nodal loops in a human to review and approve.
              </p>
            </div>

            {/* Item 3 */}
            <div className="p-8 md:p-12">
              <div className="mb-4">
                <Network className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-normal mb-3">
                Universal Connectivity
              </h3>
              <p className="text-base text-secondary-foreground leading-relaxed">
                Seamlessly connect with any TMS, WMS, ELD, or EDI partner. Break
                down data silos across your stack.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
