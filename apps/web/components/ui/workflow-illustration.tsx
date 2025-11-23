"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, UserCheck, CheckCircle, FileText, Users } from "lucide-react";

export function WorkflowIllustration() {
  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted/5 p-4 relative overflow-hidden rounded-xl border border-border/50">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative w-full max-w-3xl aspect-video">
        {/* Connecting Lines (SVG Layer) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          viewBox="0 0 600 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="line-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Path 1: Ingest -> AI */}
          <path
            d="M 70 150 C 145 150, 145 75, 220 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <motion.path
            d="M 70 150 C 145 150, 145 75, 220 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 16 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Path 2: Ingest -> Manual */}
          <path
            d="M 70 150 C 145 150, 145 225, 220 225"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <motion.path
            d="M 70 150 C 145 150, 145 225, 220 225"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary/40"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 16 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Path 3: AI -> Review */}
          <path
            d="M 300 75 C 375 75, 375 150, 450 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <motion.path
            d="M 300 75 C 375 75, 375 150, 450 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 16 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />

          {/* Path 4: Manual -> Review */}
          <path
            d="M 300 225 C 375 225, 375 150, 450 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />

          {/* Path 5: Review -> Complete */}
          <path
            d="M 510 150 L 540 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          <motion.path
            d="M 510 150 L 540 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-green-500"
            strokeDasharray="8 8"
            initial={{ strokeDashoffset: 16 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* Nodes */}

        {/* Node 1: Ingest */}
        <div className="absolute left-[11.6%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 z-10">
          <div className="p-2.5 bg-muted rounded-xl">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground">
            Ingest
          </span>
        </div>

        {/* Node 2: AI Processing */}
        <div className="absolute left-[43.3%] top-[25%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-card border border-primary/20 shadow-xl shadow-primary/5 rounded-2xl flex flex-col items-center justify-center gap-3 z-10">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold">AI Agent</span>
            <span className="text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
              Processing
            </span>
          </div>
        </div>

        {/* Node 3: Manual Task */}
        <div className="absolute left-[43.3%] top-[75%] -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 z-10">
          <div className="p-2.5 bg-muted rounded-xl">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Manual
          </span>
        </div>

        {/* Node 4: Review */}
        <div className="absolute left-[80%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-card border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 z-10">
          <div className="p-2.5 bg-muted rounded-xl">
            <UserCheck className="w-6 h-6 text-muted-foreground" />
          </div>
          <span className="text-xs font-medium">Review</span>
        </div>

        {/* Node 5: Complete */}
        <div className="absolute right-[2%] top-1/2 -translate-y-1/2 w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1 z-10">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <span className="text-[10px] font-bold text-green-700">Done</span>
        </div>
      </div>
    </div>
  );
}
