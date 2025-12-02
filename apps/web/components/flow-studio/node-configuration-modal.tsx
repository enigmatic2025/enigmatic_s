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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Copy, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css'; // Dark theme for editor
import { CONFIG_COMPONENTS } from "./constants/node-registry";

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
  const [activeTab, setActiveTab] = useState("settings");
  const [formData, setFormData] = useState<any>({});
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testBody, setTestBody] = useState("");
  const [isTestBodyOpen, setIsTestBodyOpen] = useState(false);

  // Reset form when node changes
  useEffect(() => {
    if (selectedNode) {
      setFormData(selectedNode.data || {});
      setTestResult(null);
      setTestBody("");
    }
  }, [selectedNode]);

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

  const handleTest = async () => {
    setIsTesting(true);
    try {
      // Merge test body if provided, otherwise use configured body
      const dataToTest = {
        ...selectedNode,
        data: {
          ...formData,
          body: testBody || formData.body
        }
      };
      const result = await onTest(dataToTest);
      setTestResult(result);
      toast.success("Test executed successfully");
    } catch (error) {
      toast.error("Test failed");
      setTestResult({ error: "Failed to execute test" });
    } finally {
      setIsTesting(false);
    }
  };

  if (!selectedNode) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col h-[85vh] sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b flex-none">
          <DialogTitle className="flex items-center gap-2">
            {selectedNode.data?.label || selectedNode.type}
          </DialogTitle>
          <DialogDescription>
            Configure the settings for this node.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-4 flex-none">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="settings" className="mt-0 space-y-4 p-6 pb-20">
              <div className="space-y-4 border-b pb-4">
                <h4 className="text-sm font-medium">General Information</h4>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.label || ""}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Node Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this step does..."
                    rows={2}
                  />
                </div>
              </div>

              {(() => {
                // Determine component based on subtype or type
                const type = selectedNode.data?.subtype || selectedNode.data?.type || selectedNode.type;
                const ConfigComponent = CONFIG_COMPONENTS[type];

                if (ConfigComponent) {
                  return (
                    // Add key to force remount when node changes
                    <ConfigComponent 
                      key={selectedNode.id}
                      data={formData} 
                      onUpdate={(newData: any) => setFormData({ ...formData, ...newData })} 
                    />
                  );
                }

                return (
                  <div className="p-4 border rounded-md bg-muted/20 text-sm text-muted-foreground">
                    No configuration available for this node type ({type}).
                  </div>
                );
              })()}
            </TabsContent>

            <TabsContent value="test" className="mt-0 space-y-4 p-6 pb-20">
              {selectedNode.type === 'schedule' ? (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-2 p-4 border rounded-md bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground">No test available</p>
                  <p className="text-xs text-muted-foreground">Schedule triggers cannot be manually tested here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-md bg-muted/20">
                    <div 
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setIsTestBodyOpen(!isTestBodyOpen)}
                    >
                      <div>
                        <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                          {isTestBodyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          Test Configuration
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Override input data for testing (Optional).
                        </p>
                      </div>
                    </div>

                    {isTestBodyOpen && (
                      <div className="p-4 pt-0 space-y-2 border-t">
                        <div className="flex justify-end pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              try {
                                if (!testBody) return;
                                const parsed = JSON.parse(testBody);
                                setTestBody(JSON.stringify(parsed, null, 2));
                                toast.success("JSON formatted");
                              } catch (e) {
                                toast.error("Invalid JSON");
                              }
                            }}
                          >
                            Prettify JSON
                          </Button>
                        </div>
                        <div className="border border-slate-800 rounded-md overflow-hidden bg-slate-950">
                          <Editor
                            value={testBody}
                            onValueChange={setTestBody}
                            highlight={code => highlight(code, languages.json, 'json')}
                            padding={16}
                            style={{
                              fontFamily: '"Fira code", "Fira Mono", monospace',
                              fontSize: 12,
                              backgroundColor: 'transparent',
                              color: '#f8f8f2',
                              minHeight: '150px',
                            }}
                            className="min-h-[150px]"
                            textareaClassName="focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {testResult && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Result</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(testResult, null, 2));
                            toast.success("Result copied to clipboard");
                          }}
                          title="Copy Result"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="rounded-md overflow-hidden border bg-slate-950">
                        <SyntaxHighlighter
                          language="json"
                          style={vscDarkPlus}
                          customStyle={{
                            margin: 0,
                            padding: '1rem',
                            fontSize: '0.75rem',
                            lineHeight: '1.5',
                            maxHeight: '300px',
                          }}
                          wrapLongLines={true}
                        >
                          {JSON.stringify(testResult, null, 2)}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 pt-4 border-t flex-none bg-background">
           {activeTab === 'settings' && (
             <Button onClick={handleSave}>Save Configuration</Button>
           )}
           {activeTab === 'test' && selectedNode.type !== 'schedule' && (
             <Button 
               onClick={handleTest} 
               disabled={isTesting}
               className="gap-2"
             >
               <Play className="h-4 w-4" />
               {isTesting ? "Running..." : "Test Action"}
             </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
