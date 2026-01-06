import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Zap, Globe, Mail, Trash2, ListFilter } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NodeCard } from './node-card';

const icons = {
  http: Globe,
  email: Mail,
  filter: ListFilter,

  default: Zap,
};

const ACTION_NAMES: Record<string, string> = {
  http: "HTTP Request",
  email: "Send Email",
  filter: "Filter Data",

  default: "Action",
};

const colors = {
  http: "text-orange-500 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50",
  email: "text-orange-500 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50",
  filter: "text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50",

  default: "text-slate-500 bg-slate-500/10 border-slate-500/20 hover:border-slate-500/50",
};

export const ActionNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();
  const subtype = data.subtype as keyof typeof icons || 'default';
  const Icon = icons[subtype] || icons.default;
  const colorClass = colors[subtype] || colors.default;

  const handleColor = 
    subtype === 'http' || subtype === 'email' ? 'bg-orange-500' : 
    subtype === 'filter' ? 'bg-purple-500' :
    'bg-slate-500';

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  const borderClasses = colorClass.split(' ').filter(c => c.startsWith('border') || c.startsWith('hover:border')).join(' ');

  return (
    <NodeCard 
      borderColorClass={borderClasses}
      testId={`action-node-${subtype}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={cn("w-3 h-3 border-2 border-background z-50", handleColor)}
      />
      
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("p-2 rounded-md", colorClass.split(' ').filter(c => c.startsWith('bg')).join(' '))}>
            <Icon className={cn("h-4 w-4", colorClass.split(' ').filter(c => c.startsWith('text')).join(' '))} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {ACTION_NAMES[subtype] || ACTION_NAMES.default}
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label}>{data.label}</CardTitle>
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
          const isConfigured = subtype === 'http' ? !!data.url : true;
          
          return (
            <div className="flex flex-col gap-1">
              <div className={cn("text-xs truncate", isConfigured ? "text-muted-foreground" : "text-orange-500 font-medium")}>
                {isConfigured ? (data.description || 'Action configured') : 'Click to configure'}
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
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={cn("w-3 h-3 border-2 border-background z-50", handleColor)}
      />
    </NodeCard>
  );
});

ActionNode.displayName = 'ActionNode';
