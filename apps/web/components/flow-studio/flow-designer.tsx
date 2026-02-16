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
import { PublishConfirmModal } from "@/components/flow-studio/modals/publish-confirm-modal";
import { NodeConfigurationSheet } from "@/components/flow-studio/node-configuration-sheet";
import { ConsoleModal } from "@/components/flow-studio/modals/console-modal";
import { TestPayloadModal } from "@/components/flow-studio/modals/test-payload-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FlowToolbar } from './designer/flow-toolbar';
import { FlowCanvas } from './designer/flow-canvas';

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
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [flowName, setFlowName] = useState("Untitled");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Track unsaved changes
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published' | 'changed'>('draft');

  // Console/Logs State
  const [unreadLogs, setUnreadLogs] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  // Payload Modal State
  const [isTestPayloadModalOpen, setIsTestPayloadModalOpen] = useState(false);
  const [triggerSchema, setTriggerSchema] = useState<any[]>([]);
  const logs = useFlowStore((state) => state.logs);
  const setFlowId = useFlowStore((state) => state.setFlowId);
  const prevLogsLength = useRef(0);

  // Sync flowId to store
  useEffect(() => {
    setFlowId(flowId || null);
  }, [flowId, setFlowId]);

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

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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
      setIsSaving(true);
      try {
          await baseHandleSave();
          setIsDirty(false);
          setLastSavedAt(new Date());
          if (publishStatus === 'published') {
              setPublishStatus('changed');
          }
      } finally {
          setIsSaving(false);
      }
  };

  // Ref so Ctrl+S always calls the latest save
  const handleSaveRef = useRef<() => void>(handleSave);
  handleSaveRef.current = handleSave;

  const handlePublishClick = () => {
      if (!flowId) return;
      setIsPublishModalOpen(true);
  };

  const handlePublishConfirm = async () => {
      if (!flowId) return;
      setIsPublishModalOpen(false);
      try {
          if (isDirty) {
             toast.info(t("toasts.savingBeforePublish"));
             await handleSave();
          }

          toast.info(t("toasts.publishing"));
          await flowService.publishFlow(flowId);
          toast.success(t("toasts.publishSuccess"));
          setPublishStatus('published');
      } catch (error) {
          console.error("Publish error:", error);
          toast.error(t("toasts.publishError"));
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

      // Collect mock data from human-task and automation nodes for test mode
      const mockData: Record<string, any> = {};
      const missingMockNodes: string[] = [];

      nodes.forEach(node => {
        if (node.type === 'human-task') {
          if (node.data?.mockResponse && Object.keys(node.data.mockResponse).length > 0) {
            mockData[node.id] = { type: 'human-task', response: node.data.mockResponse };
          } else {
            missingMockNodes.push(node.data?.label || node.data?.title || `Human Task (${node.id.slice(0, 6)})`);
          }
        }
        if (node.type === 'automation') {
          if (node.data?.mockPayload) {
            try {
              const parsed = JSON.parse(node.data.mockPayload);
              mockData[node.id] = { type: 'automation', payload: parsed };
            } catch {
              missingMockNodes.push(node.data?.label || node.data?.eventName || `Wait for Event (${node.id.slice(0, 6)})`);
            }
          } else {
            missingMockNodes.push(node.data?.label || node.data?.eventName || `Wait for Event (${node.id.slice(0, 6)})`);
          }
        }
      });

      // Block test execution if blocking nodes are missing mock data
      if (missingMockNodes.length > 0) {
        setIsPolling(false);
        toast.error(`Configure mock data for blocking steps before testing: ${missingMockNodes.join(', ')}`, { id: TEST_TOAST_ID, duration: 6000 });
        addLog({ message: `Missing mock data for: ${missingMockNodes.join(', ')}`, type: "error" });
        return;
      }

      const hasMocks = Object.keys(mockData).length > 0;
      if (hasMocks) {
        addLog({ message: `Using mock data for ${Object.keys(mockData).length} blocking step(s)`, type: "info" });
      }

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

      const testInput = {
        ...inputPayload,
        ...(hasMocks ? { __mock_data: mockData } : {}),
      };

      const result = await flowService.testFlow(flowDefinition, flowId, testInput);
      
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
      <FlowToolbar
        flowId={flowId}
        flowName={flowName}
        setFlowName={setFlowName}
        publishStatus={publishStatus}
        isConsoleOpen={isConsoleOpen}
        setIsConsoleOpen={setIsConsoleOpen}
        unreadLogs={unreadLogs}
        isPolling={isPolling}
        currentRun={currentRun}
        onPlayClick={onPlayClick}
        handleStop={handleStop}
        handleSave={handleSave}
        handlePublish={handlePublishClick}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        onLayout={onLayout}
        onClearTestResults={() => {
            clearExecutionTrace();
            clearLogs();
        }}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
      />

      <FlowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeWrapped}
        onEdgesChange={onEdgesChangeWrapped}
        onConnect={onConnectWrapped}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onNodeClick={onNodeClick}
        wrapperRef={reactFlowWrapper}
      />

      <DeleteFlowModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        flowName={flowName}
      />

      <PublishConfirmModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublishConfirm}
        flowName={flowName}
        hasUnsavedChanges={isDirty}
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
