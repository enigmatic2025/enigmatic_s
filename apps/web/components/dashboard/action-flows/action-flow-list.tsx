"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { useRouter, useParams } from "next/navigation";

interface ActionFlowListProps {
  data?: typeof actionFlows;
}

export function ActionFlowList({ data = actionFlows }: ActionFlowListProps) {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const handleViewDetails = (flowId: string) => {
    router.push(`/nodal/${slug}/dashboard/action-flows/${flowId}`);
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead className="w-[200px]">Flow Name</TableHead>
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="w-[200px]">Current Action</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Started At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((flow) => (
            <TableRow 
              key={flow.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleViewDetails(flow.id)}
            >
              <TableCell className="font-medium text-muted-foreground text-xs">
                {flow.id}
              </TableCell>
              <TableCell className="font-medium">{flow.name}</TableCell>
              <TableCell className="max-w-[400px]">
                <DescriptionCell description={flow.description} />
              </TableCell>
              <TableCell>
                <StatusBadge status={flow.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={flow.priority || "Medium"} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">{flow.currentAction}</span>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-in-out" 
                      style={{ width: `${flow.progress}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {new Date(flow.startedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      Cancel Flow
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
