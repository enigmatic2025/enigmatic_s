"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function ParallaxPhoto({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);

  return (
    <div ref={ref} className="relative h-[clamp(280px,40vw,560px)] overflow-hidden bg-surface-1">
      <motion.div className="absolute inset-x-0 -inset-y-[30%] motion-reduce:transform-none" style={{ y: reduceMotion ? 0 : y }}>
        <Image src={src} alt={alt} fill priority unoptimized sizes="100vw" className="object-cover" />
      </motion.div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--scrim) via-transparent to-transparent" />
    </div>
  );
}
