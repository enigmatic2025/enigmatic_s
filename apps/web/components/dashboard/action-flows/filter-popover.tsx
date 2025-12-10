"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export interface FilterState {
  search: string; // Global search (already exists in page, but maybe move here? No, keep separate)
  status: string[];
  priority: string[];
  assignee: string;
  flowName: string;
}

interface FilterPopoverProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export function FilterPopover({ filters, setFilters }: FilterPopoverProps) {
  const activeFilterCount = 
    filters.status.length + 
    filters.priority.length + 
    (filters.assignee ? 1 : 0) + 
    (filters.flowName ? 1 : 0);

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    setFilters({ ...filters, status: newStatus });
  };

  const handlePriorityChange = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    setFilters({ ...filters, priority: newPriority });
  };

  const clearFilters = () => {
    setFilters({
      search: filters.search, // Keep global search
      status: [],
      priority: [],
      assignee: "",
      flowName: "",
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 relative">
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium leading-none">Filters</h4>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {["In Progress", "Complete", "Cancelled"].map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status}`} 
                    checked={filters.status.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <Label 
                    htmlFor={`status-${status}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Critical", "High", "Medium", "Low"].map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`priority-${priority}`} 
                    checked={filters.priority.includes(priority)}
                    onCheckedChange={() => handlePriorityChange(priority)}
                  />
                  <Label 
                    htmlFor={`priority-${priority}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {priority}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="flow-name">Flow Name</Label>
            <Input 
              id="flow-name" 
              placeholder="Filter by flow name..." 
              value={filters.flowName}
              onChange={(e) => setFilters({ ...filters, flowName: e.target.value })}
              className="h-8 bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input 
              id="assignee" 
              placeholder="Filter by assignee..." 
              value={filters.assignee}
              onChange={(e) => setFilters({ ...filters, assignee: e.target.value })}
              className="h-8 bg-background"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
