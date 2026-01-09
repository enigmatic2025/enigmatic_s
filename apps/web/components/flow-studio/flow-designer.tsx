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
import { ArrowLeft, Save, Play, Square, Trash, Wand2, Rocket, Terminal } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { flowService } from '@/services/flow-service';
import { DeleteFlowModal } from "@/components/flow-studio/modals/delete-flow-modal";
import { NodeConfigurationSheet } from "@/components/flow-studio/node-configuration-sheet";
import { ConsoleModal } from "@/components/flow-studio/modals/console-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NODE_TYPES } from './constants/node-registry';
import { useFlowState } from './hooks/use-flow-state';
import { useFlowOperations } from './hooks/use-flow-operations';
import { useFlowStore } from '@/lib/stores/flow-store';
import { useAutoLayout } from './hooks/use-auto-layout';

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

  const { onLayout } = useAutoLayout();

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
  
  const handlePublish = async () => {
      if (!flowId) return;
      try {
          toast.info("Publishing flow...");
          await flowService.publishFlow(flowId);
          toast.success("Flow published successfully! It is now live.");
      } catch (error) {
          console.error("Publish error:", error);
          toast.error("Failed to publish flow");
      }
  };

  // Sync with global store for Sidebar
  const { syncNodes, syncEdges, setExecutionTrace, clearExecutionTrace } = useFlowStore();
  
  useEffect(() => {
    syncNodes(nodes);
    syncEdges(edges);
  }, [nodes, edges, syncNodes, syncEdges]);

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

  // CONSTANT TOAST ID for Test Runs
  const TEST_TOAST_ID = "test-run-status";
  const { addLog } = useFlowStore();

  const handleTestRun = async () => {
    toast.loading("Starting action flow test...", { id: TEST_TOAST_ID });
    addLog({ message: "Starting action flow test...", type: "info" });
    
    try {
      clearExecutionTrace(); // Clear previous results
      
      const flowDefinition = {
        nodes: nodes.map(node => {
            let type = node.type;
            
            // Map frontend types to backend types
            if (node.type === 'action') {
                type = node.data?.subtype || 'http';
            } else if (node.type === 'variable') {
                type = 'set';
            } else if (node.type === 'manual-trigger') {
                // Backend treats manual triggers as just entry points, 
                // but if we need a specific type:
                type = 'trigger'; 
            }
            // Loop, Switch, Condition likely map 1:1 if casing matches (backend handles casing)
            
            return {
                ...node,
                type
            };
        }),
        edges,
        viewport: { x: 0, y: 0, zoom: 1 } 
      };
      
      console.log("Transformed Flow Definition:", flowDefinition); // Debug log to verify type transformation
      
      const result = await flowService.testFlow(flowDefinition, flowId);
      
      toast.success(`Action Flow started!`, { id: TEST_TOAST_ID });
      addLog({ message: `Action Flow started with Workflow ID: ${result.workflow_id}`, type: "success", details: result });
      console.log("Action Flow Started:", result);

      // Start Polling
      setIsPolling(true);
      setCurrentRun({ workflowId: result.workflow_id, runId: result.run_id });
      
    } catch (error: any) {
      console.error("Action Flow test error:", error);
      addLog({ message: "Failed to start action flow test", type: "error", details: error });
      
      if (error.message?.includes("409")) {
          toast.warning("Test run already in progress. Please stop the current run first.", { id: TEST_TOAST_ID });
      } else {
          toast.error("Failed to start action flow test", { id: TEST_TOAST_ID });
      }
    }
  };

  // POLLING EFFECT
  const [isPolling, setIsPolling] = useState(false);
  const [currentRun, setCurrentRun] = useState<{workflowId: string, runId: string} | null>(null);

  useEffect(() => {
      let intervalId: NodeJS.Timeout;

      if (isPolling && currentRun) {
          intervalId = setInterval(async () => {
              try {
                  const data = await flowService.getFlowResult(currentRun.workflowId, currentRun.runId);
                  
                  if (data && data.status === "COMPLETED") {
                      // DONE!
                      setIsPolling(false);
                      toast.success("Workflow Completed Successfully!", { id: TEST_TOAST_ID });
                      addLog({ message: "Workflow Completed Successfully", type: "success", details: data.output });
                      
                      const traceData: Record<string, any> = {};
                      const rawOutput = data.output || {};
                      
                      Object.entries(rawOutput).forEach(([nodeId, nodeOut]) => {
                          traceData[nodeId] = {
                              nodeId: nodeId,
                              status: 'success',
                              output: nodeOut,
                              timestamp: Date.now()
                          };
                      });
                      
                      setExecutionTrace(traceData);
                  } else if (data && (data.status === "FAILED" || data.status === "CANCELED")) {
                       setIsPolling(false);
                       if (data.status === "CANCELED") {
                           toast.info("Workflow Canceled", { id: TEST_TOAST_ID });
                           addLog({ message: "Workflow Canceled by user", type: "warning" });
                       } else {
                           const errorMsg = data.output?.error || "Workflow Failed";
                           toast.error(errorMsg, { id: TEST_TOAST_ID });
                           addLog({ message: `Workflow Failed: ${errorMsg}`, type: "error", details: data.output });
                       }
                  } else {
                      // Still running
                      // Optional: addLog({ message: "Workflow running...", type: "info" });
                  }
                  
              } catch (e) {
                  console.error("Polling error", e);
              }
          }, 2000); // Poll every 2 seconds
      }

      return () => clearInterval(intervalId);
  }, [isPolling, currentRun, setExecutionTrace, addLog]); // Added addLog dependency

  const handleStop = async () => {
    if (!currentRun) return;
    toast.loading("Stopping workflow...", { id: TEST_TOAST_ID });
    
    try {
      await flowService.cancelFlow(currentRun.workflowId, currentRun.runId);
      setIsPolling(false);
      toast.success("Workflow stopped.", { id: TEST_TOAST_ID });
      addLog({ message: "Stop signal sent successfully", type: "info" });
    } catch (error) {
      console.error("Stop error:", error);
      toast.error("Failed to stop workflow", { id: TEST_TOAST_ID });
      addLog({ message: "Failed to send stop signal", type: "error", details: error });
    }
  };

  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

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
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => onLayout('LR')}
                    >
                        <Wand2 className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Magic Organize</p>
                </TooltipContent>
            </Tooltip>

             <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 transition-colors ${isConsoleOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setIsConsoleOpen(true)}
                    >
                        <Terminal className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Open Console</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 transition-colors ${isPolling ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={isPolling ? handleStop : handleTestRun}
                >
                  {isPolling ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPolling ? "Stop Run" : "Test Run"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Draft</p>
              </TooltipContent>
            </Tooltip>

            {flowId && (
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={handlePublish}
                    >
                    <Rocket className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Publish to Production</p>
                </TooltipContent>
                </Tooltip>
            )}
          
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

// ...
      <NodeConfigurationSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        selectedNode={selectedNode}
        onUpdate={onUpdateNode}
        onTest={flowService.testAction}
        nodes={nodes}
        edges={edges}
      />
      
      <ConsoleModal 
        isOpen={isConsoleOpen} 
        onClose={() => setIsConsoleOpen(false)} 
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
