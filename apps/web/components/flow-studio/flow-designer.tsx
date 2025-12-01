"use client";

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Trash } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { flowService } from '@/services/flow-service';
import { DeleteFlowModal } from "@/components/flow-studio/modals/delete-flow-modal";
import { NodeConfigurationModal } from "@/components/flow-studio/node-configuration-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NODE_TYPES } from './constants/node-registry';
import { useFlowState } from './hooks/use-flow-state';
import { useFlowOperations } from './hooks/use-flow-operations';

interface FlowDesignerProps {
  flowId?: string;
}

function FlowDesignerContent({ flowId }: FlowDesignerProps) {
  const router = useRouter();
  const params = useParams();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [flowName, setFlowName] = useState("Untitled");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Custom Hooks
  const {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    onConnect,
  } = useFlowState();

  const {
    onDragOver,
    onDrop,
    onUpdateNode,
    handleSave,
    handleDelete,
  } = useFlowOperations({
    nodes,
    setNodes,
    edges,
    setEdges,
    flowId,
    flowName,
    setFlowName,
    slug: params.slug as string,
    router,
    reactFlowWrapper,
    setSelectedNode,
  });

  // Load Flow Data
  useEffect(() => {
    if (!flowId) {
      setIsLoaded(true);
      return;
    }

    const fetchFlow = async () => {
      try {
        const data = await flowService.getFlow(flowId);
        
        if (data.definition) {
          const { nodes: savedNodes, edges: savedEdges } = data.definition;
          if (savedNodes) setNodes(savedNodes);
          if (savedEdges) setEdges(savedEdges);
          if (data.name) setFlowName(data.name);
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

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
    setIsSheetOpen(true);
  }, []);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (flowName.trim() === "") {
      setFlowName("Untitled");
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
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
          onNodeClick={onNodeClick}
          nodeTypes={NODE_TYPES}
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

      <NodeConfigurationModal
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        selectedNode={selectedNode}
        onUpdate={onUpdateNode}
        onTest={flowService.testAction}
        nodes={nodes}
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
