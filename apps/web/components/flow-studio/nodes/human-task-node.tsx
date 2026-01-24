import { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { NodeCard } from './node-card';
import { ClipboardList, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeStatus } from './node-status';

const HumanTaskNode = memo(({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  
  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const colorClass = "text-teal-500 bg-teal-500/10 border-teal-500/20 hover:border-teal-500/50";
  const borderClasses = "border-teal-500/20 hover:border-teal-500/50";
  const handleColor = "bg-teal-500";
  
  const isConfigured = !!data.config?.assignee;
  const readyLabel = "Ready for Human";

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
          <div className={cn("p-2 rounded-md", "bg-teal-500/10")}>
            <ClipboardList className={cn("h-4 w-4", "text-teal-500")} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Human Action
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label || data.title}>
               {data.label || data.title || 'Action Required'}
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
          const isConfigured = !!data.assignee && !!data.description;
          
          return (
            <NodeStatus 
              isConfigured={isConfigured}
              configuredContent={data.description || 'Task configured'}
            />
          );
        })()}
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

HumanTaskNode.displayName = 'HumanTaskNode';

export { HumanTaskNode };
