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
      {/* Dot Grid Overlay */}
      <DotGrid mousePosition={mousePosition} />

      {/* Subtle Noise/Texture Overlay (Optional, adds grain) */}
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
    </div>
  );
}

function DotGrid({
  mousePosition,
}: {
  mousePosition: { x: number; y: number };
}) {
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
        <Dot key={i} index={i} x={dot.x} y={dot.y} mousePosition={mousePosition} />
      ))}
    </div>
  );
}

const COMPANY_COLORS = [
  "#94a3b8", // Slate 400
  "#c084fc", // Purple 400
  "#60a5fa", // Blue 400
];

function Dot({
  index,
  x,
  y,
  mousePosition,
}: {
  index: number;
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
  const activeOpacity = Math.max(
    baseOpacity,
    1 - (distance / maxDistance) * 0.5
  );

  const targetColor = COMPANY_COLORS[index % COMPANY_COLORS.length];

  return (
    <motion.div
      className="absolute h-0.5 w-0.5 rounded-full"
      style={{
        left: x,
        top: y,
        backgroundColor: "var(--foreground)",
      }}
      animate={{
        opacity: isClose ? activeOpacity : baseOpacity,
        backgroundColor: isClose ? targetColor : "var(--foreground)",
        scale: isClose ? 2 : 1,
      }}
      transition={{
        duration: isClose ? 0.2 : 1.5,
      }}
    />
  );
}
