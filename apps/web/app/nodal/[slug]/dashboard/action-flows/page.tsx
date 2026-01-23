"use client";

import { useEffect, useState } from "react";
import { ActionFlowList, ActionFlowExec } from "@/components/dashboard/action-flows/action-flow-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, Zap } from "lucide-react";
import { toast } from "sonner";

export default function ActionFlowPlyPage() {
  const [executions, setExecutions] = useState<ActionFlowExec[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExecutions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/action-flows");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExecutions(data);
    } catch (e) {
      toast.error("Failed to load action flows");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    // Auto-refresh every 10 seconds to show live status updates (Koyeb style)
    const interval = setInterval(() => {
        // Silent refresh
        fetch("/api/action-flows")
            .then(res => res.json())
            .then(data => setExecutions(data))
            .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = executions.filter(e => 
    e.flow_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = executions.filter(e => e.status === "RUNNING").length;

  return (
    <div className="h-full w-full space-y-6">
       {/* Header */}
       <div className="flex items-baseline gap-4">
          <h1 className="text-xl font-medium tracking-tight text-foreground">
            Action Flow
          </h1>
          <span className="text-secondary-foreground/60 text-sm font-medium">
            {activeCount} active flow{activeCount !== 1 ? "s" : ""}
          </span>
       </div>

       {/* Toolbar */}
       <div className="flex items-center justify-between gap-4 bg-card p-1 rounded-lg border shadow-sm">
          <div className="relative flex-1 max-w-sm">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Search processes..." 
                className="pl-9 h-9 border-0 bg-transparent focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
       </div>

       {/* List */}
       <ActionFlowList data={filtered} isLoading={isLoading && executions.length === 0} />
    </div>
  );
}
