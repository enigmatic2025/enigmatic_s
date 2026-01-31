import { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { NodeCard } from './node-card';
import { CornerUpLeft, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeStatus } from './node-status';

const GotoNode = memo(({ id, data, selected, isConnectable }: NodeProps) => {
  const { setNodes, getNodes } = useReactFlow();
  
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const borderColorClasses = "border-fuchsia-500/20 hover:border-fuchsia-500/50";
  const handleColor = "bg-fuchsia-500";

  // Find target node name to display
  const nodes = getNodes();
  const targetNode = nodes.find(n => n.id === data.targetId);
  const targetName = targetNode?.data?.label || targetNode?.id || "Unknown";

  return (
    <NodeCard 
      isSelected={selected} 
      borderColorClass={borderColorClasses}
      testId="goto-node"
    >
       {/* Input Handle Only - It receives flow, then jumps */}
       <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={cn("w-3 h-3 border-2 border-background z-50", handleColor)}
      />

      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("p-2 rounded-md", "bg-fuchsia-500/10")}>
            <CornerUpLeft className={cn("h-4 w-4", "text-fuchsia-500")} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Flow Control
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate">
               Jump / Goto
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
         {(() => {
          const isConfigured = !!data.targetId;
          
          return (
            <div className="space-y-2">
                <NodeStatus 
                isConfigured={isConfigured}
                configuredContent={
                    <div className="flex items-center gap-1 text-xs">
                        <span>To:</span>
                        <span className="font-mono bg-fuchsia-500/10 text-fuchsia-600 px-1.5 py-0.5 rounded border border-fuchsia-500/20 max-w-[120px] truncate" title={targetName}>
                            {targetName}
                        </span>
                    </div>
                }
                />
            </div>
          );
        })()}
      </CardContent>
      
      {/* No Output Handle - It jumps! */}
    </NodeCard>
  );
});

GotoNode.displayName = 'GotoNode';

export { GotoNode };
