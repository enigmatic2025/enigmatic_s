import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface PriorityBadgeProps {
  priority?: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const t = useTranslations("ActionFlows");
  
  if (!priority) return null;
  
  const p = priority.toLowerCase();
  // Standardized font-medium weight for elegant, readable text
  const baseClass = "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-medium";
  
  let colorClass = "text-zinc-600 dark:text-zinc-400";
  
  switch (p) {
    case "critical":
        colorClass = "text-red-600 dark:text-red-400";
        break;
    case "high":
        colorClass = "text-orange-600 dark:text-orange-400";
        break;
    case "medium":
        colorClass = "text-amber-600 dark:text-amber-400";
        break;
    case "low":
        colorClass = "text-blue-600 dark:text-blue-400";
        break;
  }

  return (
    <Badge variant="outline" className={`${baseClass} ${colorClass} ${className || ''}`}>
      {t(`priorities.${p}`)}
    </Badge>
  );
}
