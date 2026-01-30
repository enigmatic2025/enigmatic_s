"use client";

import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, Trash2, Workflow, Circle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/navigation";

export interface ActionFlowExec {
  id: string;
  flow_id: string;
  flow_name: string;
  title?: string;
  status: string;
  priority?: string;
  temporal_workflow_id: string;
  started_at: string;
  has_assignments?: boolean;
}

interface ActionFlowListProps {
  data: ActionFlowExec[];
  isLoading: boolean;
}

export function ActionFlowList({ data, isLoading }: ActionFlowListProps) {
  const t = useTranslations("ActionFlows");
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-muted/20 animate-pulse rounded-md border" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-muted/5">
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
        <p className="text-xs text-muted-foreground/50 mt-1">{t("emptyHint")}</p>
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    
    // Monochrome badge styling for all statuses
    const monochromeClass = "text-gray-700 border-gray-300 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    
    switch (s) {
      case "COMPLETED":
        return (
          <Badge variant="outline" className={monochromeClass}>
            {t("statuses.completed")}
          </Badge>
        );
      case "RUNNING":
        return (
          <Badge variant="outline" className={monochromeClass}>
            {t("statuses.inProgress")}
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="outline" className={monochromeClass}>
            {t("statuses.failed")}
          </Badge>
        );
      case "TERMINATED":
        return (
          <Badge variant="outline" className={monochromeClass}>
            {t("statuses.terminated")}
          </Badge>
        );
      default:
        return <Badge variant="outline" className={monochromeClass}>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const p = priority.toLowerCase();
    switch (p) {
      case "high":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700 text-xs">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700 text-xs">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700 text-xs">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDelete = async (exec: ActionFlowExec, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t("deleteConfirm"))) return;
    
    const res = await apiClient.delete(`/api/action-flows/${exec.id}`);
    if (res.ok) {
        toast.success("Deleted");
        window.location.reload(); 
    } else {
        toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-2">
      {data.map((exec) => (
        <Card 
            key={exec.id} 
            className="p-0 border shadow-none cursor-pointer hover:bg-muted/30 transition-colors overflow-hidden"
            onClick={() => router.push(`${pathname}/${exec.id}`)}
        >
          {/* Top Row - Main Info */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 border-b">
            <div className="flex items-center gap-3 flex-1 min-w-0">
               {/* Flow Icon */}
               <div className="h-8 w-8 rounded-md border bg-background flex items-center justify-center text-muted-foreground flex-shrink-0">
                 <Workflow className="h-4 w-4" />
               </div>

               {/* Name */}
               <span className="font-medium text-sm text-foreground truncate">
                   {exec.title || exec.flow_name}
               </span>
            </div>

            {/* Metadata Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(exec.status)}
              {getPriorityBadge(exec.priority)}
              
              {exec.has_assignments && (
                <Badge variant="outline" className="text-xs">
                  <Circle className="w-2 h-2 mr-1 fill-current" />
                  Assigned
                </Badge>
              )}

              {/* Action Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => handleDelete(exec, e as any)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Bottom Row - Latest Activity */}
          <div className="flex items-center justify-between gap-4 px-4 py-2 bg-muted/20 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Circle className="w-1.5 h-1.5 fill-current" />
              <span>Latest:</span>
              <span className="font-mono">{exec.temporal_workflow_id.substring(0, 16)}...</span>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-xs hover:text-foreground"
                onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(exec.id);
                    toast.success("ID Copied");
                }}
              >
                <Copy className="w-3 h-3 mr-1" />
                {exec.id.substring(0, 8)}
              </Button>
            </div>

            <span className="font-medium">
                {formatTimeAgo(exec.started_at)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
