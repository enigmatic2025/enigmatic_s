import { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { NodeCard } from './node-card';
import { RadioTower, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeStatus } from './node-status';

const AutomationNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const borderClasses = "border-pink-500/20 hover:border-pink-500/50";
  const handleColor = "bg-pink-500";

  const isConfigured = !!data.description;

  return (
    <NodeCard
      isSelected={selected}
      executionStatus={data.executionStatus}
      borderColorClass={borderClasses}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className={cn("w-3 h-3 border-2 border-background z-50", handleColor)}
      />

      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("p-2 rounded-md", "bg-pink-500/10")}>
            <RadioTower className={cn("h-4 w-4", "text-pink-500")} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Automation
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label}>
              {data.label || 'Wait for Event'}
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
        <NodeStatus
          isConfigured={isConfigured}
          configuredContent={data.description || 'Waiting for external event'}
        />
      </CardContent>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={cn("w-3 h-3 border-2 border-background z-50", handleColor)}
      />
    </NodeCard>
  );
});

AutomationNode.displayName = 'AutomationNode';

export { AutomationNode };
