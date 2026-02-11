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


export function ActionFlowList({ data, isLoading }: ActionFlowListProps) {
  const t = useTranslations("ActionFlows");
  const router = useRouter();
  const pathname = usePathname();

  // Loading state handled by parent via LoadingPage
  // if (isLoading) { ... }

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

        // Logic to determine main description text
        // If Title is present and NOT "Untitled Instance", it's the specific instance name.
        // The "Information" (flow_description) is the secondary context.
        const isUntitled = !exec.title || exec.title === "Untitled Instance";
        const displayTitle = isUntitled ? null : exec.title;
        const displayDesc = exec.flow_description; // Always show description if available

        return (
            <Card 
                key={exec.id} 
                className="group border border-border/60 shadow-none hover:border-foreground/20 transition-all cursor-pointer overflow-hidden bg-background"
                onClick={() => router.push(`${pathname}/${exec.id}`)}
            >
            {/* Top Row: Main Info */}
            <div className="flex flex-col md:flex-row md:items-start justify-between p-4 gap-4">
                {/* Left: Identity & Description */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Flow Type Icon (Monochrome) */}
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 text-primary border border-border/40 shrink-0 mt-0.5">
                         <Workflow className="w-5 h-5 opacity-80" />
                    </div>
                    
                    <div className="flex flex-col min-w-0 gap-1">
                        {/* Header: Flow Name + Instance Title */}
                        <div className="flex flex-wrap items-center gap-2">
                             <span className="font-semibold text-base text-foreground leading-none">
                                {exec.flow_name} {displayTitle && displayTitle !== exec.flow_name && (
                                    <span className="text-muted-foreground font-normal">
                                        / {displayTitle}
                                    </span>
                                )}
                             </span>
                        </div>

                        {/* ID Display */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                            ID: {exec.id}
                        </div>
                    </div>
                </div>
                
                {/* Right: Metadata (Priority, Specs, Avatar) */}
                <div className="flex items-center gap-5 text-xs text-muted-foreground shrink-0 mt-1 md:mt-0">
                    {/* Priority */}
                    {exec.priority && (
                        <PriorityBadge priority={exec.priority} />
                    )}

                    {/* Stats Group */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Circle className="w-3.5 h-3.5 fill-muted-foreground/20 text-muted-foreground/60" />
                            <span>{exec.action_count} actions</span>
                        </div>

                        {/* Avatars - Involved */}
                        {exec.assignments && exec.assignments.length > 0 && (
                            <div className="flex -space-x-2 pl-2 border-l border-border/40">
                                 {exec.assignments.slice(0, 3).map((assign, i) => {
                                    const name = assign.user?.name || assign.name || "?";
                                    const initials = name
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase();

                                    return (
                                        <Avatar key={i} className="w-7 h-7 border-2 border-background shrink-0">
                                            <AvatarImage src={assign.user?.image || assign.image} />
                                            <AvatarFallback className="text-[9px] bg-muted font-medium text-muted-foreground">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    );
                                })}
                            </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground pl-3 border-l border-border/40">
                             {new Date(exec.started_at).toLocaleDateString()}
                        </div>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 -mr-2 text-muted-foreground/50 hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(exec.id);
                                    toast.success("ID Copied");
                                }}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy ID
                            </DropdownMenuItem>
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40 text-xs text-muted-foreground bg-secondary/20">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Status Icon in Footer */}
                        {isRunning ? <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-pulse" /> :
                         isCompleted ? <div className="w-2 h-2 rounded-full bg-zinc-400" /> :
                         <div className="w-2 h-2 rounded-full bg-zinc-200" />}
                        
                        <span className="font-medium uppercase tracking-wider opacity-90 text-[11px] text-foreground">
                            {isRunning ? "Running" : isCompleted ? "Completed" : exec.status}
                        </span>
                    </div>

                    <span className="text-muted-foreground/15">|</span>

                    <div className="flex items-center gap-2 min-w-0 text-foreground/80 truncate">
                         <span className="text-muted-foreground opacity-70">Current Step:</span>
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
