"use client";

import { TimelineItem, TimelineStep } from "./timeline-item";

interface FlowTimelineProps {
  steps: TimelineStep[];
  onAddComment: (stepId: string, content: string) => void;
}

export function FlowTimeline({ steps, onAddComment }: FlowTimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => (
        <TimelineItem
          key={step.id}
          step={step}
          isLast={index === steps.length - 1}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}
