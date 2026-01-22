import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Repeat, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NodeCard } from './node-card';
import { NodeStatus } from './node-status';

export const LoopNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <NodeCard 
      nodeId={id}
      borderColorClass="border-blue-500/20 hover:border-blue-500/50"
      testId="loop-node"
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-slate-500 z-50"
      />
      
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-md bg-blue-500/10">
            <Repeat className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Loop
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label}>{data.label || "For Each Item"}</CardTitle>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
          onClick={onDelete}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 pb-8">
        {(() => {
           const isConfigured = !!data.items && !!data.description;
           return (
             <NodeStatus 
               isConfigured={isConfigured}
               configuredContent={`Iterating ${data.items}`}
               className="mb-4"
             />
           );
        })()}
      </CardContent>

      <div className="absolute right-3 top-[5.5rem] flex items-center transform -translate-y-1/2 pointer-events-none">
        <span className="text-[10px] font-medium text-blue-600 uppercase tracking-wider mr-2">Item</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="item"
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-blue-500 z-50 !top-[5.5rem]"
      />

      <div className="absolute right-3 top-[7.5rem] flex items-center transform -translate-y-1/2 pointer-events-none">
        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mr-2">Done</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="done"
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-slate-500 z-50 !top-[7.5rem]"
      />
    </NodeCard>
  );
});

LoopNode.displayName = 'LoopNode';
