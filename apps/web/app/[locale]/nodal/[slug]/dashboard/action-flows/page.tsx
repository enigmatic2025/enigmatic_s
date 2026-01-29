"use client";

import { useState } from "react";
import useSWR from "swr";

import { apiClient } from "@/lib/api-client";
import { ActionFlowList, ActionFlowExec } from "@/components/dashboard/action-flows/action-flow-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, Zap } from "lucide-react";
import { toast } from "sonner";

export default function ActionFlowPlyPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: executions = [], isLoading } = useSWR<ActionFlowExec[]>(

    "/api/action-flows",
    (url) => apiClient.get(url).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    }),
    {
        refreshInterval: 10000, 
        fallbackData: []
    }
  );

  // Removed manual fetchExecutions and useEffect polling


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
       <div className="flex items-center gap-4">
          <div className="relative flex-1">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Search processes..." 
                className="pl-9 bg-background border-input shadow-none"
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
