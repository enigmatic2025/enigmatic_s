"use client";

import Image from "next/image";
import { Link } from "@/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  objectPosition?: string;
  className?: string;
};

const industries: IndustryItem[] = [
  {
    nameKey: "industries.transportation",
    image: "/images/home/transportation.png",
    descriptionKey: "industries.transportationDesc",
    objectPosition: "object-bottom"
  },
  {
    nameKey: "industries.supplyChain",
    image: "/images/home/supplychain.png",
    descriptionKey: "industries.supplyChainDesc",
    className: "brightness-[0.8]"
  },
  {
    nameKey: "industries.manufacturing",
    image: "/images/home/manufacturing.png",
    descriptionKey: "industries.manufacturingDesc",
    objectPosition: "object-bottom"
  },
  {
    nameKey: "industries.construction",
    image: "/images/home/construction.png",
    descriptionKey: "industries.constructionDesc",
    objectPosition: "object-bottom"
  },
  {
    nameKey: "industries.storage",
    image: "/images/home/storage.png",
    descriptionKey: "industries.storageDesc",
    className: "brightness-[0.8]"
  },
  {
    nameKey: "industries.energy",
    image: "/images/home/energy.png",
    descriptionKey: "industries.energyDesc",
    className: "brightness-[0.9]"
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
          className="object-cover transition-transform duration-700"
        />
      </motion.div>
      <div className="absolute inset-0 bg-black/40" />
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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % industries.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

        {/* Industry Gallery Carousel */}
        <div className="w-full aspect-video md:aspect-21/9 relative overflow-hidden rounded-2xl">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentIndex}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={industries[currentIndex].image!}
                alt={t(industries[currentIndex].nameKey)}
                fill
                className={`object-cover ${industries[currentIndex].objectPosition || "object-center"} ${industries[currentIndex].className || ""}`}
                priority
              />
              <div className="absolute inset-0" />
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-2xl">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-normal text-white mb-4"
                >
                  {t(industries[currentIndex].nameKey)}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg text-white/90 leading-relaxed"
                >
                  {t(industries[currentIndex].descriptionKey)}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Indicators */}
          <div className="absolute bottom-8 right-8 flex gap-2 z-10">
            {industries.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
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



