import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Handle, Position } from 'reactflow';
import { useFlowStore } from '@/lib/stores/flow-store';

interface NodeCardProps {
  children: React.ReactNode;
  className?: string;
  borderColorClass?: string;
  handleColorClass?: string;
  isSelected?: boolean;
  isConnectable?: boolean;
  testId?: string;
}

/**
 * NodeCard
 * 
 * A wrapper component for Flow Studio nodes that handles:
 * 1. Consistent sizing and styling
 * 2. Safari-specific rendering fixes (isolated border layer + hardware accelerated content)
 * 3. Standard handle positioning
 */
export const NodeCard = ({
  children,
  className,
  borderColorClass = "border-slate-500", // Default border color path
  handleColorClass = "bg-slate-500",
  isConnectable = true,
  testId,
  nodeId
}: NodeCardProps & { nodeId?: string }) => {
  const executionTrace = useFlowStore((state) => state.executionTrace);
  const result = nodeId ? executionTrace[nodeId] : null;

  let statusBorder = borderColorClass;
  let StatusBadge = null;

  if (result) {
    if (result.status === 'success') {
      statusBorder = "border-green-500 ring-2 ring-green-500/20";
      StatusBadge = (
        <div className="absolute -top-3 right-2 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium shadow-sm z-50 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {result.duration ? `${result.duration}ms` : 'Success'}
        </div>
      );
    } else if (result.status === 'error') {
      statusBorder = "border-red-500 ring-2 ring-red-500/20 bg-red-50 dark:bg-red-950/20";
      StatusBadge = (
        <div className="absolute -top-3 right-2 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium shadow-sm z-50 flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
           Error
        </div>
      );
    } else if (result.status === 'running') {
       statusBorder = "border-blue-500 ring-2 ring-blue-500/20 animate-pulse";
    }
  }

  return (
    <Card 
      className={cn(
        "w-[250px] min-h-[120px] h-auto relative border-0 shadow-none bg-card group",
        className
      )}
      data-testid={testId}
    >
      {StatusBadge}
      {/* 
        SAFARI RENDER FIX:
        Isolated border layer to prevent layout thrashing and text blur on hover.
        The border is on its own layer, separate from the content.
      */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl border-2 pointer-events-none transition-all duration-300",
          "shadow-sm group-hover:shadow-md",
          statusBorder
        )} 
      />

      {/* Left Input Handle */}
      {/* Only show input handle for non-trigger nodes? Logic usually handled by parent calling this, 
          but here we put handles standard. If a node DOESN'T need a handle, we might need a prop. 
          For now, ActionNode needs both, Schedule/Trigger only need Source.
          Actually, let's keep handles in the parent component to allow flexibility 
          (e.g. triggers don't start with a target handle).
          
          WAIT: The user code had handles inside. 
          ActionNode has Target (Left) and Source (Right).
          Schedule/Manual have Source (Right) only.
          
          Let's NOT include handles here to keep it flexible.
      */}

      {/* 
        SAFARI RENDER FIX:
        Content Isolation Layer.
        translate3d(0,0,0) forces hardware acceleration (GPU layer).
        'antialiased' ensures consistent font rendering during layer promotion.
      */}
      <div 
        style={{ transform: 'translate3d(0,0,0)', zIndex: 1, position: 'relative' }} 
        className="antialiased h-full flex flex-col"
      >
        {children}
      </div>
    </Card>
  );
};
