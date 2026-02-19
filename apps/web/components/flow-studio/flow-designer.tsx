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
import { TestWizardModal } from "@/components/flow-studio/modals/test-wizard-modal";
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
  // Test Wizard State
  const [isTestWizardOpen, setIsTestWizardOpen] = useState(false);
  const logs = useFlowStore((state) => state.logs);
  const setFlowId = useFlowStore((state) => state.setFlowId);
  const prevLogsLength = useRef(0);

  // Sync flowId to store
  useEffect(() => {
    setFlowId(flowId || null);
  }, [flowId, setFlowId]);

  // Play Click — always open wizard so user can see/modify test data
  const onPlayClick = () => {
      setIsTestWizardOpen(true);
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

  const PUBLISH_TOAST_ID = "publish-status";

  const handlePublishConfirm = async () => {
      if (!flowId) return;
      setIsPublishModalOpen(false);
      try {
          if (isDirty) {
             toast.loading(t("messages.savingBeforePublish"), { id: PUBLISH_TOAST_ID });
             await handleSave();
          }

          toast.loading(t("messages.publishing"), { id: PUBLISH_TOAST_ID });
          await flowService.publishFlow(flowId);
          toast.success(t("messages.publishSuccess"), { id: PUBLISH_TOAST_ID });
          setPublishStatus('published');
      } catch (error) {
          console.error("Publish error:", error);
          toast.error(t("messages.publishError"), { id: PUBLISH_TOAST_ID });
      }
  };
  
  const { onDragOver, onDrop, onUpdateNode: baseOnUpdateNode, handleDelete } = ops;

  const onUpdateNode = useCallback((nodeId: string, newData: any) => {
      baseOnUpdateNode(nodeId, newData);
      setIsDirty(true);
  }, [baseOnUpdateNode]);

  // Used by test wizard to update node mock data
  const handleUpdateNodeData = useCallback((nodeId: string, newData: any) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: newData } : n));
      setIsDirty(true);
  }, [setNodes]);

  // CONSTANT TOAST ID for Test Runs
  const TEST_TOAST_ID = "test-run-status";
  const { addLog, clearLogs } = useFlowStore();

  const handleTestRun = async (inputPayload: any = {}) => {
    // Start generic loading state (isPolling=true but currentRun=null implies "Starting")
    setIsPolling(true);
    testStartTimeRef.current = Date.now();
    clearLogs(); // Clear logs before starting
    addLog({ message: t("messages.startingFlow"), type: "info" });

    try {
      clearExecutionTrace(); // Clear previous results

      // Collect mock data from human-task and automation nodes for test mode
      const mockData: Record<string, any> = {};

      nodes.forEach(node => {
        if (node.type === 'human-task') {
          if (node.data?.mockResponse && Object.keys(node.data.mockResponse).length > 0) {
            mockData[node.id] = { type: 'human-task', response: node.data.mockResponse };
          }
        }
        if (node.type === 'automation') {
          if (node.data?.mockPayload) {
            try {
              const parsed = JSON.parse(node.data.mockPayload);
              mockData[node.id] = { type: 'automation', payload: parsed };
            } catch { /* skip invalid JSON */ }
          }
        }
      });

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
            } else if (node.type === 'manual-trigger' || node.type === 'schedule' || node.type === 'webhook') {
                // Backend treats all trigger types as entry points
                type = 'trigger';
            }
            // Loop, Switch, Condition likely map 1:1 if casing matches (backend handles casing)

            return {
                ...node,
                type,
                data: { ...node.data, type },
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
  const testStartTimeRef = useRef<number>(0);

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

                      // Debug: Log raw output keys to identify missing nodes
                      console.log('[Flow Debug] Raw output keys:', Object.keys(rawOutput));
                      console.log('[Flow Debug] Frontend node IDs:', nodes.map(n => `${n.id} (${n.type})`));
                       
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

                      const duration = testStartTimeRef.current ? Date.now() - testStartTimeRef.current : 0;
                      const durationStr = duration > 0
                          ? duration >= 1000
                              ? `${(duration / 1000).toFixed(1)}s`
                              : `${duration}ms`
                          : '';
                      addLog({ message: `Workflow Completed Successfully${durationStr ? ` in ${durationStr}` : ''}`, type: "success" });

                      sortedNodeIds.forEach(nodeId => {
                          const result = traceData[nodeId];
                          if (!result) return;

                          const node = nodesMap.get(nodeId);
                          const nodeType = node?.type || 'unknown';

                          // Skip trigger nodes and synthetic backend entries
                          if (
                              nodeType === 'api-trigger' ||
                              nodeType === 'manual-trigger' ||
                              nodeType === 'schedule' ||
                              nodeType === 'webhook' ||
                              nodeType === 'trigger' ||
                              nodeId === 'trigger' ||
                              !node
                          ) {
                              return;
                          }

                          const nodeName = node.data?.label || node.data?.title || node.data?.eventName || nodeType;
                          const output = result.output;
                          let logType: 'info' | 'success' | 'error' | 'warning' = 'info';
                          let message = `Step '${nodeName}' executed`;
                          // Strip the synthetic 'output' wrapper from default details
                          let details: any = output;
                          if (output && typeof output === 'object' && 'output' in output) {
                              const { output: _nested, ...rest } = output;
                              details = Object.keys(rest).length > 0 ? rest : null;
                          }

                          // ── Per-node-type log enrichment ──

                          if (nodeType === 'action' || nodeType === 'http') {
                              const statusCode = output?.status;
                              const method = (node.data?.method || 'GET').toUpperCase();
                              const url = node.data?.url || '';
                              const urlShort = url.length > 60 ? url.slice(0, 57) + '...' : url;

                              if (typeof statusCode === 'number') {
                                  if (statusCode >= 400) {
                                      logType = 'error';
                                      message = `Step '${nodeName}' — ${method} ${urlShort} → ${statusCode}`;
                                  } else if (statusCode >= 300) {
                                      logType = 'warning';
                                      message = `Step '${nodeName}' — ${method} ${urlShort} → ${statusCode}`;
                                  } else {
                                      logType = 'success';
                                      message = `Step '${nodeName}' — ${method} ${urlShort} → ${statusCode}`;
                                  }
                              }
                              // Only show data payload, not raw headers
                              if (output?.data !== undefined) {
                                  details = output.data;
                              }

                          } else if (nodeType === 'condition') {
                              const condResult = output?.result;
                              const evalLeft = output?.evaluated_left;
                              const evalRight = output?.evaluated_right;
                              const op = output?.operator || '==';
                              message = `Step '${nodeName}' evaluated → ${condResult ? 'TRUE' : 'FALSE'}`;
                              logType = condResult ? 'success' : 'info';
                              // Show the evaluated comparison for debugging
                              if (evalLeft !== undefined && evalRight !== undefined) {
                                  details = { condition: `${evalLeft} ${op} ${evalRight}`, result: condResult };
                              } else {
                                  details = null;
                              }

                          } else if (nodeType === 'variable' || nodeType === 'set') {
                              const keys = output ? Object.keys(output).filter(k => k !== '_debug_message' && k !== 'output') : [];
                              message = `Step '${nodeName}' set ${keys.length} variable${keys.length !== 1 ? 's' : ''}: ${keys.join(', ')}`;
                              logType = 'info';

                          } else if (nodeType === 'filter') {
                              const count = output?.count;
                              message = `Step '${nodeName}' filtered → ${count ?? '?'} item${count !== 1 ? 's' : ''}`;

                          } else if (nodeType === 'map') {
                              const count = output?.count;
                              if (count !== undefined) {
                                  message = `Step '${nodeName}' mapped ${count} item${count !== 1 ? 's' : ''}`;
                              }

                          } else if (nodeType === 'loop') {
                              message = `Step '${nodeName}' loop completed`;

                          } else if (nodeType === 'switch') {
                              const selected = output?.selected_case;
                              const switchValue = output?.value;
                              message = `Step '${nodeName}' matched case '${selected || 'default'}'`;
                              // Show the evaluated value for debugging
                              details = switchValue !== undefined ? { evaluated: switchValue, matched: selected || 'default' } : null;

                          } else if (nodeType === 'human-task') {
                              logType = 'success';
                              message = `Step '${nodeName}' completed`;

                          } else if (nodeType === 'automation') {
                              logType = 'success';
                              message = `Step '${nodeName}' received event`;
                              // Strip internal fields from display
                              if (output) {
                                  const { webhook_url, status, message: _msg, output: _nested, ...payload } = output;
                                  details = Object.keys(payload).length > 0 ? payload : null;
                              }

                          } else if (nodeType === 'email') {
                              logType = 'success';
                              const to = output?.to || '';
                              message = `Step '${nodeName}' sent${to ? ` to ${to}` : ''}`;
                              details = null;

                          } else if (nodeType === 'parse') {
                              if (output?.error) {
                                  logType = 'error';
                                  message = `Step '${nodeName}' parse failed: ${output.error}`;
                              } else {
                                  message = `Step '${nodeName}' parsed successfully`;
                              }
                          } else if (nodeType === 'goto') {
                              if (output?._test_stopped_at_goto) {
                                  const targetNode = nodesMap.get(output._goto_target);
                                  const targetName = targetNode?.data?.label || targetNode?.data?.title || output._goto_target || 'previous step';
                                  logType = 'warning';
                                  message = `Step '${nodeName}' — Test stopped here. In production this would retry back to '${targetName}'.`;
                                  details = null;
                              } else {
                                  logType = 'info';
                                  message = `Step '${nodeName}' — Retry/Revisit triggered`;
                              }
                          }

                          addLog({ message, type: logType, details, nodeType, nodeId });
                      });

                      setExecutionTrace(traceData);
                  } else if (data && (data.status === "FAILED" || data.status === "CANCELED")) {
                       setIsPolling(false);
                       if (data.status === "CANCELED") {
                           toast.info(t("messages.workflowCanceled"), { id: TEST_TOAST_ID });
                           addLog({ message: t("messages.workflowCanceledByUser"), type: "warning" });
                       } else {
                           const rawError = data.output?.error || t("messages.workflowFailed");
                           toast.error("Workflow execution failed", { id: TEST_TOAST_ID });

                           // Try to extract the failing node ID/name from the error string
                           // Backend format: "node <nodeId> failed: <reason>"
                           const nodeMatch = rawError.match?.(/node\s+(\S+)\s+failed:\s*(.*)/i);
                           const nodesMap = new Map(nodes.map(n => [n.id, n]));

                           if (nodeMatch) {
                               const failedNodeId = nodeMatch[1];
                               const reason = nodeMatch[2] || 'Unknown error';
                               const failedNode = nodesMap.get(failedNodeId);
                               const failedName = failedNode?.data?.label || failedNode?.data?.title || failedNodeId;
                               const failedType = failedNode?.type || 'unknown';

                               addLog({
                                   message: `Workflow Failed`,
                                   type: "error",
                               });
                               addLog({
                                   message: `Step '${failedName}' failed: ${reason}`,
                                   type: "error",
                                   details: data.output,
                                   nodeType: failedType,
                                   nodeId: failedNodeId,
                               });
                           } else {
                               addLog({
                                   message: `Workflow Failed: ${rawError}`,
                                   type: "error",
                                   details: data.output,
                               });
                           }
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

      <TestWizardModal
        isOpen={isTestWizardOpen}
        onClose={() => setIsTestWizardOpen(false)}
        onRun={(payload) => handleTestRun(payload)}
        nodes={nodes}
        edges={edges}
        onUpdateNodeData={handleUpdateNodeData}
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
