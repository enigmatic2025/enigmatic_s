"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Comment, CommentSection } from "./comment-section";

export interface TimelineStep {
  id: string;
  type: 'schedule' | 'action' | 'ai' | 'human' | 'logic';
  label: string;
  description?: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  timestamp?: string;
  duration?: string;
  comments: Comment[];
  assignee?: {
    name: string;
    initials: string;
  } | null;
  isAutomated?: boolean;
}

interface TimelineItemProps {
  step: TimelineStep;
  isLast: boolean;
  isSelected?: boolean;
  onAddComment: (stepId: string, content: string) => void;
}

const getStatusConfig = (status: TimelineStep['status']) => {
  switch (status) {
    case 'completed':
      return { label: 'Complete', color: 'text-green-700', icon: CheckCircle2 };
    case 'running':
      return { label: 'In Progress', color: 'text-blue-700', icon: Clock };
    case 'failed':
      return { label: 'Failed', color: 'text-red-700', icon: AlertCircle };
    case 'pending':
      return { label: 'Pending', color: 'text-muted-foreground', icon: Clock };
    default:
      return { label: status, color: 'text-muted-foreground', icon: Clock };
  }
};

export function TimelineItem({ step, isLast, isSelected, onAddComment }: TimelineItemProps) {
  const isDisabled = step.status === 'pending';
  const statusConfig = getStatusConfig(step.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn(
      "border rounded p-3 mb-2 transition-all duration-200 hover:bg-muted/50",
      isDisabled && "opacity-40",
      isSelected ? "border-blue-300 dark:border-blue-700" : "border-border"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1">
          <h4 className={cn(
            "text-sm font-medium",
            isDisabled && "text-muted-foreground",
            isSelected && "text-blue-700 dark:text-blue-400"
          )}>
            {step.label}
          </h4>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {step.isAutomated ? (
              <span>Automated</span>
            ) : step.assignee ? (
              <div className="flex items-center gap-1.5">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px]">
                    {step.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <span>{step.assignee.name}</span>
              </div>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium whitespace-nowrap",
          statusConfig.color
        )}>
          <StatusIcon className="h-3 w-3" />
          {statusConfig.label}
        </div>
      </div>
    </div>
  );
}
