"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CONFIG_COMPONENTS, NODE_METADATA } from "./constants/node-registry";
import { NodeExecutionConsole } from "./node-execution-console";
import { useFlowStore } from "@/lib/stores/flow-store";
import { validateVariableReferences } from "./hooks/use-variable-validation";

interface NodeConfigurationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: any;
  onUpdate: (nodeId: string, newData: any) => void;
  onTest: (nodeData: any) => Promise<any>;
  nodes: any[];
  edges: any[];
}

export function NodeConfigurationSheet({
  isOpen,
  onClose,
  selectedNode,
  onUpdate,
  onTest,
  nodes,
  edges,
}: NodeConfigurationSheetProps) {
  const [formData, setFormData] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [prevNodeId, setPrevNodeId] = useState<string | null>(null);
  const t = useTranslations("ConfigDrawer");
  const tNodes = useTranslations("FlowNodes");

  const executionTrace = useFlowStore((state) => state.executionTrace);

  // Reset form when node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
      
      // Only reset UI state if we switched to a different node
      if (selectedNode.id !== prevNodeId) {
          setPrevNodeId(selectedNode.id);
          
          // Check for Global Execution Trace first (from Run Flow)
          const trace = executionTrace[selectedNode.id];
          if (trace) {
              setTestResult({ 
                  Output: trace.output, 
                  Input: trace.input,
                  Status: trace.status,
                  Duration: trace.duration 
              });
              setShowOutput(true);
          } 
          // Fallback to local node storage (from "Test Step")
          else if (selectedNode.data?.lastRunResult) {
              setTestResult({ Output: selectedNode.data.lastRunResult });
              setShowOutput(true); 
          } else {
              setTestResult(null);
              setShowOutput(false);
          }
      }
    }
  }, [selectedNode, prevNodeId, executionTrace]);

  const handleSave = () => {
    if (selectedNode) {
      const label = formData.label?.trim();
      
      if (!label) {
        toast.error(t("messages.titleEmpty"));
        return;
      }

      // Check for duplicates
      const isDuplicate = nodes.some(n => 
        n.id !== selectedNode.id && 
        n.data.label?.toLowerCase() === label.toLowerCase()
      );

      if (isDuplicate) {
        toast.error(t("messages.duplicateTitle"));
        return;
      }

      // --- Standardized Validation Check ---
      
      // Recursive helper to find strings to validate in formData
      const findStrings = (obj: any): string[] => {
          if (!obj) return [];
          if (typeof obj === 'string') return [obj];
          if (Array.isArray(obj)) return obj.flatMap(findStrings);
          if (typeof obj === 'object') return Object.values(obj).flatMap(findStrings);
          return [];
      };

      const allStrings = findStrings(formData);
      const validationErrors: string[] = [];

      allStrings.forEach(str => {
          const res = validateVariableReferences(str, selectedNode.id, nodes, edges);
          if (!res.isValid) {
              validationErrors.push(...res.errors);
          }
      });

      if (validationErrors.length > 0) {
          const uniqueErrors = Array.from(new Set(validationErrors));
          // Just show the first few to avoid screen clutter
          toast.error(`${t("messages.validationFailed")}: ${uniqueErrors[0]}`); 
          return;
      }

      // -----------------------------

      onUpdate(selectedNode.id, formData);
      toast.success(t("messages.configSaved"));
      // For Sheet, we often auto-save or save without closing, but let's stick to closing on Explicit Save
      // Actually, user requested "non-blocking", implied maybe stay open? 
      // But standard Sheet "Save & Close" is also common. Let's keep existing behavior for now.
      onClose(); 
    }
  };
  
  // Auto-save logic (optional enhancement for sheets, but let's stick to manual save first for safety)
  // const handleAutoSave = () => { ... }

  const handleRunStep = async () => {
    setIsExecuting(true);
    setShowOutput(true); // Auto-expand output area
    try {
      // 1. Auto-save current config to state/node before running
      const dataToTest = {
        ...selectedNode,
        data: {
          ...formData, // Use current form state
        }
      };
      
      const result = await onTest(dataToTest);
      
      // 2. Persist the result to the node (Schema by Example)
      const resultData = result.Output || result;
      const updatedData = {
        ...formData,
        lastRunResult: resultData
      };
      
      setFormData(updatedData);
      onUpdate(selectedNode.id, updatedData);
      
      setTestResult(result);
      toast.success(t("messages.stepExecutedSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("messages.stepExecutedFailed"));
      setTestResult({ Error: t("messages.failedToExecute") });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!selectedNode) return null;

  const isTrigger = selectedNode.type === 'schedule';
  const isRunnable = selectedNode.data?.subtype === 'http';

  return (
    <Sheet open={isOpen} onOpenChange={onClose} modal={false}>
      <SheetContent 
        side="right"
        overlay={false}
        className="flex flex-col right-6 top-6 bottom-6 w-[800px] sm:max-w-[800px] p-0 gap-0 overflow-hidden rounded-xl border shadow-sm bg-background data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right h-[calc(100vh-3rem)]"
        onInteractOutside={(e) => {
             // Allow interaction outside (sidebar usage)
             e.preventDefault();
        }}
      >
        {/* Header */}
        {(() => {
            const type = selectedNode.data?.subtype || selectedNode.type;
            const metadata = NODE_METADATA[type] || NODE_METADATA['action'];
            
            // Get translated title and description
            const translatedTitle = tNodes(`types.${type}`, { defaultValue: metadata.title });
            const translatedDescription = tNodes(`descriptions.${type}`, { defaultValue: metadata.description });
            
            return (
                <SheetHeader className="p-6 pb-4 border-b flex-none bg-background z-10">
                  <SheetTitle className="flex items-center gap-2">
                    <span className="truncate max-w-[400px]">
                        {translatedTitle}
                    </span>
                    <span className="text-[10px] font-normal uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                        {selectedNode.type}
                    </span>
                  </SheetTitle>
                  <SheetDescription>
                    {translatedDescription}
                  </SheetDescription>
                </SheetHeader>
            );
        })()}
        
                {/* Main Split Content */}
                <div className="flex-1 flex flex-col min-h-0 bg-muted/5">
                    
                    {/* Top Panel: Settings (Scrollable) */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        <div className="p-6 space-y-8">
                            {/* 1. General Settings (Hidden for API Trigger as it handles its own) */}
                            {selectedNode.type !== 'api-trigger' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t("general.label")} <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={formData.label || ""}
                                                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                                placeholder={t("general.stepNamePlaceholder")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("general.description")} <span className="text-red-500">*</span></Label>
                                            <Textarea
                                                value={formData.description || ""}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder={t("general.descriptionPlaceholder")}
                                                rows={2}
                                                className="resize-none font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                    {/* 2. Component Configuration */}
                    <div className="space-y-4">
                        {selectedNode.type !== 'api-trigger' && (
                            <h4 className="text-sm font-medium border-b pb-2 flex items-center justify-between">
                                <span>{t("general.configuration")}</span>
                            </h4>
                        )}
                        {(() => {
                            const type = selectedNode.data?.subtype || selectedNode.data?.type || selectedNode.type;
                            const ConfigComponent = CONFIG_COMPONENTS[type];

                            if (ConfigComponent) {
                                return (
                                    <ConfigComponent 
                                        key={selectedNode.id}
                                        data={formData} 
                                        onUpdate={(newData: any) => {
                                            const updated = { ...formData, ...newData };
                                            setFormData(updated);
                                            
                                            // Live-update the store for schema changes (so Sidebar updates immediately)
                                            if (
                                              newData.lastRunResult || 
                                              (selectedNode.type === 'api-trigger' && newData.schema !== undefined)
                                            ) {
                                                onUpdate(selectedNode.id, updated);
                                            }
                                        }} 
                                    />
                                );
                            }

                            return (
                                <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                                    {t("general.noConfigNeeded")}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Bottom Panel: Output Console (Fixed/Sticky) */}
            <NodeExecutionConsole 
                testResult={testResult} 
                isVisible={showOutput} 
                onClose={() => setShowOutput(false)} 
            />
        </div>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t bg-background flex-none flex flex-row items-center justify-between sm:justify-between gap-2">
           {/* Left: Close without saving */}
           <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
             {t("buttons.cancel")}
           </Button>
           
           {/* Right: Actions */}
           <div className="flex items-center gap-2">
                {/* Test Run: Only for HTTP nodes for now */}
                {isRunnable && (
                    <div className="flex items-center gap-2 mr-2 border-r pr-4">
                         {/* Show Output Toggle (if results exist) */}
                         {testResult && !showOutput && (
                            <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowOutput(true)}
                                className="h-8 text-muted-foreground"
                                title="Show previous output"
                            >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                {t("buttons.output")}
                            </Button>
                        )}
                        
                        <Button 
                            variant="secondary" 
                            onClick={handleRunStep} 
                            disabled={isExecuting}
                            className="gap-2 border bg-background hover:bg-muted"
                        >
                            {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                            {isExecuting ? t("buttons.runningStep") : t("buttons.testStep")}
                        </Button>
                    </div>
                )}

               <Button onClick={handleSave} className="min-w-[100px]">
                 {t("buttons.save")}
               </Button>
           </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
