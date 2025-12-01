import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Clock, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const ScheduleNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();

  const onDelete = () => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <Card className="min-w-[200px] border-2 border-blue-500/20 shadow-sm hover:border-blue-500/50 transition-colors group">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-md">
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <CardTitle className="text-sm font-medium">Schedule</CardTitle>
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
          {data.label || 'Runs every day at 9:00 AM'}
        </div>
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-background"
      />
    </Card>
  );
});

ScheduleNode.displayName = 'ScheduleNode';
