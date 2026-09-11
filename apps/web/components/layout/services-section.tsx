"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrowserFrame } from "@/components/ui/browser-frame";

const PlatformSkeleton = () => (
  <div className="flex h-full w-full bg-background">
    {/* Sidebar */}
    <div className="w-12 border-r h-full flex flex-col items-center p-3 gap-4 bg-muted/30">
      <div className="w-6 h-6 rounded-md bg-violet-500/20" />
      <div className="w-full h-px bg-border" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-6 h-6 rounded-md bg-muted-foreground/10" />
      ))}
    </div>
    {/* Main Content */}
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-border/50">
        <div className="h-4 w-24 rounded bg-muted-foreground/10" />
        <div className="flex gap-2">
          <div className="h-4 w-4 rounded-full bg-muted-foreground/10" />
          <div className="h-4 w-4 rounded-full bg-muted-foreground/10" />
        </div>
      </div>
      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 h-24 rounded-lg border border-border/50 bg-muted/10 p-3">
          <div className="h-3 w-1/3 rounded bg-muted-foreground/10 mb-2" />
          <div className="h-12 w-full rounded bg-muted-foreground/5" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="h-20 rounded-lg border border-border/50 bg-muted/10 p-3">
            <div className="h-3 w-1/2 rounded bg-muted-foreground/10 mb-2" />
            <div className="h-8 w-full rounded bg-muted-foreground/5" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const gridItems = [
  {
    title: "Intelligent Triggers",
    description: "Automatically initiate complex workflows based on e-mails, status updates, or API events.",
    dot: "bg-blue-500",
  },
  {
    title: "Human Control",
    description: "Route critical exceptions to experts; automate the rest.",
    dot: "bg-violet-500",
  },
  {
    title: "Total Connectivity",
    description: "Unify data from ERPs, devices, and partners into one source.",
    dot: "bg-pink-500",
  },
];

export function ServicesSection() {
  return (
    <section className="w-full min-h-full flex flex-col items-center justify-center py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 w-full mb-8 md:mb-10">
        <div className="w-full px-0 flex flex-col items-start gap-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">Orchestrate Your Operations.{" "}</span>
            <span className="text-muted-foreground">
              Move from chaos to clarity. Enigmatic unifies your fragmented tools and workflows into a single, intelligent digital ecosystem.
            </span>
          </motion.h2>

          <Link
            href="/services"
            className="group inline-flex items-center gap-2 text-violet-500 text-lg"
          >
            <span>Learn More</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <div className="w-full max-w-[95%] bg-muted/25 text-foreground rounded-3xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 w-full">
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
                  We don&apos;t just patch holes. We re-engineer your core operational workflows, replacing manual bottlenecks with scalable, automated solutions tailored to your unique infrastructure.
                </p>
                {/* Visual Placeholder */}
                <div className="w-full h-64 bg-muted/30 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/home/office.jpeg"
                    alt="Consulting Service"
                    className="object-cover w-full h-full rounded-xl"
                  />
                </div>
              </div>

              {/* Right Panel */}
              <div className="p-6 md:p-8 flex flex-col h-full">
                <h3 className="text-xl md:text-2xl font-normal mb-4">
                  Custom Operating Systems
                </h3>
                <p className="text-base text-muted-foreground mb-6">
                  Purpose-built digital environments designed around your teams, workflow realities, and data—without forcing a generic platform or a one-size-fits-all workaround.
                </p>
                {/* Visual Placeholder */}
                <div className="w-full h-64 flex items-center justify-center p-4">
                  <BrowserFrame className="w-full h-full shadow-sm border-opacity-40" url="app.nodal.com/dashboard">
                    <PlatformSkeleton />
                  </BrowserFrame>
                </div>
              </div>
            </div>

            {/* Bottom Row - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-t border-border">
              {gridItems.map((item) => (
                <div key={item.title} className="p-6 md:p-8">
                  <div className="mb-4">
                    <div className={`w-2 h-2 rounded-full ${item.dot}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-normal mb-3">
                    {item.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
