import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("ActionFlows");
  
  if (!status) return null;
  
  const s = status.toLowerCase();
  
  // Standardized elegant design: Gray background, colored text for status where applicable, or just generic gray/gray
  // The user requested: "black, white gray, elegant. ... gray background for all, only colored text"
  
  const baseClass = "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-xs font-medium px-2 py-0.5 rounded-full";
  
  let label = status;
  let colorClass = "text-zinc-700 dark:text-zinc-300"; // Default text color
  
  if (s === 'running') {
      label = t('statuses.inProgress');
      // Keeping it simple/elegant as per user request (or maybe slightly distinct if preferred, but let's stick to simple first)
      // The screenshot showed "In-Progress" as black text on gray bg in light mode. 
      colorClass = "text-zinc-900 dark:text-zinc-100"; 
  } else if (s === 'completed') {
      label = t('statuses.completed');
      colorClass = "text-zinc-700 dark:text-zinc-300";
  } else if (s === 'failed') {
      label = t('statuses.failed');
      colorClass = "text-red-700 dark:text-red-400"; // Maybe a hint of red for failed? Or keep neutral? sticking to neutral logic unless critical
  } else if (s === 'terminated') {
      label = t('statuses.terminated');
      colorClass = "text-zinc-500 dark:text-zinc-400";
  }

  // Override for failed/success to match the logic I used in page.tsx if we want to be exact, 
  // but looking at the user request "gray background for all", I will stick to that.
  
  return (
    <Badge variant="outline" className={`${baseClass} ${colorClass} ${className || ''}`}>
      {label}
    </Badge>
  );
}
