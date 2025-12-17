"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DottedIconProps {
  pattern: number[][];
  className?: string;
  dotColor?: string;
  dotSize?: string;
  gap?: string;
}

export function DottedIcon({ 
  pattern, 
  className, 
  dotColor = "bg-foreground",
  dotSize = "w-1.5 h-1.5",
  gap = "gap-2"
}: DottedIconProps) {
  return (
    <div 
      className={cn("grid", gap, className)} 
      style={{ gridTemplateColumns: `repeat(${pattern[0].length}, 1fr)` }}
    >
      {pattern.map((row, rowIndex) =>
        row.map((dot, colIndex) => (
          <motion.div
            key={`${rowIndex}-${colIndex}`}
            initial={{ opacity: 0.2, scale: 0.5 }}
            animate={{ 
              opacity: dot ? 1 : 0.1, 
              scale: dot ? 1 : 0.5,
              backgroundColor: dot ? "var(--foreground)" : "transparent"
            }}
            transition={{ 
              duration: 0.5,
              delay: (rowIndex * 0.05) + (colIndex * 0.05) 
            }}
            className={cn(
              "rounded-full aspect-square",
              dot ? dotColor : "bg-muted-foreground/10",
              dotSize
            )}
          />
        ))
      )}
    </div>
  );
}
