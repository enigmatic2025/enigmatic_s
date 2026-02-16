"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaveLoaderProps {
  className?: string;
  barClassName?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { height: "h-6", barWidth: "w-1", gap: "gap-1" },
  md: { height: "h-10", barWidth: "w-1.5", gap: "gap-1.5" },
  lg: { height: "h-12", barWidth: "w-1.5", gap: "gap-1.5" },
};

export function WaveLoader({ className, barClassName, size = "md" }: WaveLoaderProps) {
  const { height, barWidth, gap } = sizeMap[size];

  return (
    <div className={cn("flex items-center", height, gap, className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn("rounded-full bg-foreground", barWidth, barClassName)}
          initial={{ height: "20%" }}
          animate={{ height: ["20%", "80%", "20%"] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}
