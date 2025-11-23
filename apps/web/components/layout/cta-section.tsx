"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CTAButtons } from "@/components/ui/cta-buttons";

interface CTASectionProps {
  title?: string;
  description?: string;
  hideSignIn?: boolean;
}

export function CTASection({
  title = "Ready to modernize your logistics?",
  description = "Join the forward-thinking teams building better operations with Enigmatic.",
  hideSignIn = false,
}: CTASectionProps) {
  return (
    <section className="w-full flex items-center justify-center py-16 md:py-24 px-4 md:px-6">
      <div className="w-full max-w-[95%] bg-muted/50 rounded-3xl overflow-hidden flex flex-col items-center justify-center py-16 md:py-32">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center flex flex-col items-center gap-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-20 h-20 md:w-24 md:h-24"
          >
            <Image
              src="/images/brand/enigmatic-logo.png"
              alt="Enigmatic Logo"
              fill
              className="object-contain"
            />
          </motion.div>

          <div className="flex flex-col gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl md:text-5xl font-light tracking-tight text-foreground"
            >
              {title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-secondary-foreground max-w-2xl mx-auto font-light leading-relaxed"
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <CTAButtons hideSignIn={hideSignIn} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
