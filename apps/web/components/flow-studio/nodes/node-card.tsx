import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Handle, Position } from 'reactflow';

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
  testId
}: NodeCardProps) => {
  
  return (
    <Card 
      className={cn(
        "w-[250px] min-h-[120px] h-auto relative border-0 shadow-none bg-card group",
        className
      )}
      data-testid={testId}
    >
      {/* 
        SAFARI RENDER FIX:
        Isolated border layer to prevent layout thrashing and text blur on hover.
        The border is on its own layer, separate from the content.
      */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl border-2 pointer-events-none transition-colors duration-300",
          "shadow-sm group-hover:shadow-md",
          borderColorClass
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
