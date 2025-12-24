import { cn } from "@/lib/utils";
import { AlertCircle, ArrowUpCircle, CheckCircle2, MinusCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getIcon = (priority: string) => {
    const baseClass = "h-3.5 w-3.5";
    switch (priority) {
      case "Critical": return <AlertCircle className={cn(baseClass, "text-red-500 dark:text-red-400")} />;
      case "High": return <ArrowUpCircle className={cn(baseClass, "text-orange-500 dark:text-orange-400")} />;
      case "Medium": return <MinusCircle className={cn(baseClass, "text-amber-500 dark:text-amber-400")} />;
      case "Low": return <CheckCircle2 className={cn(baseClass, "text-slate-500 dark:text-slate-400")} />;
      default: return null;
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium  text-foreground bg-muted",
      className
    )}>
      {getIcon(priority)}
      {priority}
    </div>
  );
}
