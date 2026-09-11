"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  VisualCanvasPreview,
  PowerfulBlocksPreview,
  ExtendFunctionalityPreview,
  HumanInLoopPreview,
} from "@/components/layout/nodal-visualizations";

const cards = [
  {
    title: "Guide the work with custom workflows.",
    description: "Design process journeys that match how your team actually operates. Whether triggered by an event, a status change, or a manual start, the workflow follows your real operating model.",
    header: <VisualCanvasPreview />,
    className: "md:col-span-1 md:row-span-2",
  },
  {
    title: "Connect & automate.",
    description: "Tie together your data, systems, and operational routines in a way that reflects your business, not a template.",
    header: <PowerfulBlocksPreview />,
    className: "md:col-span-1",
  },
  {
    title: "Extend your capabilities.",
    description: "Add custom calculations, alerts, and operational logic to improve control without replacing your current stack.",
    header: <ExtendFunctionalityPreview />,
    className: "md:col-span-1",
  },
  {
    title: "Human-in-the-loop control.",
    description: "Route the exceptions to the right people while keeping repetitive work moving efficiently behind the scenes.",
    header: <HumanInLoopPreview />,
    className: "md:col-span-2",
  },
];

export function NodalPlatformSection() {
  return (
    <section className="flex flex-col bg-background text-foreground py-12 md:py-20 min-h-full">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-6">
        {/* Enigmatic logo */}
        <div className="flex justify-center mb-12 md:mb-24">
          <Image
            src="/images/brand/enigmatic-logo.png"
            alt="Enigmatic"
            width={112}
            height={112}
            className="md:w-28 md:h-28 w-24 h-24 object-contain"
          />
        </div>

        {/* Section Header */}
        <div className="mb-12 md:mb-24 flex flex-col items-start gap-8 px-0">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">Tailored Systems, Built for You.{" "}</span>
            <span className="text-muted-foreground">
              We design purpose-built operating layers around your existing core systems and tools, giving you consistency and visibility without forcing a generic platform or a disruptive rip-and-replace.
            </span>
          </motion.h2>

          <Link
            href="/product/use-cases"
            className="group inline-flex items-center gap-2 text-violet-500 text-lg"
          >
            <span>See Use Cases</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[24rem]">
          {cards.map((card) => (
            <BentoGridItem
              key={card.title}
              title={card.title}
              description={card.description}
              header={card.header}
              className={card.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
