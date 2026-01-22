import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Braces, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NodeCard } from './node-card';
import { NodeStatus } from './node-status';

export const VariableNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <NodeCard 
      nodeId={id}
      borderColorClass="border-teal-500/20 hover:border-teal-500/50"
      testId="variable-node"
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-teal-500 z-50"
      />
      
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-md bg-teal-500/10">
            <Braces className="h-4 w-4 text-teal-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Set Variable
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label}>{data.label || "Set Variable"}</CardTitle>
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
      
      <CardContent className="p-4 pt-2">
            {(() => {
                 const isConfigured = !!data.variableName && (data.value !== undefined && data.value !== '') && !!data.description;
                 return (
                    <NodeStatus 
                        isConfigured={isConfigured}
                        configuredContent={
                            <span className="font-mono text-teal-600">{data.variableName} = {data.value}</span>
                        }
                    />
                 );
            })()}
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-teal-500 z-50"
      />
    </NodeCard>
  );
});

VariableNode.displayName = 'VariableNode';
