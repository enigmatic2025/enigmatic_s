"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function ServicesPage() {
  const t = useTranslations("ServicesPage");

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
    </main>
  );
}
