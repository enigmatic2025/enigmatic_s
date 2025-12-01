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
import { ArrowLeft, Save, Play, Plus, Trash } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { ScheduleNode } from './nodes/schedule-node';
import { ActionNode } from './nodes/action-node';
import { validateFlow } from '@/lib/flow-validation';
import { flowService } from '@/services/flow-service';
import { DeleteFlowModal } from "@/components/flow-studio/modals/delete-flow-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [flowName, setFlowName] = useState("New Flow");
  const [isEditingName, setIsEditingName] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      // Restriction: Single Input Rule
      // Check if the target node already has an incoming connection
      const hasInput = edges.some(edge => edge.target === params.target);
      if (hasInput) {
        toast.error("This node already has an input connection. Only one input is allowed.");
        return;
      }

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, edges],
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
        const data = await flowService.getFlow(flowId);
        
        if (data.definition) {
          // Restore nodes and edges from definition
          const { nodes: savedNodes, edges: savedEdges, viewport } = data.definition;
          
          if (savedNodes) setNodes(savedNodes);
          if (savedEdges) setEdges(savedEdges);
          if (data.name) setFlowName(data.name);
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



  const handleDelete = async () => {
    if (!flowId) return;
    try {
      await flowService.deleteFlow(flowId);
      toast.success("Flow deleted successfully");
      router.push(`/nodal/${params.slug}/dashboard/flow-studio`);
    } catch (error) {
      toast.error("Failed to delete flow");
    }
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (flowName.trim() === "") {
      setFlowName("New Flow");
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    }
  };

  const handleSave = async () => {
    if (!params.slug) return;

    if (!validateFlow(nodes, edges)) {
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
      slug: params.slug as string, // Pass slug to backend
      name: flowName, // Use current name state
      description: "Created via Flow Studio",
      definition: { nodes, edges, viewport: { x: 0, y: 0, zoom: 1 } },
      variables_schema: [],
    };

    try {
      const result = await flowService.saveFlow(flowId, flowData);
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
            {isEditingName ? (
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="text-sm font-semibold bg-transparent border-b border-primary outline-none px-1 w-[300px]"
              />
            ) : (
              <h2 
                className="text-sm font-semibold cursor-text hover:underline decoration-dashed underline-offset-4 w-[300px] truncate"
                onDoubleClick={() => setIsEditingName(true)}
                title="Double-click to rename"
              >
                {flowName}
              </h2>
            )}
            <span className="text-xs text-muted-foreground">
              {flowId ? "Last saved 2 mins ago" : "Unsaved changes"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Test Run</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Flow</p>
              </TooltipContent>
            </Tooltip>
          
            {flowId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                    onClick={() => setIsDeleteModalOpen(true)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Flow</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
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

      <DeleteFlowModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        flowName={flowName}
      />
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
