import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Split, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeCard } from './node-card';
import { cn } from '@/lib/utils';

export const SwitchNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();
  const cases = data.cases || [];

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  // Base offset for handles (header + padding)
  const BASE_TOP_OFFSET_REM = 5.5; 
  const ITEM_HEIGHT_REM = 2;

  return (
    <NodeCard 
      nodeId={id}
      borderColorClass="border-amber-500/20 hover:border-amber-500/50"
      testId="switch-node"
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-3 h-3 border-2 border-background bg-slate-500 z-50"
      />
      
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-md bg-amber-500/10">
            <Split className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Switch
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label}>{data.label || "Switch"}</CardTitle>
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
      
      <CardContent className="p-4 pt-2 pb-2">
        {(() => {
            const isConfigured = !!data.variable && !!data.description;
            return (
                <div className="flex flex-col gap-1 mb-4">
                    <div className={cn("text-xs truncate", isConfigured ? "text-muted-foreground" : "font-medium")}>
                    {isConfigured ? (
                        <span className="font-mono text-amber-600">Switch on {data.variable}</span>
                    ) : (
                         <span className="flex items-center gap-1 text-red-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Incomplete
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
        })()}
        {/* Spacers to push the card height to match handles */}
        <div style={{ height: `${(cases.length + 1) * ITEM_HEIGHT_REM}rem` }} />
      </CardContent>

      {/* Dynamic Case Handles */}
      {cases.map((caseItem: any, index: number) => {
         // Handle both string[] (legacy) and {id, label}[] (new)
         const isObject = typeof caseItem === 'object';
         const label = isObject ? caseItem.label : caseItem;
         const caseId = isObject ? caseItem.id : `case-${index}`;
         
         const topRem = BASE_TOP_OFFSET_REM + (index * ITEM_HEIGHT_REM);
         
        return [
            <div 
                key={`${caseId}-label`}
                className="absolute right-3 flex items-center transform -translate-y-1/2 pointer-events-none"
                style={{ top: `${topRem}rem` }}
            >
                <span className="text-[10px] font-medium text-amber-600 uppercase tracking-wider mr-2 max-w-[80px] truncate" title={label}>
                    {label}
                </span>
            </div>,
            <Handle
                key={caseId}
                type="source"
                position={Position.Right}
                id={caseId}
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 border-background bg-amber-500 z-50"
                style={{ top: `${topRem}rem` }}
            />
          ];
      })}

            <div 
                className="absolute right-3 flex items-center transform -translate-y-1/2 pointer-events-none"
                style={{ top: `${BASE_TOP_OFFSET_REM + (cases.length * ITEM_HEIGHT_REM)}rem` }}
            >
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mr-2">Default</span>
            </div>
            <Handle
                type="source"
                position={Position.Right}
                id="default"
                isConnectable={isConnectable}
                className="w-3 h-3 border-2 border-background bg-slate-500 z-50"
                style={{ top: `${BASE_TOP_OFFSET_REM + (cases.length * ITEM_HEIGHT_REM)}rem` }}
            />

    </NodeCard>
  );
});

SwitchNode.displayName = 'SwitchNode';
