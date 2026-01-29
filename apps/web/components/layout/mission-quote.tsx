"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

type IndustryItem = {
  nameKey: string;
  descriptionKey: string;
  icon?: LucideIcon;
  image?: string;
};

const industries: IndustryItem[] = [
  {
    nameKey: "industries.transportation",
    image: "/images/home/transportation.svg",
    descriptionKey: "industries.transportationDesc"
  },
  {
    nameKey: "industries.supplyChain",
    image: "/images/home/supply chain.svg",
    descriptionKey: "industries.supplyChainDesc"
  },
  {
    nameKey: "industries.manufacturing",
    image: "/images/home/manufacturing.svg",
    descriptionKey: "industries.manufacturingDesc"
  },
  {
    nameKey: "industries.construction",
    image: "/images/home/construction.svg",
    descriptionKey: "industries.constructionDesc"
  },
  {
    nameKey: "industries.storage",
    image: "/images/home/storage.svg",
    descriptionKey: "industries.storageDesc"
  },
  {
    nameKey: "industries.energy",
    image: "/images/home/energy.svg",
    descriptionKey: "industries.energyDesc"
  }
];

export function MissionQuote() {
  const t = useTranslations("Mission");

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
            <span className="text-foreground">{t("label")} </span>
            <span className="text-muted-foreground">
              {t("description")}
            </span>
          </motion.h2>
        </div>

        {/* Industry Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-y border-border overflow-hidden">
          {industries.map((item, i) => (
            <div
              key={item.nameKey}
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
                       alt={t(item.nameKey)}
                       className="w-full h-full object-contain object-left"
                     />
                   </div>
                ) : (
                  <div className="p-2 w-fit rounded-lg bg-black dark:bg-white">
                    {item.icon && <item.icon className="w-5 h-5 text-background" />}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-foreground text-lg">{t(item.nameKey)}</h3>
                  <p className="text-base text-muted-foreground mt-2">{t(item.descriptionKey)}</p>
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
              {t("stats.stat1")}
            </span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("stats.desc1")}
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
              {t("stats.stat2")}
            </span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("stats.desc2")}
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
              {t("stats.stat3")}
            </span>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("stats.desc3")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



