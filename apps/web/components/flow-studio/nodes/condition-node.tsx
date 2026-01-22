import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Split, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeCard } from './node-card';
import { cn } from '@/lib/utils';

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
    <NodeCard nodeId={id} borderColorClass="border-slate-500/20 hover:border-slate-500">
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
      
      <CardContent className="p-4 pt-2 pb-8">
        {(() => {
            const c = data.condition || {};
            const isConfigured = !!c.left && !!c.operator && !!c.right && !!data.description;
            return (
                <div className="flex flex-col gap-1">
                <div className={cn("text-xs font-mono truncate bg-muted/50 p-1 rounded px-2 mb-4", !isConfigured && "bg-transparent p-0")}>
                    {isConfigured 
                        ? `${c.left} ${c.operator} ${c.right}`
                        : (
                         <span className="flex items-center gap-1 text-red-500 font-sans font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Incomplete
                        </span>
                        )
                    }
                </div>
                 {isConfigured && (
                        <div className="text-[10px] font-medium text-green-600 flex items-center gap-1 mb-2 -mt-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Ready
                        </div>
                    )}
                </div>
            );
        })()}
      </CardContent>

      {/* True Path - Fixed Position relative to Top */}
      <div className="absolute right-3 top-[5.5rem] flex items-center transform -translate-y-1/2 pointer-events-none">
        <span className="text-[10px] font-medium text-green-600 mr-2">TRUE</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-green-500 border-2 border-background z-50 !top-[5.5rem]"
        title="True Path"
      />

      {/* False Path - Fixed Position relative to Top */}
      <div className="absolute right-3 top-[7.5rem] flex items-center transform -translate-y-1/2 pointer-events-none">
        <span className="text-[10px] font-medium text-red-500 mr-2">FALSE</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-red-500 border-2 border-background z-50 !top-[7.5rem]"
        title="False Path"
      />
    </NodeCard>
  );
});

ConditionNode.displayName = 'ConditionNode';
