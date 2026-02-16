"use client";

import Image from "next/image";
import { Link } from "@/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
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

function ParallaxStat({ 
  image, 
  stat, 
  desc, 
  delay 
}: { 
  image: string; 
  stat: string; 
  desc: string; 
  delay: number;
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative h-200 w-full flex flex-col justify-end p-8 md:p-12 group overflow-hidden"
    >
      <motion.div 
        style={{ y }} 
        className="absolute inset-0 h-[130%] w-full -top-[15%]"
      >
        <Image
          src={image}
          alt={desc}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/40 dark:bg-black/70" />
      <div className="relative z-10 flex flex-col gap-4">
        <span className="text-5xl md:text-6xl font-light tracking-tight text-white">
          {stat}
        </span>
        <p className="text-lg text-white/90 leading-relaxed max-w-sm min-h-22.5 flex items-start">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

export function MissionQuote() {
  const t = useTranslations("Mission");

  return (
    <section className="w-full flex flex-col items-center justify-center pt-16 md:pt-24 bg-background overflow-hidden space-y-24">
      <div className="w-full max-w-7xl mx-auto px-6 flex flex-col gap-12 md:gap-24">

        {/* Mission Statement */}
        <div className="w-full px-0 flex flex-col items-start gap-8">
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

          <Link 
            href="/company/about-us" 
            className="group inline-flex items-center gap-2 text-violet-500 text-lg"
          >
            <span>{t("aboutUs")}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
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
      <div className="w-full grid grid-cols-1 md:grid-cols-3">
        <ParallaxStat 
          image="/images/home/stat1.jpg"
          stat={t("stats.stat1")}
          desc={t("stats.desc1")}
          delay={0.2}
        />
        <ParallaxStat 
          image="/images/home/stat2.jpg"
          stat={t("stats.stat2")}
          desc={t("stats.desc2")}
          delay={0.3}
        />
        <ParallaxStat 
          image="/images/home/stat3.jpg"
          stat={t("stats.stat3")}
          desc={t("stats.desc3")}
          delay={0.4}
        />

      </div>
    </section>
  );
}



