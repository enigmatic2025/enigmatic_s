"use client";

import { useFlowStore } from "@/lib/stores/flow-store";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Copy, Search, Braces, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

function JsonTree({ data, path, level = 0 }: { data: any; path: string; level?: number }) {
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

  return (
    <div className="pl-2">
      {keys.map((key) => {
        // Construct new path: 
        // if array: path[0] 
        // if object: path.key (handling special characters if needed)
        const isArrayKey = /^\d+$/.test(key);
        const newPath = isArray 
          ? `${path}[${key}]` 
          : /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) 
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
                        // We need a local state for each key row to expand/collapse
                        // Since we are mapping, we might need a sub-component for the Row if we want individual state
                    }
                 }}
               >
                 {/* Row Renderer Wrapper */}
                 <JsonRow 
                   label={key} 
                   value={value} 
                   path={newPath}
                   isPrimitive={isPrimitive}
                 />
               </div>
             </div>
          </div>
        );
      })}
    </div>
  );
}

// Sub-component for individual rows to manage their own expansion state
function JsonRow({ label, value, path, isPrimitive }: { label: string; value: any; path: string; isPrimitive: boolean }) {
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
                <span className="text-xs font-mono text-green-600 dark:text-green-400 truncate max-w-[150px]">
                    {value === null ? "null" : (typeof value === 'string' ? `"${value}"` : String(value))}
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
            {isOpen && <JsonTree data={value} path={path} />}
        </div>
    );
}


export function SidebarVariables({ searchQuery }: { searchQuery: string }) {
  const { nodes, variables, setVariable, deleteVariable } = useFlowStore();
  const [newVarName, setNewVarName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const filteredNodes = nodes.filter(n => {
       const term = searchQuery.toLowerCase();
       const matchesName = n.data.label?.toLowerCase().includes(term);
       const matchesId = n.id.toLowerCase().includes(term);
       return matchesName || matchesId;
  });

  const handleAddVariable = () => {
      if (!newVarName.trim()) return;
      // Default to empty string or null
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
                const hasRunData = runResult !== undefined;
                
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
                        <div className="text-xs text-muted-foreground mb-2 px-1">
                            {hasRunData 
                                ? <span className="text-green-600 flex items-center gap-1">● Live Data</span> 
                                : <span className="italic opacity-70">Run node to see variables</span>
                            }
                        </div>
                        
                        <JsonTree 
                            data={hasRunData ? runResult : { id: node.id, ...node.data }} 
                            path={`steps.${node.id}`} 
                        />
                    </div>
                    </div>
                );
            })}
       </div>
    </div>
  );
}
