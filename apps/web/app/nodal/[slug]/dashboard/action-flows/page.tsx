"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Plus, LayoutList, LayoutGrid, ArrowUpDown } from "lucide-react";
import { ActionFlowList } from "@/components/dashboard/action-flows/action-flow-list";
import { ActionFlowGrid } from "@/components/dashboard/action-flows/action-flow-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { actionFlows } from "@/components/dashboard/action-flows/data";
import { FilterPopover, FilterState } from "@/components/dashboard/action-flows/filter-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActionFlowsPage() {
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [],
    priority: [],
    assignee: "",
    flowName: "",
  });

  const filteredFlows = actionFlows.filter((flow) => {
    // Global Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        flow.name.toLowerCase().includes(searchLower) ||
        flow.description.toLowerCase().includes(searchLower) ||
        flow.id.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status Filter
    if (filters.status.length > 0 && !filters.status.includes(flow.status)) {
      return false;
    }

    // Priority Filter
    if (filters.priority.length > 0 && !filters.priority.includes(flow.priority || "Medium")) {
      return false;
    }

    // Flow Name Filter
    if (filters.flowName && !flow.name.toLowerCase().includes(filters.flowName.toLowerCase())) {
      return false;
    }

    // Assignee Filter
    if (filters.assignee) {
      const assigneeLower = filters.assignee.toLowerCase();
      const hasAssignee = flow.assignees.some(
        (a) => 
          a.name.toLowerCase().includes(assigneeLower) || 
          a.initials.toLowerCase().includes(assigneeLower)
      );
      if (!hasAssignee) return false;
    }

    return true;
  });

  const sortedFlows = [...filteredFlows].sort((a, b) => {
    const dateA = new Date(a.startedAt).getTime();
    const dateB = new Date(b.startedAt).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="h-full w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Action Flows</h1>
        </div>
        <Button className="gap-2 shadow-none">
          <Plus className="h-4 w-4" />
          Initiate Flow
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search flows..." 
              className="pl-8 h-9 bg-background" 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <FilterPopover filters={filters} setFilters={setFilters} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "grid")}>
            <TabsList className="grid w-20 grid-cols-2">
              <TabsTrigger value="list">
                <LayoutList className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <LayoutGrid className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {view === "list" ? (
        <ActionFlowList data={sortedFlows} />
      ) : (
        <ActionFlowGrid data={sortedFlows} />
      )}
    </div>
  );
}
