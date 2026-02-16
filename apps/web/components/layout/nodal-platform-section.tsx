"use client";

import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Link } from "@/navigation";
import { ArrowRight } from "lucide-react";
import {
  VisualCanvasPreview,
  PowerfulBlocksPreview,
  ExtendFunctionalityPreview,
  HumanInLoopPreview,
} from "@/components/layout/nodal-visualizations";
import { useTranslations } from "next-intl";

export function NodalPlatformSection() {
  const t = useTranslations("NodalPlatform");

  return (
    <section className="flex flex-col bg-background text-foreground py-12 md:py-20 min-h-full">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-6">
        {/* Nodal SVG Logo */}
        <div className="flex justify-center mb-12 md:mb-24">
          <img
            src="/images/brand/nodal-logo.svg?v=3"
            alt="Nodal Platform"
            className="md:w-40 md:h-40 w-32 h-32 object-contain"
          />
        </div>

        {/* Section Header */}
        <div className="mb-12 md:mb-24 flex flex-col items-start gap-4 px-0">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15]"
          >
            <span className="text-foreground">{t("title")}{" "}</span>
            <span className="text-muted-foreground">
              {t("description")}
            </span>
          </motion.h2>

          <Link 
            href="/product/use-cases" 
            className="group inline-flex items-center gap-2 text-violet-500 text-lg mt-2"
          >
            <span>{t("seeUseCases")}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bento Grid Layout */}
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[24rem]">
          {/* Card 1: Visual Canvas (Tall, Left) */}
          <BentoGridItem
            title={t("cards.flow")}
            description={t("cards.flowDesc")}
            header={<VisualCanvasPreview />}
            className="md:col-span-1 md:row-span-2"
          />

          {/* Card 2: Powerful Blocks (Top Middle) */}
          <BentoGridItem
            title={t("cards.connect")}
            description={t("cards.connectDesc")}
            header={<PowerfulBlocksPreview />}
            className="md:col-span-1"
          />

          {/* Card 3: Extend Functionality (Top Right) */}
          <BentoGridItem
            title={t("cards.extend")}
            description={t("cards.extendDesc")}
            header={<ExtendFunctionalityPreview />}
            className="md:col-span-1"
          />

          {/* Card 4: Human in Loop (Bottom Wide) */}
          <BentoGridItem
            title={t("cards.human")}
            description={t("cards.humanDesc")}
            header={<HumanInLoopPreview />}
            className="md:col-span-2"
          />
        </BentoGrid>
      </div>
    </section>
  );
}
