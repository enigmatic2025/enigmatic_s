"use client";

import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { ScheduleNode } from './nodes/schedule-node';
import { ActionNode } from './nodes/action-node';

interface FlowDesignerProps {
  flowId?: string;
}

const nodeTypes = {
  schedule: ScheduleNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'schedule',
    position: { x: 250, y: 50 },
    data: { label: 'Every Morning' },
  },
];

function FlowDesignerContent({ flowId }: FlowDesignerProps) {
  const router = useRouter();
  const params = useParams();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowWrapper.current?.getBoundingClientRect();
      
      if (!position) return;

      const positionInstance = project({
        x: event.clientX - position.left,
        y: event.clientY - position.top,
      });

      const [nodeType, subtype] = type.split(':');

      // Validation: Must start with a Trigger (Schedule)
      if (nodes.length === 0 && nodeType !== 'schedule') {
        toast.error("You must start with a Trigger (e.g., Schedule)!");
        return;
      }

      const newNode: Node = {
        id: Math.random().toString(),
        type: nodeType,
        position: positionInstance,
        data: { 
          label: subtype === 'http' ? 'HTTP Request' : subtype === 'ai' ? 'AI Reasoning' : 'New Schedule',
          subtype: subtype 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes, nodes],
  );

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 z-10 relative">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              router.push(`/nodal/${params.slug}/dashboard/flow-studio`)
            }
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold">
              {flowId ? `Flow #${flowId}` : "New Flow"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {flowId ? "Last saved 2 mins ago" : "Unsaved changes"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Play className="h-4 w-4" />
            Test Run
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Save Flow
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-muted/10 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export function FlowDesigner(props: FlowDesignerProps) {
  return (
    <ReactFlowProvider>
      <FlowDesignerContent {...props} />
    </ReactFlowProvider>
  );
}
