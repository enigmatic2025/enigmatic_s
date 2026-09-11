import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Calculator, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneSoft, type Tone } from "@/lib/tones";

export type FlowBlockData = {
  label: string;
  subLabel?: string;
  icon?: LucideIcon;
  badge?: string;
  tone?: Tone;
};

const handleClass = "bg-subtle! size-1.5! border-0!";

/** A process step in a ReactFlow diagram. Label on one line; sub-label and badge share the row below. */
export const FlowBlockNode = memo(({ data }: NodeProps<FlowBlockData>) => {
  const Icon = data.icon ?? Calculator;
  return (
    <div className="relative flex w-full items-start gap-3 rounded-md border border-border-strong bg-surface-1 p-3 surface-highlight">
      <Handle type="target" position={Position.Top} className={handleClass} />
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-sm border", toneSoft[data.tone ?? "neutral"])}>
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="whitespace-nowrap text-body-sm font-medium text-foreground">{data.label}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          {data.subLabel && <span className="truncate text-caption text-muted-foreground">{data.subLabel}</span>}
          {data.badge && (
            <span className="shrink-0 rounded-xs border border-border bg-background px-1.5 text-micro text-muted-foreground">{data.badge}</span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className={handleClass} />
    </div>
  );
});

FlowBlockNode.displayName = "FlowBlockNode";
