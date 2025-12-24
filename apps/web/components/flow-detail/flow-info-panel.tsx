"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Activity, CheckCircle2, AlertCircle } from "lucide-react";

interface FlowInfoPanelProps {
  flow: {
    name: string;
    description: string;
    status: "active" | "inactive" | "draft";
    lastRun: string;
    successRate: number;
    totalRuns: number;
    avgDuration: string;
  };
}

export function FlowInfoPanel({ flow }: FlowInfoPanelProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{flow.totalRuns}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime executions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{flow.successRate}%</div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{flow.avgDuration}</div>
          <p className="text-xs text-muted-foreground">
            Per execution
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant={flow.status === "active" ? "default" : "secondary"}>
              {flow.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
                Last run: {flow.lastRun}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
