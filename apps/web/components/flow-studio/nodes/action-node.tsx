import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Zap, Globe, Mail, BrainCircuit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const icons = {
  http: Globe,
  email: Mail,
  ai: BrainCircuit,
  default: Zap,
};

const colors = {
  http: "text-orange-500 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50",
  email: "text-orange-500 bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50",
  ai: "text-purple-500 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50",
  default: "text-slate-500 bg-slate-500/10 border-slate-500/20 hover:border-slate-500/50",
};

export const ActionNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();
  const subtype = data.subtype as keyof typeof icons || 'default';
  const Icon = icons[subtype] || icons.default;
  const colorClass = colors[subtype] || colors.default;

  // Extract border color for the handle
  const handleColor = subtype === 'ai' ? 'bg-purple-500' : subtype === 'http' || subtype === 'email' ? 'bg-orange-500' : 'bg-slate-500';

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <Card className={cn("min-w-[200px] border-2 shadow-sm transition-colors group", colorClass.split(' ').filter(c => c.startsWith('border')).join(' '))}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={cn("w-3 h-3 border-2 border-background", handleColor)}
      />
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-md", colorClass.split(' ').filter(c => c.startsWith('bg')).join(' '))}>
            <Icon className={cn("h-4 w-4", colorClass.split(' ').filter(c => c.startsWith('text')).join(' '))} />
          </div>
          <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs text-muted-foreground">
          {data.description || 'Configure this action'}
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={cn("w-3 h-3 border-2 border-background", handleColor)}
      />
    </Card>
  );
});

ActionNode.displayName = 'ActionNode';
