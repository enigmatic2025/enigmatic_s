"use client";

import { Badge } from "@/components/ui/badge";
import { useCallback, useRef, useState, useEffect } from 'react';
import useSWR from 'swr';

import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Play, Square, Trash, Wand2, Rocket, Terminal, Loader2, Eraser } from "lucide-react";
import { useRouter } from "@/navigation";
import { useParams } from "next/navigation";
import { flowService } from '@/services/flow-service';
import { DeleteFlowModal } from "@/components/flow-studio/modals/delete-flow-modal";
import { NodeConfigurationSheet } from "@/components/flow-studio/node-configuration-sheet";
import { ConsoleModal } from "@/components/flow-studio/modals/console-modal";
import { TestPayloadModal } from "@/components/flow-studio/modals/test-payload-modal";
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
  const t = useTranslations("FlowDesigner");
  
  // State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [flowName, setFlowName] = useState("Untitled");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track unsaved changes
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published' | 'changed'>('draft');

  // Console/Logs State
  const [unreadLogs, setUnreadLogs] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  // Payload Modal State
  const [isTestPayloadModalOpen, setIsTestPayloadModalOpen] = useState(false);
  const [triggerSchema, setTriggerSchema] = useState<any[]>([]);
  const logs = useFlowStore((state) => state.logs);
  const prevLogsLength = useRef(0);

  // Intercept Play Click
  const onPlayClick = () => {
      // Check if we have an API Trigger with Schema
      const triggerNode = nodes.find(n => n.type === 'api-trigger');
      if (triggerNode && triggerNode.data?.schema && triggerNode.data.schema.length > 0) {
          setTriggerSchema(triggerNode.data.schema);
          setIsTestPayloadModalOpen(true);
      } else {
          // No schema or no trigger, run directly
          handleTestRun({});
      }
  };

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

  // Wrap node/edge changes to set dirty
  const onNodesChangeWrapped = useCallback((changes: any) => {
      onNodesChange(changes);
      if (changes.length > 0) setIsDirty(true);
  }, [onNodesChange]);

  const onEdgesChangeWrapped = useCallback((changes: any) => {
      onEdgesChange(changes);
      if (changes.length > 0) setIsDirty(true);
  }, [onEdgesChange]);

  const onConnectWrapped = useCallback((params: any) => {
      onConnect(params);
      setIsDirty(true);
  }, [onConnect]);

  const { onLayout } = useAutoLayout();



  // Load Flow Data with SWR
  const { data: flowData, error: flowError, isLoading: isFlowLoading } = useSWR(
    flowId ? `/flows/${flowId}` : null,
    () => flowService.getFlow(flowId!),
    {
      revalidateOnFocus: false, // Don't overwrite unsaved work on focus
      revalidateOnReconnect: false,
      onSuccess: (data) => {
         // This is still supported in many SWR versions, but if not, 
         // we can move this logic to a useEffect. 
         // To be safe and compliant with latest SWR patterns that discourage side-effects in render:
      }
    }
  );

  // Sync Data to State Effect
  useEffect(() => {
    if (flowData) {
        const loadedDefinition = flowData.draft_definition || flowData.definition;
        
        // Determine Status
        if (!flowData.definition) {
            setPublishStatus('draft');
        } else {
            const draftStr = JSON.stringify(flowData.draft_definition);
            const defStr = JSON.stringify(flowData.definition);
            if (!flowData.draft_definition || draftStr === defStr) {
                setPublishStatus('published');
            } else {
                setPublishStatus('changed');
            }
        }

        if (loadedDefinition) {
          const { nodes: savedNodes, edges: savedEdges } = loadedDefinition;
          if (savedNodes) setNodes(savedNodes);
          if (savedEdges) setEdges(savedEdges);
        }
        if (flowData.name) setFlowName(flowData.name);

        // Load Global Variables
        if (flowData.variables_schema && Array.isArray(flowData.variables_schema)) {
            const { setVariable } = useFlowStore.getState();
            flowData.variables_schema.forEach((v: any) => {
                if (v.key) {
                   setVariable(v.key, v.value);
                }
            });
        }
        
        setIsLoaded(true);
    } else if (!flowId) {
        // New Flow
        setIsLoaded(true);
    }
  }, [flowData, flowId, setNodes, setEdges, setFlowName]);

  // Error Handling
  useEffect(() => {
      if (flowError) {
          console.error("Error loading flow:", flowError);
          toast.error("Failed to load flow data");
          setIsLoaded(true);
      }
  }, [flowError]);

  // Cleanup on Mount/Unmount
  useEffect(() => {
    const { clearLogs, clearExecutionTrace, clearVariables } = useFlowStore.getState();
    clearLogs();
    clearExecutionTrace();
    clearVariables();

    return () => {
        clearLogs();
        clearExecutionTrace();
        clearVariables();
    };
  }, []);

  
  const handlePublish = async () => {
      if (!flowId) return;
      try {
          toast.info("Publishing flow...");
          await flowService.publishFlow(flowId);
          toast.success("Flow published successfully! It is now live.");
          setPublishStatus('published');
      } catch (error) {
          console.error("Publish error:", error);
          toast.error("Failed to publish flow");
      }
  };

  // Sync with global store for Sidebar
  const { syncNodes, syncEdges, setExecutionTrace, clearExecutionTrace, selectedNodeId, setSelectedNodeId } = useFlowStore();
  
  useEffect(() => {
    syncNodes(nodes);
    syncEdges(edges);
  }, [nodes, edges, syncNodes, syncEdges]);

  // Handle external selection (e.g. from Sidebar)
  useEffect(() => {
      if (selectedNodeId) {
          const node = nodes.find(n => n.id === selectedNodeId);
          if (node) {
              setSelectedNode(node);
              setIsSheetOpen(true);
          }
      }
  }, [selectedNodeId, nodes]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    // We update the store, which triggers the effect above to open the sheet
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (flowName.trim() === "") {
      setFlowName(t("toolbar.untitled"));
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    }
  };

  // Wrapped Save Handler to update status
  const { handleSave: baseHandleSave, ...ops } = useFlowOperations({
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

  const handleSave = async () => {
      await baseHandleSave();
      setIsDirty(false);
      if (publishStatus === 'published') {
          setPublishStatus('changed');
      }
  };
  
  const { onDragOver, onDrop, onUpdateNode: baseOnUpdateNode, handleDelete } = ops;

  const onUpdateNode = useCallback((nodeId: string, newData: any) => {
      baseOnUpdateNode(nodeId, newData);
      setIsDirty(true);
  }, [baseOnUpdateNode]);

  // CONSTANT TOAST ID for Test Runs
  const TEST_TOAST_ID = "test-run-status";
  const { addLog, clearLogs } = useFlowStore();

  const handleTestRun = async (inputPayload: any = {}) => {
    // Start generic loading state (isPolling=true but currentRun=null implies "Starting")
    setIsPolling(true);
    clearLogs(); // Clear logs before starting
    addLog({ message: t("messages.startingFlow"), type: "info" });
    
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
      
      // Log removed("Transformed Flow Definition:", flowDefinition); // Debug log to verify type transformation
      
      const result = await flowService.testFlow(flowDefinition, flowId, inputPayload);
      
      // Removed success toast as requested
      addLog({ message: `Flow execution started with Workflow ID: ${result.workflow_id}`, type: "success", details: result });
      // Log removed("Flow Execution Started:", result);

      // Continue polling with active run
      setCurrentRun({ workflowId: result.workflow_id, runId: result.run_id });
      
    } catch (error: any) {
      setIsPolling(false); // Stop loading on error
      console.error("Flow execution error:", error);
      addLog({ message: "Failed to start flow execution", type: "error", details: error });
      
      if (error.message?.includes("409")) {
          toast.warning("Execution already in progress. Please stop the current run first.", { id: TEST_TOAST_ID });
      } else {
          toast.error("Failed to start flow execution", { id: TEST_TOAST_ID });
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
                      
                      const rawOutput = data.output || {};
                      const traceData: Record<string, any> = {};
                       
                      // 1. Process Trace Data first to get timestamps/ordering if possible (or just map keys)
                      Object.entries(rawOutput).forEach(([nodeId, nodeOut]) => {
                          traceData[nodeId] = {
                              nodeId: nodeId,
                              status: 'success', // Backend doesn't give granular status per node in output map yet, assume success if in output
                              output: nodeOut,
                              timestamp: Date.now()
                          };
                      });

                      // 2. Add granular logs
                      // Try to sort by some logical order if possible? 
                      // For now, we iterate. Ideally we'd match with 'nodes' array order or top-sort, 
                      // but keys iteration is okay for now.
                      
                      // We can use the 'nodes' array to look up names
                      const nodesMap = new Map(nodes.map(n => [n.id, n]));

                      // Sort trace data by execution order (BFS from Trigger)
                      const getSortedOrder = () => {
                          const startNode = nodes.find(n => n.type === 'manual-trigger' || n.type === 'schedule' || n.type === 'webhook' || n.type === 'api-trigger');
                          if (!startNode) return Object.keys(traceData);

                          const sorted: string[] = [];
                          const queue = [startNode.id];
                          const visited = new Set<string>();

                          while (queue.length > 0) {
                              const id = queue.shift()!;
                              if (visited.has(id)) continue;
                              visited.add(id);
                              sorted.push(id);

                              // Find connected target nodes
                              const children = edges
                                  .filter(e => e.source === id)
                                  .map(e => e.target);
                              
                              queue.push(...children);
                          }
                          // Append any untraversed nodes that are in traceData
                          Object.keys(traceData).forEach(id => {
                              if (!visited.has(id)) sorted.push(id);
                          });
                          
                          return sorted;
                      };

                      const sortedNodeIds = getSortedOrder();

                      addLog({ message: "Workflow Completed Successfully", type: "success" });

                      sortedNodeIds.forEach(nodeId => {
                          const result = traceData[nodeId];
                          if (!result) return; // Skip if node has no trace data

                          const node = nodesMap.get(nodeId);
                          const nodeName = node?.data?.label || node?.type || nodeId;
                          
                          addLog({ 
                              message: `Step '${nodeName}' executed`, 
                              type: "info", 
                              details: result.output 
                          });
                      });
                      
                      setExecutionTrace(traceData);
                  } else if (data && (data.status === "FAILED" || data.status === "CANCELED")) {
                       setIsPolling(false);
                       if (data.status === "CANCELED") {
                           toast.info(t("messages.workflowCanceled"), { id: TEST_TOAST_ID });
                           addLog({ message: t("messages.workflowCanceledByUser"), type: "warning" });
                       } else {
                           const errorMsg = data.output?.error || t("messages.workflowFailed");
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
  }, [isPolling, currentRun, setExecutionTrace, addLog, nodes]); // Added 'nodes' dependency

  // Unread Logs Logic


  // Effect to watch logs and set unread if console is closed
  useEffect(() => {
    if (logs.length > prevLogsLength.current) {
        if (!isConsoleOpen) {
            setUnreadLogs(true);
        }
    }
    prevLogsLength.current = logs.length;
  }, [logs.length, isConsoleOpen]);

  // Clear unread when console opens
  useEffect(() => {
    if (isConsoleOpen) {
      setUnreadLogs(false);
    }
  }, [isConsoleOpen]);

  const handleStop = async () => {
    if (!currentRun) return;
    toast.loading(t("messages.stoppingWorkflow"), { id: TEST_TOAST_ID });
    
    try {
      await flowService.cancelFlow(currentRun.workflowId, currentRun.runId);
      setIsPolling(false);
      toast.success(t("messages.workflowStopped"), { id: TEST_TOAST_ID });
      addLog({ message: t("messages.stopSignalSent"), type: "info" });
    } catch (error) {
      console.error("Stop error:", error);
      toast.error(t("messages.failedToStop"), { id: TEST_TOAST_ID });
      addLog({ message: t("messages.failedToSendStop"), type: "error", details: error });
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
                title={t("toolbar.renamePlaceholder")}
              >
                {flowName}
              </h2>
            )}
            <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                {flowId ? t("toolbar.lastSaved") : t("toolbar.unsavedChanges")}
                </span>
                
                {publishStatus === 'published' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 gap-1">
                        <span className="w-1 h-1 rounded-full bg-green-500 inline-block" />
                        {t("status.published")}
                    </Badge>
                )}
                {publishStatus === 'changed' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20 gap-1">
                         <span className="w-1 h-1 rounded-full bg-yellow-500 inline-block" />
                         {t("status.unpublishedChanges")}
                    </Badge>
                )}
                {publishStatus === 'draft' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-slate-500/10 text-slate-600 border-slate-500/20 hover:bg-slate-500/20">
                        {t("status.draft")}
                    </Badge>
                )}
            </div>
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
                    <p>{t("tooltips.magicOrganize")}</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        onClick={() => {
                            clearExecutionTrace();
                            clearLogs();
                            // Optional: toast.success("Test results cleared"); 
                            // User asked for a way to clear, success toast might be redundant but helpful confirmation.
                        }}
                    >
                        <Eraser className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t("tooltips.clearTestResults")}</p>
                </TooltipContent>
            </Tooltip>

             <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 transition-all duration-300 relative ${
                          isConsoleOpen 
                            ? 'text-primary bg-primary/10' 
                            : unreadLogs 
                              ? 'text-green-500 bg-green-500/10 animate-pulse' 
                              : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setIsConsoleOpen(true)}
                    >
                        <Terminal className="h-4 w-4" />
                        {unreadLogs && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{unreadLogs ? t("tooltips.newLogsAvailable") : t("tooltips.openConsole")}</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`h-8 w-8 transition-colors ${isPolling ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={isPolling ? handleStop : onPlayClick}
                  disabled={isPolling && !currentRun}
                >
                  {isPolling ? (
                    currentRun ? <Square className="h-4 w-4 fill-current" /> : <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPolling ? t("tooltips.stopExecution") : t("tooltips.runFlow")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("tooltips.saveDraft")}</p>
              </TooltipContent>
            </Tooltip>

            {flowId && (
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handlePublish}
                    disabled={isDirty} 
                    >
                    <Rocket className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t("tooltips.publishToProduction")}</p>
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
                  <p>{t("tooltips.deleteFlow")}</p>
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
          onNodesChange={onNodesChangeWrapped}
          onEdgesChange={onEdgesChangeWrapped}
          onConnect={onConnectWrapped}
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
      
      <NodeConfigurationSheet
        isOpen={isSheetOpen}
        onClose={() => {
            setIsSheetOpen(false);
            setSelectedNodeId(null); 
        }}
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

      <TestPayloadModal 
        isOpen={isTestPayloadModalOpen}
        onClose={() => setIsTestPayloadModalOpen(false)}
        onRun={(payload) => handleTestRun(payload)}
        schema={triggerSchema}
        flowId={flowId}
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
