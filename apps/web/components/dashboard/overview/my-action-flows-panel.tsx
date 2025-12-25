"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { actionFlows } from "../action-flows/data";


export function MyActionFlowsPanel() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Filter for active flows that might be relevant to the user
  // For demo purposes, we'll show In Progress flows
  const myFlows = actionFlows.filter(flow => 
    flow.status === "In Progress" || flow.status === "Review"
  );

  const MAX_VISIBLE_FLOWS = 5;
  const hasMoreFlows = myFlows.length > MAX_VISIBLE_FLOWS;
  const visibleFlows = myFlows.slice(0, MAX_VISIBLE_FLOWS);

  const handleFlowClick = (flowId: string) => {
    router.push(`/nodal/${slug}/dashboard/action-flows/${flowId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg tracking-tight">My Action Flows</h3>
        {hasMoreFlows && (
          <Button variant="link" className="text-xs text-muted-foreground h-auto p-0">
            View All ({myFlows.length})
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {visibleFlows.map((flow) => (
          <Card 
            key={flow.id} 
            className="border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => handleFlowClick(flow.id)}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="font-medium text-sm transition-colors group-hover:text-primary">
                    {flow.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-mono text-[10px] bg-muted px-1 rounded">{flow.id}</span>
                    <span>•</span>
                    <span className={
                      flow.status === 'Blocked' ? "text-red-500 font-medium" : 
                      flow.status === 'In Progress' ? "text-blue-600" : 
                      "text-amber-600"
                    }>
                      {flow.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Action</span>
                  <span className="font-medium">{flow.currentAction}</span>
                </div>
                
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary/80 rounded-full transition-all duration-500"
                    style={{ width: `${flow.progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
