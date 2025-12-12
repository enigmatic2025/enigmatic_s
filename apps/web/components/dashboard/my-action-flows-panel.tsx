"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronRight, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface ActionFlow {
  id: string;
  name: string;
  status: "Active" | "Blocked" | "Review" | "Completed";
  progress: number;
  currentStep: string;
  dueDate: string;
  assignees: { initials: string; color?: string }[];
}

const myFlows: ActionFlow[] = [
  {
    id: "FLOW-885",
    name: "Shipment #AX-992 Exception",
    status: "Active",
    progress: 65,
    currentStep: "Awaiting Customs Clearance",
    dueDate: "Today, 4:00 PM",
    assignees: [{ initials: "SC" }, { initials: "JD" }]
  },
  {
    id: "FLOW-889",
    name: "Reefer #402 Maintenance",
    status: "Blocked",
    progress: 30,
    currentStep: "Parts Procurement",
    dueDate: "Tomorrow, 10:00 AM",
    assignees: [{ initials: "MR" }]
  },
  {
    id: "FLOW-901",
    name: "Q4 Route Optimization",
    status: "Review",
    progress: 90,
    currentStep: "Manager Approval",
    dueDate: "Dec 12",
    assignees: [{ initials: "AI" }, { initials: "ST" }]
  },
  {
    id: "FLOW-905",
    name: "Driver Onboarding - Region West",
    status: "Active",
    progress: 15,
    currentStep: "Document Verification",
    dueDate: "Dec 15",
    assignees: [{ initials: "HR" }]
  },
  {
    id: "FLOW-912",
    name: "Warehouse Safety Audit",
    status: "Active",
    progress: 45,
    currentStep: "Zone B Inspection",
    dueDate: "Dec 18",
    assignees: [{ initials: "MR" }, { initials: "ST" }]
  }
];

export function MyActionFlowsPanel() {
  const MAX_VISIBLE_FLOWS = 4;
  const hasMoreFlows = myFlows.length > MAX_VISIBLE_FLOWS;
  const visibleFlows = myFlows.slice(0, MAX_VISIBLE_FLOWS);

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
          <Card key={flow.id} className="border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="font-medium text-sm transition-colors">
                    {flow.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-mono text-[10px] bg-muted px-1 rounded">{flow.id}</span>
                    <span>•</span>
                    <span className={
                      flow.status === 'Blocked' ? "text-red-500 font-medium" : 
                      flow.status === 'Active' ? "text-green-600" : 
                      "text-amber-600"
                    }>
                      {flow.status}
                    </span>
                  </div>
                </div>
                {flow.status === 'Blocked' && <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />}
                {flow.status === 'Active' && <Clock className="h-4 w-4 text-green-500 shrink-0" />}
                {flow.status === 'Review' && <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{flow.currentStep}</span>
                  <span className="font-medium">{flow.progress}%</span>
                </div>
                <Progress value={flow.progress} className="h-1.5" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex -space-x-2">
                  {flow.assignees.map((assignee, i) => (
                    <Avatar key={i} className="h-6 w-6 border-2 border-background text-[10px]">
                      <AvatarFallback className={assignee.color || "bg-muted text-muted-foreground"}>
                        {assignee.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Due {flow.dueDate}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button variant="outline" className="w-full text-xs h-9 border-dashed text-muted-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create New Flow
        </Button>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
