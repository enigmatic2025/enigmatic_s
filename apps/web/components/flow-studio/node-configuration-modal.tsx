"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CONFIG_COMPONENTS } from "./constants/node-registry";
import { NodeExecutionConsole } from "./node-execution-console";

interface NodeConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode: any;
  onUpdate: (nodeId: string, newData: any) => void;
  onTest: (nodeData: any) => Promise<any>;
  nodes: any[];
}

export function NodeConfigurationModal({
  isOpen,
  onClose,
  selectedNode,
  onUpdate,
  onTest,
  nodes,
}: NodeConfigurationModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [prevNodeId, setPrevNodeId] = useState<string | null>(null);

  // Reset form when node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
      
      // Only reset UI state if we switched to a different node
      if (selectedNode.id !== prevNodeId) {
          setPrevNodeId(selectedNode.id);
          
          if (selectedNode.data?.lastRunResult) {
              setTestResult({ Output: selectedNode.data.lastRunResult });
              setShowOutput(true); // Default to uncollapsed if result exists
          } else {
              setTestResult(null);
              setShowOutput(false);
          }
      }
    }
  }, [selectedNode, prevNodeId]);

  const handleSave = () => {
    if (selectedNode) {
      const label = formData.label?.trim();
      
      if (!label) {
        toast.error("Title cannot be empty");
        return;
      }

      // Check for duplicates
      const isDuplicate = nodes.some(n => 
        n.id !== selectedNode.id && 
        n.data.label?.toLowerCase() === label.toLowerCase()
      );

      if (isDuplicate) {
        toast.error("A node with this title already exists");
        return;
      }

      onUpdate(selectedNode.id, formData);
      toast.success("Node configuration saved");
      onClose(); 
    }
  };

  const handleRunStep = async () => {
    setIsExecuting(true);
    setShowOutput(true); // Auto-expand output area
    try {
      // 1. Auto-save current config to state/node before running
      // This allows the user to run without explicitly clicking "Save" first
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
      toast.success("Step executed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Step execution failed");
      setTestResult({ Error: "Failed to execute step" });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!selectedNode) return null;

  const isTrigger = selectedNode.type === 'schedule';
  const isRunnable = selectedNode.data?.subtype === 'http';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="flex flex-col h-[85vh] sm:max-w-[600px] p-0 gap-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b flex-none bg-background z-10">
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate max-w-[400px]">
                {formData.label || selectedNode.type}
            </span>
            <span className="text-[10px] font-normal uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-full border">
                {selectedNode.type}
            </span>
          </DialogTitle>
          <DialogDescription>
            Configure and execute this step.
          </DialogDescription>
        </DialogHeader>

        {/* Main Split Content */}
        <div className="flex-1 flex flex-col min-h-0">
            
            {/* Top Panel: Settings (Scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-0">
                <div className="p-6 space-y-8">
                    {/* 1. General Settings */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Label</Label>
                                <Input
                                    value={formData.label || ""}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="Step Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What does this step do?"
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Component Configuration */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium border-b pb-2">Configuration</h4>
                        {(() => {
                            const type = selectedNode.data?.subtype || selectedNode.data?.type || selectedNode.type;
                            const ConfigComponent = CONFIG_COMPONENTS[type];

                            if (ConfigComponent) {
                                return (
                                    <ConfigComponent 
                                        key={selectedNode.id}
                                        data={formData} 
                                        onUpdate={(newData: any) => setFormData({ ...formData, ...newData })} 
                                    />
                                );
                            }

                            return (
                                <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                                    No additional configuration needed for this step.
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
            
            {/* Collapsed Console Result Bar (When output exists but panel is hidden, or just a small notification)
                Actually, if showOutput is false, we might want to show a little bar at the bottom saying "Step Output Available ^"
                But for simplicity per plan, we just hide it or show the button in the footer.
                Let's stick to the "Run Step makes it show" logic. 
                But wait, if I close it, how do I open it back? 
                I need a trigger. 
            */}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t bg-muted/40 flex-none flex items-center justify-between sm:justify-between gap-2">
           {/* Left: Close without saving */}
           <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground">
             Close
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
                                Output
                            </Button>
                        )}
                        
                        <Button 
                            variant="secondary" 
                            onClick={handleRunStep} 
                            disabled={isExecuting}
                            className="gap-2 border bg-background hover:bg-muted"
                        >
                            {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                            {isExecuting ? "Running..." : "Test Run"}
                        </Button>
                    </div>
                )}

               <Button onClick={handleSave} className="min-w-[100px]">
                 Save & Close
               </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
