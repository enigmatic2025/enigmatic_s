import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, ArrowUpCircle, MinusCircle } from "lucide-react";

export function PriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "Critical":
      return (
        <Badge variant="outline" className="gap-1 text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          Critical
        </Badge>
      );
    case "High":
      return (
        <Badge variant="outline" className="gap-1 text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800">
          High
        </Badge>
      );
    case "Medium":
      return (
        <Badge variant="outline" className="gap-1 text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
          Medium
        </Badge>
      );
    case "Low":
      return (
        <Badge variant="outline" className="gap-1 text-slate-600 border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700">
          Low
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}
