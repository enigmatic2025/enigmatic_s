import React from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface BrowserFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  url?: string;
}

export function BrowserFrame({ 
  className, 
  children, 
  url = "app.nodal.com", 
  ...props 
}: BrowserFrameProps) {
  return (
    <div 
      className={cn(
        "relative w-full rounded-xl border bg-background shadow-2xl overflow-hidden flex flex-col",
        className
      )} 
      {...props}
    >
      {/* Browser Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 backdrop-blur-sm z-10">
        {/* Window Controls */}
        <div className="flex gap-1.5 min-w-15">
          <div className="w-3 h-3 rounded-full bg-red-500/20 hover:bg-red-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 hover:bg-yellow-500 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 hover:bg-green-500 transition-colors" />
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="bg-background border rounded-md px-3 py-1.5 flex items-center justify-center gap-2 text-xs text-muted-foreground shadow-xs">
            <Lock className="w-3 h-3" />
            <span className="opacity-80 mobile-hidden sm:inline-block">https://</span>
            <span className="text-foreground">{url}</span>
          </div>
        </div>

        {/* Empty space for balance */}
        <div className="min-w-15" />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/5">
        {children}
      </div>
    </div>
  );
}
