"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface CTASectionProps {
  title?: string;
  description?: string;
  label?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function CTASection({
  title,
  description,
  label,
  buttonText,
  buttonLink = "/careers",
}: CTASectionProps) {
  const t = useTranslations("CTA");
  
  const contentTitle = title || t("title");
  const contentDescription = description || t("description");
  const contentLabel = label || t("label");
  const contentButtonText = buttonText || t("button");

  return (
    <section className="w-full bg-black text-white py-16 md:py-24 overflow-hidden relative min-h-[600px] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-2xl flex flex-col gap-8 z-10">
          <motion.span
            viewport={{ once: true }}
            className="text-lg tracking-tight leading-[1.15] text-neutral-400"
          >
            {contentLabel}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl tracking-tight leading-[1.15]"
          >
            {contentTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-xl leading-relaxed"
          >
            {contentDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button className="sm:w-auto bg-white text-black hover:bg-white" asChild>
              <Link href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry">
                {contentButtonText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

