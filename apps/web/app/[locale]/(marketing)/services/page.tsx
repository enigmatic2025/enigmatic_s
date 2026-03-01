"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useSpring, easeOut, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  ChevronUp,
  Target,
  CircleDollarSign,
  Compass,
  Code,
  Rocket,
  TrendingUp,
  LucideIcon
} from "lucide-react";
import { CTASection } from "@/components/layout/cta-section";


const timelineVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

export default function ServicesPage() {
  const t = useTranslations("ServicesPage");
  const steps = [1, 2, 3, 4, 5, 6];
  
  const stepIcons = [
    Target,
    CircleDollarSign,
    Compass,
    Code,
    Rocket,
    TrendingUp
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 50%", "end center"]
  });

  const parallaxRef = useRef(null);
  const { scrollYProgress: parallaxProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"]
  });
  const parallaxY = useTransform(parallaxProgress, [0, 1], ["-25%", "25%"]);

  const scrollYProgressSpring = useSpring(scrollYProgress, {
    stiffness: 500,
    damping: 90,
  });

  const lineHeight = useTransform(scrollYProgressSpring, [0, 1], ["0%", "103%"]);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <section className="relative flex w-full flex-col justify-center overflow-hidden px-4 md:px-6 pt-32 pb-12 md:pt-40 md:pb-20">
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight max-w-3xl leading-[1.15] text-left"
          >
            <span className="text-foreground">{t("title")}. </span>
            <span className="text-muted-foreground">
              {t("subtitle")}
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="w-full flex items-center justify-center py-20 px-4 md:px-6">
        <div className="w-full max-w-[95%] text-foreground rounded-3xl overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="mb-8 md:mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-4xl font-normal tracking-tight max-w-5xl text-left leading-[1.15] mb-6"
              >
                {t("story.title")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl text-left font-light"
              >
                {t("story.description")}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Image Section */}
      <section ref={parallaxRef} className="w-full h-[50vh] md:h-[70vh] relative overflow-hidden my-12 md:my-20">
        <motion.div 
          style={{ y: parallaxY }}
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
        >
            <Image 
              src="/images/home/blackwhite.jpg" 
              alt="Operational Excellence" 
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="w-full pt-20 pb-80 px-4 md:px-6 relative" ref={containerRef}>
        <div className="max-w-5xl mx-auto relative">
          
          {/* Timeline Line Container */}
          <div className="absolute left-5 md:left-1/2 top-10 bottom-10 w-px -translate-x-1/2">
            <div className="w-full h-full border-l border-dashed border-border" />
            {/* The Beam */}
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute top-0 left-0 w-full border-l border-dashed border-violet-400 origin-top overflow-hidden"
            />
          </div>

          <div className="flex flex-col gap-24 relative z-10">
            
            {/* Consulting Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="bg-background px-6 py-12 z-20">
                <h3 className="text-xl md:text-2xl font-normal text-foreground">
                  {t("phases.consulting")}
                </h3>
              </div>
            </motion.div>

            {steps.slice(0, 3).map((step) => (
              <TimelineItem 
                key={step}
                index={step}
                icon={stepIcons[step - 1]}
                title={t(`steps.step${step}.title`)}
                description={t(`steps.step${step}.description`)}
                deliverables={t.raw(`steps.step${step}.deliverables`)}
                tools={t.raw(`steps.step${step}.tools`)}
                deliverablesLabel={t('deliverables')}
                toolsLabel={t('tools')}
              />
            ))}

            {/* Engineering Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-6 py-12 backdrop-blur-sm z-20 -my-12"
            >
              <div className="bg-background px-6 py-2">
                <h3 className="text-xl md:text-2xl font-normal text-foreground">
                  {t("phases.engineering")}
                </h3>
              </div>
              <p className="text-center text-muted-foreground max-w-lg px-4">
                {t("phases.engineeringNote")}
              </p>
            </motion.div>

            {steps.slice(3).map((step) => (
              <TimelineItem 
                key={step}
                index={step}
                icon={stepIcons[step - 1]}
                title={t(`steps.step${step}.title`)}
                description={t(`steps.step${step}.description`)}
                deliverables={t.raw(`steps.step${step}.deliverables`)}
                tools={t.raw(`steps.step${step}.tools`)}
                deliverablesLabel={t('deliverables')}
                toolsLabel={t('tools')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full pb-32 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-4xl font-normal tracking-tight mb-12 text-center"
          >
            {t("faq.title")}
          </motion.h2>
          <div className="flex flex-col gap-4">
            {(t.raw("faq.items") as Array<{ question: string; answer: string }>).map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title={t("cta.title")}
        description={t("cta.description")}
      />
    </main>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="border-b border-border pb-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left hover:text-primary transition-colors"
      >
        <span className="text-lg font-medium">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineItem({  
  index, 
  icon: Icon,
  title, 
  description,
  deliverables,
  tools,
  deliverablesLabel,
  toolsLabel
}: { 
  index: number, 
  icon: LucideIcon,
  title: string, 
  description: string,
  deliverables: string[],
  tools: string[],
  deliverablesLabel: string,
  toolsLabel: string
}) {
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={timelineVariants}
      className={cn(
        "flex flex-col md:flex-row items-center w-full gap-8 md:gap-0",
        isEven ? "md:flex-row-reverse" : ""
      )}
    >
      {/* Content Side */}
      <div className={cn(
        "w-full md:w-[calc(50%-40px)] pl-12 md:pl-0 flex flex-col justify-center",
        isEven ? "md:text-left" : "md:text-right"
      )}>
        <div className={cn(
          "flex flex-col gap-4",
          isEven ? "items-start" : "items-start md:items-end"
        )}>
          <span className="text-4xl text-center aspect-square text-foreground px-3 py-1 font-light">
            {index.toFixed(1)}
          </span>
          <div className={cn("flex flex-col gap-2", isEven ? "items-start" : "items-start md:items-end")}>
            <div className={cn("flex items-center gap-3", isEven ? "flex-row" : "flex-row md:flex-row-reverse")}>
              <Icon className="w-6 h-6 md:w-8 md:h-8 text-violet-500" strokeWidth={1.5} />
              <h3 className="text-2xl text-foreground">
                {title}
              </h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              {description}
            </p>
          </div>

          <div className={cn("flex flex-col gap-6 mt-2 w-full", isEven ? "items-start" : "items-start md:items-end")}>
            {/* Deliverables */}
            <div className={cn("flex flex-col gap-3", isEven ? "items-start" : "items-start md:items-end")}>
              <h4 className="text-sm font-semibold text-foreground">{deliverablesLabel}</h4>
              <ul className={cn("flex flex-col gap-2", isEven ? "items-start" : "items-start md:items-end")}>
                {deliverables.map((item, i) => (
                  <li key={i} className={cn(
                    "flex items-baseline gap-2 text-sm md:text-base text-muted-foreground",
                    !isEven && "md:flex-row-reverse text-right"
                  )}>
                     <div className="w-1.5 h-1.5 mt-2 rounded-full bg-zinc-400/60 dark:bg-zinc-500/60 shrink-0" />
                     <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className={cn("flex flex-col gap-3", isEven ? "items-start" : "items-start md:items-end")}>
              <h4 className="text-sm font-semibold text-foreground">{toolsLabel}</h4>
              <div className={cn("flex flex-wrap items-center gap-4", isEven ? "justify-start" : "justify-start md:justify-end")}>
                {tools.map((item, i) => (
                  <span 
                    key={i} 
                    className="text-xs md:text-sm px-2.5 py-1 rounded-sm text-violet-500 dark:text-violet-400 border border-violet-500 dark:border-violet-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Point */}
      <div className="absolute left-5 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-background border-2 border-violet-500 z-10 relative" />
      </div>

      {/* Empty Side (Spacer for Desktop) */}
      <div className="hidden md:block w-[calc(50%-40px)]" />
    </motion.div>
  );
}
