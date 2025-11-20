"use client";

import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { NodalNLogo } from "@/components/ui/nodal-n-logo";
import {
  VisualCanvasPreview,
  PowerfulBlocksPreview,
  ExtendFunctionalityPreview,
  HumanInLoopPreview,
} from "@/components/layout/nodal-visualizations";

export function NodalPlatformSection() {
  return (
    <section className="min-h-screen flex flex-col bg-background text-foreground px-4 md:px-6 py-20">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Section Header - Top Aligned with Nodal N Logo */}
        <div className="mb-16 md:mb-24 flex flex-col items-start gap-4">
          <div className="flex items-start">
            {/* Nodal N Logo, even larger and more spaced */}
            <NodalNLogo size={88} className="mr-12 md:w-28 md:h-28 w-20 h-20" />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
            >
              <span className="text-foreground">Unify Your Systems. </span>
              <span className="text-muted-foreground">
                Nodal adds a powerful orchestration layer on top of your
                existing core systems and tools, giving you perfect consistency
                and visibility without replacing a single tool.
              </span>
            </motion.h2>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[24rem]">
          {/* Card 1: Visual Canvas (Tall, Left) */}
          <BentoGridItem
            title="Orchestrate with our visual canvas."
            description="Build precise Action Flows for driver onboarding and rate updates. Enforce the exact same sequence every time, so execution never depends on who is at the desk."
            header={<VisualCanvasPreview />}
            className="md:col-span-1 md:row-span-2"
          />

          {/* Card 2: Powerful Blocks (Top Middle) */}
          <BentoGridItem
            title="Build with logic blocks."
            description="Define strict rules for routing and carrier selection. Break down silos by orchestrating logic across your existing systems in one place."
            header={<PowerfulBlocksPreview />}
            className="md:col-span-1"
          />

          {/* Card 3: Extend Functionality (Top Right) */}
          <BentoGridItem
            title="Extend your capabilities."
            description="Add custom calculations and automated alerts. Get full visibility into your data without changing your existing tech stack."
            header={<ExtendFunctionalityPreview />}
            className="md:col-span-1"
          />

          {/* Card 4: Human in Loop (Bottom Wide) */}
          <BentoGridItem
            title="Human-in-the-loop control."
            description="Seamlessly route exceptions to operators. Ensure critical decisions get human attention while keeping the rest of your process running on autopilot."
            header={<HumanInLoopPreview />}
            className="md:col-span-2"
          />
        </BentoGrid>
      </div>
    </section>
  );
}
