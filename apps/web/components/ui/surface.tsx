import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneSoft, toneText, type Tone } from "@/lib/tones";

// --- Panel: raised surface with hairline border and 6px corners -------------

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  /** "raised" sits on the page ground; "inset" sits inside another panel. */
  variant?: "raised" | "inset";
};

export function Panel({ variant = "raised", className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border",
        variant === "raised" ? "bg-surface-1 surface-highlight" : "bg-background",
        className
      )}
      {...props}
    />
  );
}

// --- Tag: small label chip ------------------------------------------------

type TagProps = React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone };

export function Tag({ tone = "neutral", className, ...props }: TagProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border px-2 py-0.5 text-micro font-medium", toneSoft[tone], className)}
      {...props}
    />
  );
}

// --- IconTile: square icon holder -------------------------------------------

type IconTileProps = { icon: LucideIcon; tone?: Tone; size?: "sm" | "md"; className?: string };

export function IconTile({ icon: Icon, tone = "neutral", size = "md", className }: IconTileProps) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-sm border border-border bg-background",
        size === "md" ? "size-10" : "size-8",
        toneText[tone],
        className
      )}
    >
      <Icon size={size === "md" ? 20 : 16} strokeWidth={1.5} aria-hidden />
    </div>
  );
}
