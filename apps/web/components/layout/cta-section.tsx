"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface CTASectionProps {
  title?: string;
  description?: string;
  label?: string;
  buttonText?: string;
  buttonLink?: string;
}

export function CTASection({
  title = "Modernize what moves the world",
  description = "Help us untangle the world’s most complex systems. If you’re driven by real problems and real impact, Enigmatic is where your work matters.",
  label = "Get IN TOUCH",
  buttonText = "Collaborate",
  buttonLink = "/careers",
}: CTASectionProps) {
  return (
    <section className="w-full bg-black text-white py-24 md:py-32 overflow-hidden relative min-h-[600px] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-2xl flex flex-col gap-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-medium tracking-wider text-neutral-400 uppercase"
          >
            {label}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-medium tracking-tight leading-[1.1]"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-xl leading-relaxed"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button size="lg" className="text-lg px-8 h-14 w-full sm:w-auto bg-white text-black hover:bg-white" asChild>
              <Link href="mailto:collaborate@enigmatic.works?subject=Collaboration Inquiry">
                Collaborate
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

