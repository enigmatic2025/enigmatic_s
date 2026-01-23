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

  return (
    <div className="h-full flex flex-col space-y-6 p-8 max-w-6xl mx-auto">
       {/* Header */}
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-2xl font-semibold tracking-tight">Action Flow SOP</h1>
             <p className="text-sm text-muted-foreground mt-1">
                Standard Operating Procedures and Process Maps.
             </p>
          </div>
          <div className="flex items-center gap-2">
             {/* Auto-refresh is active */}
          </div>
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
