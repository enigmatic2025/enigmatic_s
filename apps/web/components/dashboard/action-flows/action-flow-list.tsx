"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Play, RotateCcw, Terminal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter, usePathname } from "next/navigation";

export interface ActionFlowExec {
  id: string; // The Action Flow ID (DB)
  flow_id: string;
  flow_name: string;
  title?: string;
  status: string; // RUNNING, COMPLETED, FAILED, TERMINATED
  temporal_workflow_id: string;
  started_at: string;
}

interface ActionFlowListProps {
  data: ActionFlowExec[];
  isLoading: boolean;
}

export function ActionFlowList({ data, isLoading }: ActionFlowListProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-muted/20 animate-pulse rounded-lg border" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/5">
        <p className="text-sm text-muted-foreground">No action flows found.</p>
        <p className="text-xs text-muted-foreground/50">Run an action flow to see it here.</p>
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

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return "text-green-500 bg-green-500/10";
      case "RUNNING": return "text-blue-500 bg-blue-500/10";
      case "FAILED": return "text-red-500 bg-red-500/10";
      default: return "text-slate-500 bg-slate-500/10";
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const s = status?.toUpperCase();
    if (s === "RUNNING") return <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />;
    if (s === "COMPLETED") return <div className="w-2 h-2 rounded-full bg-green-500" />;
    if (s === "FAILED") return <div className="w-2 h-2 rounded-full bg-red-500" />;
    return <div className="w-2 h-2 rounded-full bg-slate-500" />;
  };

  return (
    <div className="space-y-3">
      {data.map((exec) => (
        <Card 
            key={exec.id} 
            className="p-4 border shadow-none cursor-pointer group hover:bg-muted/40 transition-colors"
            onClick={() => router.push(`${pathname}/${exec.id}`)}
        >
          <div className="flex items-start justify-between">
            {/* Left: Main Info */}
            <div className="flex items-start gap-4">
               {/* Status Indicator */}
               <div className="pt-1.5">
                  <div className={`p-1.5 rounded-full ${getStatusColor(exec.status)}`}>
                    <StatusIcon status={exec.status} />
                  </div>
               </div>

               <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                        {exec.title || exec.flow_name}
                    </span>
                    {exec.title && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {exec.flow_name}
                        </span>
                    )}
                    <div className={`text-[10px] uppercase font-bold tracking-wider px-1.5 rounded ${getStatusColor(exec.status)}`}>
                        {exec.status === "RUNNING" ? "Active" : exec.status}
                    </div>
                  </div>
                  
                  {/* Deployment / Run Info Line */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{exec.temporal_workflow_id}</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(exec.id);
                            toast.success("ID Copied");
                        }}
                    >
                        <Copy className="w-3 h-3" />
                        {exec.id.substring(0, 8)}...
                    </span>
                  </div>
               </div>
            </div>

            {/* Right: Actions & Time */}
            <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                    {formatTimeAgo(exec.started_at)}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Are you sure you want to delete this action flow run?")) return;
                          
                          const res = await fetch(`/api/action-flows/${exec.id}`, { method: 'DELETE' });
                          if (res.ok) {
                              toast.success("Deleted");
                              router.refresh(); // Trigger server component refresh? No, this is client.
                              // For client side list refetch, we might need a prop or just full reload.
                              // Ideally parent passes "onDelete" or controls state.
                              // For MVP, router.refresh() does a soft refresh, 
                              // OR we can trigger a reload.
                              window.location.reload(); 
                          } else {
                              toast.error("Failed to delete");
                          }
                      }}
                      title="Delete"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
