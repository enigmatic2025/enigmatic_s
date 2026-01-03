"use client";

import { useFlowStore } from "@/lib/stores/flow-store";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Copy, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

// Recursive component to display JSON tree
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

  // 1. Handle Null/Undefined
  if (data === null || data === undefined) {
    return (
      <div className="pl-4 py-1 text-xs text-muted-foreground flex items-center gap-2 font-mono">
        <span className="text-purple-400">null</span>
      </div>
    );
  }

  // 2. Handle Primitives (String, Number, Boolean)
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

  // 3. Handle Arrays and Objects
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
                className="flex items-center gap-1 w-full hover:text-primary transition-colors select-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span className="text-xs font-mono font-medium">{label}</span>
                <span className="text-[10px] text-muted-foreground ml-2">
                    {Array.isArray(value) ? `Array(${value.length})` : `{...}`}
                </span>
            </div>
            {isOpen && <JsonTree data={value} path={path} />}
        </div>
    );
}


export function SidebarVariables() {
  const { nodes } = useFlowStore();
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredNodes = nodes.filter(n => {
       const term = searchTerm.toLowerCase();
       const matchesName = n.data.label?.toLowerCase().includes(term);
       const matchesId = n.id.toLowerCase().includes(term);
       // We usually want to include all nodes, but filtering happens here
       return matchesName || matchesId;
  });

  return (
    <div className="h-full flex flex-col">
       {/* Search Bar */}
       <div className="p-2 border-b flex items-center gap-2 bg-background sticky top-0 z-10">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search nodes..." 
                className="h-8 text-xs border-0 focus-visible:ring-0 bg-transparent px-0 placeholder:text-muted-foreground/50"
            />
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm("")}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                    Clear
                </button>
            )}
       </div>

       {/* List of Nodes */}
       <div className="flex-1 overflow-y-auto space-y-4 p-2">
            {filteredNodes.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                    No nodes found matching "{searchTerm}"
                </div>
            )}
            
            {filteredNodes.map((node) => {
                // Schema by Example: Use real run data if available, otherwise just basic structure
                const runResult = node.data?.lastRunResult; // We assume this is where we store it
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
                        
                        {/* Always show at least ID and Data root */}
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
