import { useFlowStore } from "@/lib/stores/flow-store";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Copy, Search, Braces, Trash2, Settings2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function JsonTree({ data, path, level = 0, contextLoopSource }: { data: any; path: string; level?: number; contextLoopSource?: string | null }) {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Variable copied to clipboard");
  };

  const onDragStart = (e: React.DragEvent, text: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("text/plain", text);
  };

  if (data === null || data === undefined) {
    return (
      <div className="pl-4 py-1 text-xs text-muted-foreground flex items-center gap-2 font-mono">
        <span className="text-purple-400">null</span>
      </div>
    );
  }

  if (typeof data !== "object") {
    // If it's a leaf node, allow copying the path
    return (
      <div 
        className="pl-4 py-1 text-xs text-muted-foreground hover:text-foreground flex items-center gap-2 group cursor-grab hover:bg-muted/50 rounded"
        draggable
        onDragStart={(e) => onDragStart(e, `{{ ${path} }}`)}
        onClick={(e) => {
          e.stopPropagation();
          handleCopy(`{{ ${path} }}`);
        }}
      >
        <span className="text-green-600 dark:text-green-400 font-mono text-[10px] break-all">
          {typeof data === 'string' ? `"${data}"` : String(data)}
        </span>
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);
  const isEmpty = keys.length === 0;

  if (isEmpty) {
     return <div className="pl-4 py-1 text-xs text-muted-foreground italic">Empty {isArray ? "Array" : "Object"}</div>;
  }

  // Schema View for Arrays: Collapse items into a single representative structure
  if (isArray) {
      const value = data[0];
      const isPrimitive = value === null || typeof value !== "object";
      
      // SMART CONTEXT LOGIC:
      // If this array matches the one actively configured in the loop settings, use 'item' reference.
      // Otherwise, default to '[0]' (absolute reference).
      const isLoopTarget = contextLoopSource === path;
      const newPath = isLoopTarget ? "item" : `${path}[0]`;
      const label = isLoopTarget ? "[Structure] (Loop Item)" : "[Structure] (First Item)";
      const highlightClass = isLoopTarget ? "text-purple-600 dark:text-purple-400 font-medium" : "text-muted-foreground";

      return (
         <div className="pl-2">
            <div className="border-l border-border/40 ml-1">
                <div className="flex flex-col">
                   <div className={`flex items-center gap-1 py-1 px-1 rounded hover:bg-muted/50 cursor-pointer ${highlightClass}`}>
                     <JsonRow 
                       label={label} 
                       value={value} 
                       path={newPath}
                       isPrimitive={isPrimitive}
                       contextLoopSource={contextLoopSource}
                     />
                   </div>
                </div>
            </div>
         </div>
      );
  }

  return (
    <div className="pl-2">
      {keys.map((key) => {
        const newPath = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) 
             ? `${path}.${key}` 
             : `${path}["${key}"]`;
        
        const value = data[key];
        const isPrimitive = value === null || typeof value !== "object";

        return (
          <div key={key} className="border-l border-border/40 ml-1">
             <div className="flex flex-col">
               <div 
                 className={`flex items-center gap-1 py-1 px-1 rounded hover:bg-muted/50 cursor-pointer ${!isPrimitive ? 'font-medium' : ''}`}
                 onClick={(e) => {
                    // Only toggle expansion for objects/arrays. Primitives are draggable leaves.
                    if (!isPrimitive) {
                        e.stopPropagation();
                    }
                 }}
               >
                 {/* Row Renderer Wrapper */}
                 <JsonRow 
                   label={key} 
                   value={value} 
                   path={newPath}
                   isPrimitive={isPrimitive}
                   contextLoopSource={contextLoopSource}
                 />
               </div>
             </div>
          </div>
        );
      })}
    </div>
  );
}

