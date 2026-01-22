import React from 'react';
import { cn } from '@/lib/utils';

interface NodeStatusProps {
  isConfigured: boolean;
  /** Content to display when the node is configured (e.g. description, summary) */
  configuredContent: React.ReactNode;
  /** Label to display when incomplete (default: "Incomplete") */
  incompleteLabel?: string;
  /** Optional class to apply to the configured content container */
  className?: string;
}

export const NodeStatus = ({ 
  isConfigured, 
  configuredContent, 
  incompleteLabel = "Incomplete",
  className 
}: NodeStatusProps) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className={cn("text-xs truncate", isConfigured ? "text-muted-foreground" : "font-medium")}>
        {isConfigured ? (
          configuredContent
        ) : (
          <span className="flex items-center gap-1 text-red-500">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {incompleteLabel}
          </span>
        )}
      </div>
      {isConfigured && (
        <div className="text-[10px] font-medium text-green-600 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Ready
        </div>
      )}
    </div>
  );
};
