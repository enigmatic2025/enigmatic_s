"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
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

const initialNodes: Node[] = [];

function FlowDesignerContent({ flowId }: FlowDesignerProps) {
  const router = useRouter();
  const params = useParams();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
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

      // Validation: Only one Trigger allowed
      if (nodeType === 'schedule' && nodes.some(n => n.type === 'schedule')) {
        toast.error("Only one Trigger is allowed per flow!");
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
      setNodes((nds) => nds.concat(newNode));
    },
    [project, setNodes, nodes],
  );

  // Load flow data if flowId is present
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!flowId) {
      setIsLoaded(true);
      return;
    }

    const fetchFlow = async () => {
      try {
        const res = await fetch(`http://localhost:8001/flows/${flowId}`);
        if (!res.ok) throw new Error("Failed to fetch flow");
        
        const data = await res.json();
        
        if (data.definition) {
          // Restore nodes and edges from definition
          const { nodes: savedNodes, edges: savedEdges, viewport } = data.definition;
          
          if (savedNodes) setNodes(savedNodes);
          if (savedEdges) setEdges(savedEdges);
          // We could also restore viewport if needed using useReactFlow().setViewport(viewport)
        }
      } catch (error) {
        console.error("Error loading flow:", error);
        toast.error("Failed to load flow data");
      } finally {
        setIsLoaded(true);
      }
    };

    fetchFlow();
  }, [flowId, setNodes, setEdges]);

  const validateFlow = (): boolean => {
    const triggerNodes = nodes.filter(n => n.type === 'schedule');
    const actionNodes = nodes.filter(n => n.type !== 'schedule');

    // 1. Check Trigger Count
    if (triggerNodes.length !== 1) {
      toast.error("Flow must have exactly one Trigger (Schedule).");
      return false;
    }

    // 2. Check Action Count
    if (actionNodes.length < 1) {
      toast.error("Flow must have at least one Action.");
      return false;
    }

    // 3. Check for Orphans (Reachability BFS)
    const startNodeId = triggerNodes[0].id;
    const visited = new Set<string>([startNodeId]);
    const queue = [startNodeId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      // Find all outgoing edges from current node
      const outgoingEdges = edges.filter(e => e.source === currentId);
      
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push(edge.target);
        }
      }
    }

    if (visited.size !== nodes.length) {
      const orphanCount = nodes.length - visited.size;
      toast.error(`Found ${orphanCount} orphaned node(s) not connected to the trigger.`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!params.slug) return;

    if (!validateFlow()) {
      return;
    }

    // TODO: Get actual Org ID from context/slug
    // For now, we'll assume we can find it or pass it in props. 
    // Since we don't have Org ID easily here without fetching, 
    // we might need to rely on the backend to infer it or pass it down.
    // For this MVP, let's assume a hardcoded or prop-passed Org ID isn't available easily 
    // without a bigger refactor, so we'll try to use a placeholder or context if available.
    // A better approach is to pass `orgId` as a prop to `FlowDesigner`.
    
    // TEMPORARY: We will use a placeholder UUID for Org ID if not present, 
    // but in a real app this comes from the auth context.
    const orgId = "00000000-0000-0000-0000-000000000000"; // Replace with actual logic

    const flowData = {
      org_id: orgId,
      slug: params.slug, // Pass slug to backend
      name: flowId ? `Flow ${flowId}` : "New Flow", // You might want a name input
      description: "Created via Flow Studio",
      definition: { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } },
      variables_schema: [],
    };

    try {
      const url = flowId 
        ? `http://localhost:8001/flows/${flowId}`
        : `http://localhost:8001/flows`;
      
      const method = flowId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData),
      });

      if (!response.ok) {
        throw new Error('Failed to save flow');
      }

      const result = await response.json();
      toast.success("Flow saved successfully!");
      
      if (!flowId && result.id) {
        // Redirect to the new flow ID if it was a create operation
        router.push(`/nodal/${params.slug}/dashboard/flow-studio/design/${result.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save flow. Is the backend running?");
    }
  };

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
          <Button size="sm" className="gap-2" onClick={handleSave}>
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
          defaultEdgeOptions={{ animated: true }}
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