// Sub-component for individual rows
function JsonRow({ label, value, path, isPrimitive, contextLoopSource }: { label: string; value: any; path: string; isPrimitive: boolean; contextLoopSource?: string | null }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Variable copied to clipboard");
    };

    const onDragStart = (e: React.DragEvent, text: string) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", text);
    };

    if (isPrimitive) {
        return (
            <div 
                className="flex items-center gap-2 w-full group select-none"
                draggable
                onDragStart={(e) => onDragStart(e, `{{ ${path} }}`)}
                onClick={() => handleCopy(`{{ ${path} }}`)}
            >
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30 mr-1" />
                <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">{label}:</span>
                <span className="text-[10px] font-mono font-semibold text-orange-600/70 dark:text-orange-400/80 truncate max-w-[150px]">
                    {value === null ? "Null" : (typeof value).charAt(0).toUpperCase() + (typeof value).slice(1)}
                </span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 ml-auto" />
            </div>
        );
    }

    return (

        <div className="w-full">
            <div 
                className="flex items-center gap-1 w-full hover:bg-muted/50 rounded pr-1 group select-none cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                draggable
                onDragStart={(e) => onDragStart(e, `{{ ${path} }}`)}
            >
                {isOpen ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
                <span className="text-xs font-mono font-medium truncate">{label}</span>
                <span className="text-[10px] text-muted-foreground ml-2 truncate flex-1 block">
                    {Array.isArray(value) ? `Array(${value.length})` : `{...}`}
                </span>
                
                {/* Actions for Object/Array */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(`{{ ${path} }}`);
                        }}
                        className="p-1 hover:text-foreground text-muted-foreground"
                        title="Copy Path"
                    >
                        <Copy className="h-3 w-3" />
                    </button>
                </div>
            </div>
            {isOpen && <JsonTree data={value} path={path} contextLoopSource={contextLoopSource} />}
        </div>
    );
}


