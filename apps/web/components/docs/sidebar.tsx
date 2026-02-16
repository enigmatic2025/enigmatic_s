import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocsSearch } from "@/components/docs/search";

interface SidebarGroup {
  title: string;
  items: { id: string; label: string }[];
}

export const sidebarData: SidebarGroup[] = [
  {
    title: "Getting Started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "concepts", label: "Core Concepts" },
    ],
  },
  {
    title: "Triggers",
    items: [
      { id: "trigger-api", label: "API Trigger" },
    ],
  },
  {
    title: "Human Interaction",
    items: [
      { id: "human-task", label: "Human Task" },
    ],
  },
  {
    title: "External Systems",
    items: [
      { id: "wait-for-event", label: "Wait for Event" },
      { id: "http-request", label: "HTTP Request" },
      { id: "correlation", label: "Correlation Signals" },
    ],
  },
  {
    title: "Data Operations",
    items: [
      { id: "set-variable", label: "Set Variable" },
      { id: "condition", label: "Condition (If/Else)" },
      { id: "switch", label: "Switch" },
      { id: "loop", label: "Loop" },
      { id: "filter", label: "Filter" },
      { id: "map", label: "Map (Transform)" },
    ],
  },
  {
    title: "Expressions",
    items: [
      { id: "expressions", label: "Expression Syntax" },
    ],
  },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function Sidebar({ activeSection, onNavigate, className, ...props }: SidebarProps) {
  
  // Default all open
  const [openGroups, setOpenGroups] = useState<string[]>(sidebarData.map(g => g.title));

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const toggleAll = () => {
    if (openGroups.length === 0) {
      setOpenGroups(sidebarData.map(g => g.title));
    } else {
      setOpenGroups([]);
    }
  };

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <DocsSearch onNavigate={onNavigate} items={sidebarData} />
          
          <div className="flex items-center justify-between mb-2 px-2">
             <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               Navigation
             </span>
             <Button 
               variant="ghost" 
               size="sm" 
               className="h-6 w-6 p-0 hover:bg-muted" 
               onClick={toggleAll}
               title={openGroups.length === 0 ? "Expand All" : "Collapse All"}
             >
               <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
             </Button>
          </div>

          <div className="space-y-1">
            {sidebarData.map((group) => {
              const isOpen = openGroups.includes(group.title);
              return (
                <div key={group.title} className="w-full">
                  <div className="flex items-center justify-between w-full group/title">
                    <button 
                      onClick={() => toggleGroup(group.title)}
                      className="flex items-center justify-between w-full py-2 hover:bg-muted/50 rounded-md px-2 transition-colors"
                    >
                      <h4 className="text-sm font-semibold text-foreground/80">
                        {group.title}
                      </h4>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          !isOpen && "-rotate-90"
                        )}
                      />
                    </button>
                  </div>
                  
                  {isOpen && (
                    <div className="grid grid-flow-row auto-rows-max text-sm mt-1 mb-4 pl-2 border-l border-border/40 ml-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onNavigate(item.id)}
                          className={cn(
                            "group flex w-full items-center rounded-r-md border-l-2 border-transparent px-3 py-1.5 hover:text-foreground transition-colors text-muted-foreground",
                            activeSection === item.id
                              ? "font-medium text-foreground border-primary bg-primary/5"
                              : "font-normal hover:border-border/60"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
