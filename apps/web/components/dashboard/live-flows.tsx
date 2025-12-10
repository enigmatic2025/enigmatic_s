import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const mockLiveFlows = [
  {
    id: "1",
    name: "Q4 Budget Approval",
    role: "Approver",
    status: "Waiting for you",
    startedBy: "Sarah Chen",
    timeElapsed: "2 hours",
  },
  {
    id: "2",
    name: "New Hire: Alex M.",
    role: "Participant",
    status: "In Progress",
    startedBy: "HR System",
    timeElapsed: "1 day",
  },
  {
    id: "3",
    name: "Incident Response #402",
    role: "Observer",
    status: "Active",
    startedBy: "PagerDuty",
    timeElapsed: "15 mins",
  },
];

export function LiveFlows({ className }: { className?: string }) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader>
        <CardTitle>My Action Flows</CardTitle>
        <CardDescription>
          Active Action Flows where you are a participant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLiveFlows.map((flow) => (
            <div
              key={flow.id}
              className="flex flex-col space-y-2 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold leading-none">{flow.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">by {flow.startedBy}</p>
                  </div>
                </div>
                <Badge variant={flow.status === "Waiting for you" ? "default" : "secondary"} className="shrink-0">
                  {flow.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{flow.timeElapsed}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