// Default schemas for known triggers
const DEFAULT_SCHEMAS: Record<string, any> = {
    'schedule': {
        timestamp: Date.now(),
        iso: new Date().toISOString(),
        hour: new Date().getHours(),
        minute: new Date().getMinutes(),
        dayOfWeek: new Date().getDay(),
        dayOfMonth: new Date().getDate(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        cron: "0 9 * * 1-5" 
    },
    'manual-trigger': {
        timestamp: Date.now(),
        user_id: "usr_mock123",
        payload: { "key": "value" }
    },
    'webhook': {
        body: { "message": "Hello World" },
        headers: { "content-type": "application/json" },
        query: { "id": "123" },
        method: "POST"
    }
};

export function SidebarVariables({ searchQuery }: { searchQuery: string }) {
  const { nodes, variables, setVariable, deleteVariable, setSelectedNodeId, selectedNodeId } = useFlowStore();
  const [newVarName, setNewVarName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // DETERMINE SMART CONTEXT
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  let contextLoopSource: string | null = null;
  
  if (selectedNode) {
     if (selectedNode.type === 'MAP' && selectedNode.data.fromArray) {
         // Extract content from {{ steps.foo }} -> steps.foo
         const match = selectedNode.data.fromArray.match(/\{\{\s*(.*?)\s*\}\}/);
         contextLoopSource = match ? match[1] : selectedNode.data.fromArray;
     } else if (selectedNode.type === 'FILTER' && selectedNode.data.settings?.arrayVariable) {
         const match = selectedNode.data.settings.arrayVariable.match(/\{\{\s*(.*?)\s*\}\}/);
         contextLoopSource = match ? match[1] : selectedNode.data.settings.arrayVariable;
     }
     // Can trigger re-renders, but fine for Sidebar
  }

  const filteredNodes = nodes.filter(n => {
       const term = searchQuery.toLowerCase();
       const matchesName = n.data.label?.toLowerCase().includes(term);
       const matchesId = n.id.toLowerCase().includes(term);
       return matchesName || matchesId;
  });

  const handleAddVariable = () => {
      if (!newVarName.trim()) return;
      setVariable(newVarName.trim(), null);
      setNewVarName("");
      setIsAdding(false);
      toast.success(`Variable "${newVarName}" created`);
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex-1 overflow-y-auto space-y-4 p-2">
            
            {/* --- Global Variables Section --- */}
            <div className="border rounded-md bg-card overflow-hidden mb-4">
                <div className="flex items-center justify-between p-2 bg-purple-500/10 border-b border-purple-500/20">
                    <div className="font-medium text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <Braces className="h-3 w-3" /> Global Variables
                    </div>
                    <button 
                        onClick={() => setIsAdding(!isAdding)}
                        className="text-[10px] bg-background border px-1.5 py-0.5 rounded hover:bg-muted"
                    >
                        + New
                    </button>
                </div>
                
                {isAdding && (
                    <div className="p-2 border-b bg-muted/30 flex gap-2">
                        <Input 
                            className="h-7 text-xs" 
                            placeholder="Variable Name"
                            value={newVarName}
                            onChange={(e) => setNewVarName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
                        />
                        <button 
                            onClick={handleAddVariable}
                            className="bg-purple-600 text-white text-[10px] px-2 rounded hover:bg-purple-700"
                        >
                            Add
                        </button>
                    </div>
                )}

                <div className="p-2 bg-background">
                    {Object.keys(variables).length === 0 ? (
                        <div className="text-xs text-muted-foreground italic p-1">No global variables defined.</div>
                    ) : (
                        <div className="space-y-1">
                            {Object.entries(variables).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between group hover:bg-muted/50 p-1 rounded">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-xs font-mono font-medium text-purple-600 truncate max-w-[120px]">{key}</span>
                                        <span className="text-[10px] text-muted-foreground">=</span>
                                        <span className="text-[10px] font-mono truncate text-green-600 max-w-[80px]">
                                            {value === null ? 'null' : JSON.stringify(value)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(`{{ variables.${key} }}`);
                                                toast.success("Copied to clipboard");
                                            }}
                                            title="Copy Reference"
                                         >
                                            <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                         </button>
                                         <button 
                                            onClick={() => deleteVariable(key)}
                                            title="Delete Variable"
                                         >
                                            <Trash2 className="h-3 w-3 text-red-400 hover:text-red-600" />
                                         </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- Node Variables Section --- */}
            {filteredNodes.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                    No nodes found matching "{searchQuery}"
                </div>
            )}
            
            {filteredNodes.map((node) => {
                const runResult = node.data?.lastRunResult;
                let schema = runResult !== undefined ? runResult : DEFAULT_SCHEMAS[node.type || ""];
                
                // Special handling for API Trigger / Incoming Webhook Schema
                if (schema === undefined && node.type === 'api-trigger' && node.data?.schema && Array.isArray(node.data.schema)) {
                    const parsedSchema: Record<string, any> = {};
                    node.data.schema.forEach((field: any) => {
                        if (field.key) {
                            parsedSchema[field.key] = field.type === 'string' ? "example_string" : 
                                                        field.type === 'number' ? 123 : 
                                                        field.type === 'boolean' ? true :
                                                        field.type === 'object' ? {} : 
                                                        field.type === 'array' ? [] : "value";
                        }
                    });
                    
                    // If the schema has fields, use it.
                    if (Object.keys(parsedSchema).length > 0) {
                        schema = parsedSchema;
                    }
                }

                // Special handling for Set Variable nodes
                // We want to allow copying {{ variables.varName }} directly
                if (node.type === 'variable' && node.data?.variableName) {
                    schema = {
                        [node.data.variableName]: node.data.value || "current_value"
                    };
                }

                const hasData = schema !== undefined;
                
                return (
                    <div key={node.id} className="border rounded-md bg-card overflow-hidden">
                    <div className="flex items-center gap-2 p-2 bg-muted/30 border-b">
                        <div className="font-medium text-sm truncate flex-1" title={node.data.label}>
                        {node.data.label || node.id}
                        </div>
                        <span className="text-[10px] uppercase text-muted-foreground bg-background border px-1.5 py-0.5 rounded shadow-sm">
                        {node.type}
                        </span>
                    </div>
                    
                    <div className="p-2 bg-background min-h-[50px] max-h-[300px] overflow-y-auto">
                        {hasData ? (
                             <JsonTree 
                                data={schema} 
                                path={node.type === 'variable' ? 'variables' : `steps.${node.id}`} 
                                contextLoopSource={contextLoopSource}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 px-4 space-y-3 text-center opacity-80 hover:opacity-100 transition-opacity">
                                <div className="p-2 rounded-full bg-muted">
                                    <Braces className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-medium text-foreground">No Data Available</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">
                                        Run this step or define a schema to see variables.
                                    </p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs w-full gap-2 border-dashed hover:border-solid hover:bg-muted/50"
                                    onClick={() => setSelectedNodeId(node.id)}
                                >
                                    <Settings2 className="h-3 w-3" />
                                    Configure Schema
                                </Button>
                            </div>
                        )}
                    </div>
                    </div>
                );
            })}
       </div>
    </div>
  );
}
