import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority?: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  if (!priority) return null;
  
  const p = priority.toLowerCase();
  
  let colorClass = "bg-blue-500";
  if (p === 'high') colorClass = "bg-orange-500";
  else if (p === 'critical') colorClass = "bg-red-500";
  else if (p === 'medium') colorClass = "bg-amber-500";

  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-border/40 text-xs font-medium bg-background", className)}>
        <div className={cn("w-1.5 h-1.5 rounded-full", colorClass)} />
        <span className="capitalize text-foreground/80">{priority}</span>
    </div>
  );
}
