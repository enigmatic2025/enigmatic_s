"use client";

import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, MoreHorizontal, Trash2, Workflow, Circle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";

import { useRouter, usePathname } from "@/navigation";

export interface ActionFlowExec {
  id: string;
  flow_id: string;
  flow_name: string;
  flow_description?: string; // Added
  title?: string;
  status: string;
  priority?: string;
  temporal_workflow_id: string;
  started_at: string;
  has_assignments?: boolean;
  assignments?: any[];        
  action_count: number;
  current_action?: string;
  latest_activity_at: string;
}

interface ActionFlowListProps {
  data: ActionFlowExec[];
  isLoading: boolean;
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper to generate a consistent pastel color from string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  // Use a slightly more vibrant but still soft palette
  return `hsl(${h}, 85%, 96%)`; 
};

const stringToTextColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 45%)`; 
};

export function ActionFlowList({ data, isLoading }: ActionFlowListProps) {
  const t = useTranslations("ActionFlows");
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full bg-muted/20 animate-pulse rounded-md border" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-lg bg-muted/5">
        <p className="text-sm font-medium text-foreground">{t("empty")}</p>
        <p className="text-xs text-muted-foreground mt-1">{t("emptyHint")}</p>
      </div>
    );
  }

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
    <div className="space-y-3">
      {data.map((exec) => {
        const isRunning = exec.status === "RUNNING";
        const isCompleted = exec.status === "COMPLETED";
        const isFailed = exec.status === "FAILED";
        
        // Colors for the Flow Icon
        const flowBg = stringToColor(exec.flow_name);
        const flowText = stringToTextColor(exec.flow_name);

        // Logic to determine main description text
        // If Title is present and NOT "Untitled Instance", it's the specific instance name.
        // The "Information" (flow_description) is the secondary context.
        const isUntitled = !exec.title || exec.title === "Untitled Instance";
        const displayTitle = isUntitled ? null : exec.title;
        const displayDesc = exec.flow_description; // Always show description if available

        return (
            <Card 
                key={exec.id} 
                className="group border border-border/60 shadow-none hover:border-border/80 transition-all cursor-pointer overflow-hidden bg-card"
                onClick={() => router.push(`${pathname}/${exec.id}`)}
            >
            {/* Top Row: Main Info */}
            <div className="flex flex-col md:flex-row md:items-start justify-between p-5 gap-4">
                {/* Left: Identity & Description */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Flow Type Icon (Colored) */}
                    <div 
                        className="flex items-center justify-center w-9 h-9 rounded-lg border border-transparent shrink-0 mt-0.5"
                        style={{ backgroundColor: flowBg, color: flowText }}
                    >
                         <Workflow className="w-5 h-5" />
                    </div>
                    
                    <div className="flex flex-col min-w-0 gap-1">
                        {/* Header: Flow Name + Instance Title */}
                        <div className="flex flex-wrap items-center gap-2">
                             <span className="font-semibold text-base text-foreground leading-none">
                                {exec.flow_name}
                             </span>
                             
                             {displayTitle && (
                                <>
                                    <span className="text-muted-foreground/30 text-sm">/</span>
                                    <span className="text-sm font-medium text-foreground/80 truncate">
                                        {displayTitle}
                                    </span>
                                </>
                             )}
                        </div>

                        {/* Description (Information) */}
                        {displayDesc ? (
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {displayDesc}
                            </p>
                        ) : (
                             // Fallback if no description and untitled: show ID
                             isUntitled && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground/50 font-mono mt-1">
                                    ID: {exec.id.substring(0, 8)} 
                                </div>
                             )
                        )}
                        
                        {/* Copy ID Button (subtle) */}
                        <div className="mt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-0 text-xs text-muted-foreground/40 hover:text-foreground/60 font-mono"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(exec.id);
                                    toast.success("ID Copied");
                                }}
                            >
                                <Copy className="w-3 h-3 mr-1.5" />
                                {exec.id}
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Right: Metadata (Priority, Specs, Avatar) */}
                <div className="flex items-start gap-6 text-xs text-muted-foreground shrink-0 pt-1">
                    {/* Priority */}
                    {exec.priority && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-md border border-border/40">
                            <div className={cn("w-1.5 h-1.5 rounded-full", 
                                exec.priority === 'high' ? "bg-orange-500" : 
                                exec.priority === 'critical' ? "bg-red-500" : "bg-blue-500"
                            )} />
                            <span className="capitalize font-medium">{exec.priority}</span>
                        </div>
                    )}

                    {/* Action Count */}
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/40 rounded-md border border-border/40">
                        <Circle className="w-3 h-3 fill-muted-foreground/20" />
                        <span className="font-medium">{exec.action_count} actions</span>
                    </div>

                    {/* Avatars */}
                    {exec.assignments && exec.assignments.length > 0 && (
                        <div className="flex -space-x-2">
                             {exec.assignments.slice(0, 3).map((assign, i) => (
                                <Avatar key={i} className="w-7 h-7 border-2 border-background ring-1 ring-border/10">
                                    <AvatarImage src={assign.user?.image || assign.image} />
                                    <AvatarFallback className="text-[9px] bg-muted font-medium text-muted-foreground">
                                        {(assign.user?.name?.[0] || assign.name?.[0] || "?").toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    )}
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 text-muted-foreground/50 hover:text-foreground">
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

            {/* Bottom Row: Status & Activity */}
            <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t border-border/40 text-sm">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                        {/* Status Icon in Footer */}
                        {isRunning ? <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> :
                         isCompleted ? <div className="w-2 h-2 rounded-full bg-green-500" /> :
                         <div className="w-2 h-2 rounded-full bg-zinc-300" />}
                        
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                            {isRunning ? "Running" : isCompleted ? "Completed" : exec.status}
                        </span>
                    </div>

                    <span className="text-muted-foreground/20">|</span>

                    <div className="flex items-center gap-2 min-w-0 text-xs text-foreground/80 truncate">
                         <span className="font-medium text-muted-foreground">Current Step:</span>
                         <span className="truncate font-medium">{exec.current_action || "System processing"}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 pl-4">
                    <span className="opacity-60">Last activity</span>
                    <span className="font-medium text-foreground/70">{formatTimeAgo(exec.latest_activity_at)}</span>
                </div>
            </div>
            </Card>
        );
      })}
    </div>
  );
}
