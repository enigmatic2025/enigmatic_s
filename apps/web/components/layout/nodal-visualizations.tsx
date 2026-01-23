import React from "react";
import { cn } from "@/lib/utils";
import {
  Calculator,
  ArrowRightLeft,
  Truck,
  Plus,
  Database,
  MessageSquare,
  Hash,
  UserCheck,
  AlertCircle,
  FileText,
  LucideIcon,
} from "lucide-react";

// --- Flow Block (Standard Process Step) ---
interface FlowBlockProps {
  label: string;
  subLabel?: string;
  icon?: LucideIcon;
  iconBg?: string;
  badge?: string;
  className?: string;
}

export const FlowBlock = ({
  label,
  subLabel,
  icon: Icon = Calculator,
  iconBg,
  badge,
  className,
}: FlowBlockProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-sm min-w-[180px]",
        className
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground",
          iconBg
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {subLabel && (
          <span className="text-xs text-muted-foreground">{subLabel}</span>
        )}
      </div>

      {badge && (
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {badge}
        </span>
      )}
    </div>
  );
};

// --- Condition Block (e.g. "Is Shipment Delayed?") ---
export const ConditionBlock = () => {
  return (
    <div className="relative rounded-lg border border-border bg-background p-1 shadow-sm w-full max-w-[250px]">
      <div className="flex items-center gap-2 p-2 border-b border-border/50">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
          <ArrowRightLeft className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-sm font-medium">Is Shipment Delayed?</span>
      </div>

      <div className="p-2 space-y-2">
        <div className="relative pl-4 border-l-2 border-border">
          <span className="absolute -left-px -top-2 text-[10px] bg-background px-1 text-muted-foreground">
            Is true
          </span>
          <div className="mt-2 rounded border border-blue-200 bg-background dark:border-blue-800 dark:bg-blue-900/10 p-2 flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-blue-50 dark:bg-blue-800 flex items-center justify-center">
              <MessageSquare className="h-3 w-3 text-blue-600 dark:text-blue-300" />
            </div>
            <span className="text-xs font-medium">Notify Customer</span>
            <span className="ml-auto text-[10px] bg-blue-50 dark:bg-purple-800 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-200">
              Email
            </span>
          </div>
        </div>

        <div className="relative pl-4 border-l-2 border-border">
          <span className="absolute -left-px -top-2 text-[10px] bg-background px-1 text-muted-foreground">
            Is false
          </span>
          <div className="mt-2 rounded border border-dashed border-border p-2 flex items-center gap-2 text-muted-foreground">
            <Plus className="h-4 w-4" />
            <span className="text-xs">Select block</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- List Item Block (for "Extend functionality") ---
interface ListBlockProps {
  label: string;
  icon?: LucideIcon;
  cursor?: boolean;
}

export const ListBlock = ({
  label,
  icon: Icon = Plus,
  cursor,
}: ListBlockProps) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-sm w-full mb-2 transition-colors cursor-default">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
      {cursor && (
        <div className="ml-auto">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-foreground fill-current"
          >
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// --- Human-in-the-Loop Block ---
export const HumanInLoopBlock = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-xl border border-border bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-normal">Exception Review</span>
          </div>
          <span className="text-[10px] font-normal bg-muted/50 px-2 py-0.5 rounded-full text-muted-foreground border border-border/50">
            Human Action
          </span>
        </div>
        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 font-light">
            <AlertCircle className="h-4 w-4 text-red-500/80" />
            <span>
              Rate variance detected:{" "}
              <span className="text-foreground font-normal">$450</span> vs{" "}
              <span className="text-foreground font-normal">$380</span>
            </span>
          </div>

          <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <FileText className="h-3 w-3 text-blue-500" />
              </div>
              <span className="text-xs font-normal text-foreground">
                Carrier Invoice #INV-2024-001
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 border border-green-500/30 text-green-600 dark:text-green-400 text-xs py-2 rounded font-normal">
                Approve
              </button>
              <button className="flex-1 border border-red-500/30 text-red-600 dark:text-red-400 text-xs py-2 rounded font-normal">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Visual Canvas Preview (The Flowchart) ---
export const VisualCanvasPreview = () => {
  return (
    <div className="relative flex flex-col items-center h-full w-full pt-8 pb-4">
      {/* Node 1 */}
      <FlowBlock
        label="Rate Calculation"
        subLabel="Contract Logic"
        icon={Calculator}
        className="z-10"
      />

      {/* Edge 1 */}
      <div className="h-8 w-px bg-border my-1 relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-border bg-background"></div>
      </div>

      {/* Node 2 */}
      <FlowBlock
        label="Check Capacity"
        subLabel="Carrier API"
        icon={ArrowRightLeft}
        className="z-10"
      />

      {/* Edge 2 (Branching) */}
      <div className="h-8 w-full max-w-[200px] relative my-1">
        {/* Vertical line from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-px bg-border"></div>
        {/* Horizontal branching line */}
        <div className="absolute top-4 left-1/4 right-1/4 h-px bg-border"></div>
        {/* Vertical lines down */}
        <div className="absolute top-4 left-1/4 h-4 w-px bg-border"></div>
        <div className="absolute top-4 right-1/4 h-4 w-px bg-border"></div>

        {/* Labels */}
        <span className="absolute top-2 left-[10%] text-[10px] text-muted-foreground bg-background px-1">
          Full
        </span>
        <span className="absolute top-2 right-[10%] text-[10px] text-muted-foreground bg-background px-1">
          Available
        </span>
      </div>

      {/* Node 3 (Left branch placeholder - hidden/faded) */}

      {/* Node 3 (Right branch - Add to sequence) */}
      <FlowBlock
        label="Dispatch Driver"
        subLabel="Samsara"
        icon={Truck}
        iconBg="bg-background border border-border"
        className="z-10 mt-2"
      />

      {/* Edge 3 */}
      <div className="h-8 w-0 border-l border-dashed border-border my-1"></div>

      {/* Plus Button */}
      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center shadow-none z-10">
        <Plus className="h-5 w-5 text-white" />
      </div>
    </div>
  );
};

// --- Powerful Blocks Preview ---
export const PowerfulBlocksPreview = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      <div className="text-sm text-muted-foreground mb-4 self-start">
        Next step
      </div>
      <ConditionBlock />
    </div>
  );
};

// --- Extend Functionality Preview ---
export const ExtendFunctionalityPreview = () => {
  return (
    <div className="flex flex-col justify-center h-full w-full p-4">
      <ListBlock label="Calculate ETA" icon={Calculator} />
      <ListBlock label="Consolidate Loads" icon={Hash} />
      <ListBlock label="Update TMS" icon={Database} />
    </div>
  );
};

// --- Human In Loop Preview ---
export const HumanInLoopPreview = () => {
  return (
    <div className="flex items-center justify-center h-full w-full p-8">
      <HumanInLoopBlock />
    </div>
  );
};
