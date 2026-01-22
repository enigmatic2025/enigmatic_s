import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeCard } from './node-card';
import { ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const HumanTaskNode = memo(({ data, selected }: NodeProps) => {
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
              Human Task
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.config?.title}>
               {data.config?.title || 'Action Required'}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
         <div className="flex flex-col gap-1">
            <div className={cn("text-xs truncate", isConfigured ? "text-muted-foreground" : "text-teal-500 font-medium")}>
               {isConfigured ? (data.config?.description || 'Task configured') : 'Click to configure'}
            </div>
            {isConfigured && (
                 <div className="text-[10px] font-medium text-green-600 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   {data.config?.assignee || 'Assigned'}
                 </div>
            )}
         </div>
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
