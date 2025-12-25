import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getDotColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-500 dark:bg-blue-400";
      case "Complete": return "bg-emerald-500 dark:bg-emerald-400";
      case "Cancelled": return "bg-slate-500 dark:bg-slate-400";
      default: return "bg-gray-500 dark:bg-gray-400";
    }
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium text-foreground bg-muted",
      className
    )}>
      <span className={cn("h-2 w-2 rounded-full", getDotColor(status))} />
      {status}
    </div>
  );
}
