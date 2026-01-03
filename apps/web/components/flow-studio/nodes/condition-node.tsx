import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Split, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeCard } from './node-card';

export const ConditionNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  // Helper to display the condition summary
  const conditionPreview = data.condition 
    ? `${data.condition.left || '?'} ${data.condition.operator || '=='} ${data.condition.right || '?'}`
    : 'Not configured';

  return (
    <NodeCard borderColorClass="border-slate-500/20 hover:border-slate-500">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-slate-500 border-2 border-background z-50"
      />

      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-slate-500/10 rounded-md">
            <Split className="h-4 w-4 text-slate-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Condition
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label || 'If / Else'}>
              {data.label || 'If / Else'}
            </CardTitle>
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
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono text-muted-foreground truncate bg-muted/50 p-1 rounded px-2">
            {conditionPreview}
          </div>
          <div className="flex justify-between items-center text-[10px] font-medium pt-1">
            <span className="text-green-600">TRUE</span>
            <span className="text-red-500">FALSE</span>
          </div>
        </div>
      </CardContent>

      {/* True Path Output */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500 border-2 border-background z-50 !top-[30%]"
        title="True Path"
      />

      {/* False Path Output */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500 border-2 border-background z-50 !top-[70%]"
        title="False Path"
      />
    </NodeCard>
  );
});

ConditionNode.displayName = 'ConditionNode';
