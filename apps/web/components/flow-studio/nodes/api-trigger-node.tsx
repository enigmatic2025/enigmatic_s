import React, { memo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Zap, Trash2 } from 'lucide-react';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NodeCard } from './node-card';
import { NodeStatus } from './node-status';
import { useTranslations } from 'next-intl';

const ApiTriggerNode = memo(({ id, data, isConnectable }: any) => {
  const { setNodes } = useReactFlow();
  const t = useTranslations("FlowNodes");

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };

  return (
    <NodeCard 
      nodeId={id} 
      borderColorClass="border-emerald-500/20 hover:border-emerald-500"
      testId="api-trigger-node"
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-emerald-500/10 rounded-md">
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {t("labels.startEvent")}
            </span>
            <CardTitle className="text-sm font-medium leading-none truncate" title={data.label}>{data.label || t("labels.incomingWebhook")}</CardTitle>
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
            isConfigured={true}
            configuredContent={
                <div className="flex flex-col gap-2">
                    <div className="truncate">
                        {data.description || t("labels.startsNewFlowRun")}
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border border-border/30">
                        <Zap className="w-3 h-3 text-emerald-500 shrink-0" />
                        <code className="text-[10px] text-muted-foreground font-mono truncate">
                            /api/v1/flows/.../execute
                        </code>
                    </div>
                </div>
            }
         />
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-background z-50"
      />
    </NodeCard>
  );
});

ApiTriggerNode.displayName = 'ApiTriggerNode';

export default ApiTriggerNode;
