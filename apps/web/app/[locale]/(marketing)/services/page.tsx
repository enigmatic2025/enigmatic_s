"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useSpring, easeOut, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { 
  ArrowRightLeft,
  BarChart3,
  ChevronDown, 
  ChevronUp,
  Code2,
  Compass,
  Gauge,
  Rocket,
  Target
} from "lucide-react";
import { CTASection } from "@/components/layout/cta-section";


const timelineVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

export default function ServicesPage() {
  const t = useTranslations("ServicesPage");
  const steps = [1, 2, 3, 4, 5, 6];
  const stepIcons = [Target, BarChart3, Compass, Code2, Rocket, Gauge];
  
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
              src="/images/home/corporate.jpg" 
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
          <div className="absolute left-5 md:left-1/2 top-8 bottom-8 w-px -translate-x-1/2">
            <div className="w-full h-full border-l border-dashed border-border/80" />
            <motion.div 
              style={{ height: lineHeight }}
              className="absolute top-0 left-[-0.5px] w-[2px] border-l border-dashed border-violet-400/80 origin-top overflow-hidden"
            />
          </div>

          <div className="flex flex-col gap-24 relative z-10">
            
            {/* Consulting Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-6 py-12 backdrop-blur-sm z-20 -my-12"
            >
              <div className="bg-background px-6 py-2">
                <h3 className="text-xl md:text-2xl font-normal text-foreground">
                  {t("phases.consulting")}
                </h3>
              </div>
              <p className="text-center text-muted-foreground max-w-lg px-4">
                {t("phases.consultingNote")}
              </p>
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
  icon: typeof Target,
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
        "relative flex flex-col md:flex-row items-center w-full gap-6 md:gap-0",
        isEven ? "md:flex-row-reverse" : ""
      )}
    >
      {/* Content Side */}
      <div className={cn(
        "w-full md:w-[calc(50%-40px)] pl-12 md:pl-0 flex flex-col justify-center",
        isEven ? "md:pr-10" : "md:pl-10"
      )}>
        <div className={cn(
          "flex flex-col gap-5 rounded-[28px] border border-border/80 bg-card/60 p-5 md:p-7 shadow-[0_1px_0_rgba(0,0,0,0.02)] backdrop-blur-sm w-full md:max-w-[640px]",
          isEven ? "items-start md:mr-auto" : "items-start md:ml-auto md:items-end"
        )}>
          <div className={cn(
            "flex w-full items-start gap-3",
            isEven ? "justify-start" : "flex-row-reverse justify-start"
          )}>
            <div className={cn("flex min-w-0 flex-1 flex-col gap-1", isEven ? "items-start" : "items-end")}>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Phase {String(index).padStart(2, "0")}
              </span>
              <h3 className="text-2xl text-foreground leading-tight">
                {title}
              </h3>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-transparent text-violet-500">
              <Icon className="h-4 w-4" />
            </div>
          </div>

          <p className={cn("text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg", isEven ? "text-left" : "text-left md:text-right")}>
            {description}
          </p>

          <div className={cn("flex flex-col gap-6 mt-1 w-full", isEven ? "items-start" : "items-start md:items-end")}>
            {/* Deliverables */}
            <div className={cn("flex flex-col gap-3", isEven ? "items-start" : "items-start md:items-end")}>
              <h4 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">{deliverablesLabel}</h4>
              <ul className={cn("flex flex-col gap-2.5", isEven ? "items-start" : "items-start md:items-end")}>
                {deliverables.map((item, i) => (
                  <li key={i} className={cn(
                    "flex items-start gap-2 text-sm md:text-base text-muted-foreground",
                    !isEven && "md:flex-row-reverse text-right"
                  )}>
                     <div className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-500/70 shrink-0" />
                     <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div className={cn("flex flex-col gap-3", isEven ? "items-start" : "items-start md:items-end")}>
              <h4 className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/80">{toolsLabel}</h4>
              <div className={cn("flex flex-wrap items-center gap-2", isEven ? "justify-start" : "justify-start md:justify-end")}>
                {tools.map((item, i) => (
                  <span 
                    key={i} 
                    className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] md:text-xs text-foreground/80"
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
        <div className="relative z-10 h-4 w-4 rounded-full border-2 border-violet-500 bg-background shadow-[0_0_0_4px_rgba(139,92,246,0.08)]" />
      </div>

      {/* Empty Side (Spacer for Desktop) */}
      <div className="hidden md:block w-[calc(50%-40px)]" />
    </motion.div>
  );
}
