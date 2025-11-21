import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { Calculator, ArrowRightLeft, Plus, Sparkles, Zap } from "lucide-react";

// --- Card Node (Container) ---
export const CardNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      className={cn(
        "h-full w-full rounded-2xl border border-border bg-card p-6 transition-all",
        selected ? "ring-1 ring-primary" : ""
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-foreground">{data.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {data.description}
        </p>
      </div>
      {/* The content will be rendered by child nodes placed on top of this node */}
    </div>
  );
});

CardNode.displayName = "CardNode";

// --- Flow Block Node (Standard Process Step) ---
export const FlowBlockNode = memo(({ data }: NodeProps) => {
  const Icon = data.icon || Calculator;

  return (
    <div className="relative flex items-center gap-3 rounded-lg border border-border bg-background p-3 min-w-[180px] w-full">
      <Handle
        type="target"
        position={Position.Top}
        className="bg-muted-foreground! w-2! h-2!"
      />

      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md bg-muted",
          data.iconBg
        )}
      >
        <Icon className="h-4 w-4 text-foreground" />
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">
          {data.label}
        </span>
        {data.subLabel && (
          <span className="text-xs text-muted-foreground">{data.subLabel}</span>
        )}
      </div>

      {data.badge && (
        <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {data.badge}
        </span>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-muted-foreground! w-2! h-2!"
      />
    </div>
  );
});

FlowBlockNode.displayName = "FlowBlockNode";

// --- Condition Node (e.g. "Is Deal status 'Won'?") ---
export const ConditionNode = memo(({ data }: NodeProps) => {
  return (
    <div className="relative rounded-lg border border-border bg-background p-1 min-w-[200px]">
      <Handle
        type="target"
        position={Position.Top}
        className="bg-muted-foreground! w-2! h-2!"
      />

      <div className="flex items-center gap-2 p-2 border-b border-border/50">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <ArrowRightLeft className="h-3 w-3 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-sm font-medium">{data.label}</span>
      </div>

      <div className="p-2 space-y-2">
        <div className="relative pl-4 border-l-2 border-border">
          <span className="absolute -left-px -top-2 text-[10px] bg-background px-1 text-muted-foreground">
            Is true
          </span>
          <div className="mt-2 rounded border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10 p-2 flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
              <Plus className="h-3 w-3 text-blue-700 dark:text-blue-300" />
            </div>
            <span className="text-xs font-medium">Formula</span>
            <span className="ml-auto text-[10px] bg-blue-200 dark:bg-blue-800 px-1.5 py-0.5 rounded text-blue-800 dark:text-blue-200">
              Anna
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

      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-muted-foreground! w-2! h-2!"
      />
    </div>
  );
});

ConditionNode.displayName = "ConditionNode";

// --- List Item Node (for "Extend functionality") ---
export const ListBlockNode = memo(({ data }: NodeProps) => {
  const Icon = data.icon || Plus;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-sm w-full mb-2 hover:bg-muted/50 transition-colors cursor-default">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground">{data.label}</span>
      {data.cursor && (
        <div className="ml-auto">
          {/* Simple cursor simulation */}
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
});

ListBlockNode.displayName = "ListBlockNode";

// --- AI Prompt Node ---
export const AIPromptNode = memo(() => {
  return (
    <div className="relative w-full max-w-md">
      <Handle
        type="target"
        position={Position.Top}
        className="bg-muted-foreground! w-2! h-2!"
      />

      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Prompt completion</span>
          </div>
          <span className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            AI
          </span>
        </div>
        <div className="p-4">
          <div className="text-sm text-muted-foreground mb-4">
            Pull out key information from deal
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 ml-2 animate-pulse"></span>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded bg-indigo-600 flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium">Linear</span>
              <span className="ml-auto text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Zap className="h-2 w-2" /> Strong with Jane
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Linear is a B2B SaaS company with 11-50 employees and an estimated
              ARR of $1-10 million
              <span className="inline-block w-0.5 h-3 bg-blue-500 ml-0.5 align-middle animate-pulse"></span>
            </p>
          </div>

          <div className="mt-3 flex justify-center">
            <span className="text-xs text-blue-500 flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              <Sparkles className="h-3 w-3" /> AI is typing...
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-muted-foreground! w-2! h-2!"
      />
    </div>
  );
});

AIPromptNode.displayName = "AIPromptNode";
