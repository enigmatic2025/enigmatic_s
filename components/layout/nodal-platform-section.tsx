"use client";

import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
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
        {/* Section Header - Top Aligned */}
        <div className="mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">Unify Your Systems. </span>
            <span className="text-muted-foreground">
              Nodal adds a powerful orchestration layer on top of your TMS, EDI,
              ELD, and every other tool you already use.
            </span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base text-secondary-foreground max-w-3xl text-left space-y-4 mt-6"
          >
            <p>
              Your engineers build precise Action Flows that enforce the exact
              same sequence for every process (driver onboarding, exception
              handling, rate updates) so nothing depends on who is at the desk
              that day.
            </p>
            <p>
              You get perfect consistency, zero silos, and full visibility
              without replacing a single system.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid Layout */}
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[24rem]">
          {/* Card 1: Visual Canvas (Tall, Left) */}
          <BentoGridItem
            title="Orchestrate with our visual canvas."
            description="Map complex logistics workflows visually. Connect TMS, ELD, and ERP systems in a single view."
            header={<VisualCanvasPreview />}
            className="md:col-span-1 md:row-span-2"
          />

          {/* Card 2: Powerful Blocks (Top Middle) */}
          <BentoGridItem
            title="Build with logic blocks."
            description="Define precise rules for shipment routing, carrier selection, and exception handling."
            header={<PowerfulBlocksPreview />}
            className="md:col-span-1"
          />

          {/* Card 3: Extend Functionality (Top Right) */}
          <BentoGridItem
            title="Extend your capabilities."
            description="Add custom calculations, data transformations, and automated alerts to any process."
            header={<ExtendFunctionalityPreview />}
            className="md:col-span-1"
          />

          {/* Card 4: Human in Loop (Bottom Wide) */}
          <BentoGridItem
            title="Human-in-the-loop control."
            description="Seamlessly route exceptions to operators when automated rules aren't enough. Keep humans in control of critical decisions."
            header={<HumanInLoopPreview />}
            className="md:col-span-2"
          />
        </BentoGrid>
      </div>
    </section>
  );
}
