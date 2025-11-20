"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AuroraBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-background pointer-events-none">
      {/* Theme-aware Aurora Gradients */}
      <div className="absolute inset-0 opacity-30 blur-[80px]">
        <motion.div
          className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%]"
          animate={{
            transform: [
              "translate(0, 0) rotate(0deg)",
              "translate(-2%, 2%) rotate(5deg)",
              "translate(2%, -2%) rotate(-5deg)",
              "translate(0, 0) rotate(0deg)",
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, var(--gradient-1) 0%, transparent 50%),
              radial-gradient(circle at 0% 0%, var(--gradient-2) 0%, transparent 50%),
              radial-gradient(circle at 100% 0%, var(--gradient-3) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, var(--gradient-2) 0%, transparent 50%),
              radial-gradient(circle at 0% 100%, var(--gradient-1) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Dot Grid Overlay */}
      <DotGrid mousePosition={mousePosition} />
      
      {/* Subtle Noise/Texture Overlay (Optional, adds grain) */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}

function DotGrid({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const generateDots = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const gap = 40;
      const newDots = [];

      for (let x = 0; x < width; x += gap) {
        for (let y = 0; y < height; y += gap) {
          newDots.push({ x, y });
        }
      }
      setDots(newDots);
    };

    generateDots();
    window.addEventListener("resize", generateDots);
    return () => window.removeEventListener("resize", generateDots);
  }, []);

  return (
    <div className="absolute inset-0">
      {dots.map((dot, i) => (
        <Dot key={i} x={dot.x} y={dot.y} mousePosition={mousePosition} />
      ))}
    </div>
  );
}

function Dot({
  x,
  y,
  mousePosition,
}: {
  x: number;
  y: number;
  mousePosition: { x: number; y: number };
}) {
  const distance = Math.sqrt(
    Math.pow(mousePosition.x - x, 2) + Math.pow(mousePosition.y - y, 2)
  );
  
  const maxDistance = 250;
  const isClose = distance < maxDistance;
  
  // Base opacity for "stars"
  const baseOpacity = 0.15;
  // Increased opacity when hovering
  const activeOpacity = Math.max(baseOpacity, 0.6 - (distance / maxDistance) * 0.4);

  return (
    <motion.div
      className="absolute h-[2px] w-[2px] rounded-full bg-foreground"
      style={{
        left: x,
        top: y,
      }}
      animate={{
        opacity: isClose ? activeOpacity : baseOpacity,
        scale: isClose ? 1.5 : 1,
      }}
      transition={{ duration: 0.2 }}
    />
  );
}
