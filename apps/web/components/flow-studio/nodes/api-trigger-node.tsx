import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';

const ApiTriggerNode = ({ data, selected }: NodeProps) => {
  return (
    <div
      className={`
        relative flex flex-col w-[280px] rounded-xl bg-card border-2 transition-all duration-200
        ${selected ? 'border-emerald-500 shadow-lg ring-1 ring-emerald-500/50' : 'border-border/50 hover:border-emerald-400/50'}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-border/50 bg-gradient-to-r from-emerald-500/10 to-transparent rounded-t-lg">
        <div className="flex items-center justify-center p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
          <Zap className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {data.label || 'Incoming Webhook'}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
            START EVENT
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <div className="text-xs text-muted-foreground">
          {data.description || 'Starts a new flow run when data is received.'}
        </div>
        
        {/* Endpoint Preview */}
        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border border-border/30">
          <Zap className="w-3 h-3 text-emerald-500" />
          <code className="text-[10px] text-muted-foreground font-mono truncate">
            /api/v1/flows/.../execute
          </code>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -right-1.5 bg-emerald-500 border-2 border-background z-50 transition-transform hover:scale-125"
      />
    </div>
  );
};

export default memo(ApiTriggerNode);
