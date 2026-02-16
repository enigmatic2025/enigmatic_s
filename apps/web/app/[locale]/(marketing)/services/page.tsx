"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function ServicesPage() {
  const t = useTranslations("ServicesPage");

  // Define steps array directly to map over
  const steps = [0, 1, 2, 3, 4, 5];

  return (
    <main className="flex min-h-screen flex-col">
      <section className="relative flex w-full flex-col justify-center overflow-hidden px-4 md:px-6 pt-28 pb-12 md:pt-40 md:pb-20">
        <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-normal tracking-tight max-w-3xl leading-[1.15] text-left"
          >
            <span className="text-foreground">{t("title")}. </span>
            <span className="text-muted-foreground">
              {t("subtitle")}
            </span>
          </motion.h1>
        </div>
      </section>

      {/* Steps Section */}
      <section className="w-full flex items-center justify-center py-20 px-4 md:px-6">
        <div className="w-full max-w-[95%] text-foreground">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-8 md:gap-12">
            {steps.map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full border border-border bg-background p-8 md:p-12 rounded-3xl"
              >
                <h3 className="text-xl md:text-2xl font-normal mb-8 text-foreground">
                  {t(`steps.step${index}.title`)}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                  {/* Left Column */}
                  <div className="flex flex-col gap-3">
                    {/* @ts-ignore */}
                    {(t.raw(`steps.step${index}.lists.left`) as string[]).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                        <span className="text-muted-foreground leading-relaxed text-lg">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-3">
                    {/* @ts-ignore */}
                    {(t.raw(`steps.step${index}.lists.right`) as string[]).map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-foreground shrink-0" />
                        <span className="text-muted-foreground leading-relaxed text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
