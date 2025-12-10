"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionFlows } from "./data";
import { DescriptionCell } from "./description-cell";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";

interface ActionFlowGridProps {
  data?: typeof actionFlows;
}

export function ActionFlowGrid({ data = actionFlows }: ActionFlowGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((flow) => (
        <Card key={flow.id} className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium leading-none">
                  {flow.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{flow.id}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-2">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>View History</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Cancel Flow
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <StatusBadge status={flow.status} />
                <PriorityBadge priority={flow.priority || "Medium"} />
              </div>
              <span className="text-xs text-muted-foreground">{new Date(flow.startedAt).toLocaleDateString()}</span>
            </div>
            <div className="space-y-3">
              <div className="min-h-10">
                <DescriptionCell description={flow.description} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Current Action</span>
                  <span className="font-medium">{flow.currentAction}</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-in-out" 
                    style={{ width: `${flow.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 border-t bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-2">
                {flow.assignees.map((assignee, i) => (
                  <Avatar key={i} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={assignee.image} />
                    <AvatarFallback className="text-[10px]">
                      {assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {flow.assignees.length === 1 
                  ? `Assigned to ${flow.assignees[0].name}`
                  : `Assigned to ${flow.assignees.length} people`}
              </span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
