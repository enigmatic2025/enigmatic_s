"use client";

import { useState } from "react";
import useSWR from "swr";
import LoadingPage from "@/components/loading-page";
import { useTranslations } from "next-intl";

import { apiClient } from "@/lib/api-client";
import { ActionFlowList, ActionFlowExec } from "@/components/dashboard/action-flows/action-flow-list";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown } from "lucide-react";

export default function ActionFlowPlyPage() {
  const t = useTranslations("ActionFlows");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");

  const { data: executions = [], isLoading } = useSWR<ActionFlowExec[]>(
    "/api/action-flows",
    (url) => apiClient.get(url).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
    }),
    {
        refreshInterval: 10000, 
        fallbackData: []
    }
  );

  // Show global loading page only on initial load
  if (isLoading && executions.length === 0) {
     return <LoadingPage />;
  }

  // Calculate stats


  // Filter by search, status, and assignment
  const filtered = executions.filter(e => {
    const matchesSearch = e.flow_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         e.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    
    // Assignment filter logic
    let matchesAssignment = true;
    if (assignmentFilter !== "all") {
      // For now, we'll use has_assignments as a proxy
      // In a real implementation, you'd fetch current user ID and check against assignments
      if (assignmentFilter === "assignedToMe" || assignmentFilter === "assignedToMyTeam" || assignmentFilter === "relatedToMe") {
        matchesAssignment = e.has_assignments === true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesAssignment;
  });

  const statusOptions = [
    { value: "all", label: t("filters.allStatuses"), color: "" },
    { value: "RUNNING", label: t("statuses.inProgress"), color: "bg-gray-500" },
    { value: "COMPLETED", label: t("statuses.completed"), color: "bg-gray-500" },
    { value: "FAILED", label: t("statuses.failed"), color: "bg-gray-500" },
    { value: "TERMINATED", label: t("statuses.terminated"), color: "bg-gray-400" },
  ];

  const assignmentOptions = [
    { value: "all", label: t("filters.allFlows") },
    { value: "assignedToMe", label: t("filters.assignedToMe") },
    { value: "assignedToMyTeam", label: t("filters.assignedToMyTeam") },
    { value: "relatedToMe", label: t("filters.relatedToMe") },
  ];

  const currentStatus = statusOptions.find(s => s.value === statusFilter);
  const currentAssignment = assignmentOptions.find(a => a.value === assignmentFilter);

  return (
    <div className="h-full w-full space-y-6">
       {/* Header */}
       <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-medium tracking-tight text-foreground">
            {t("title")}
          </h1>
       </div>

       {/* Toolbar */}
       <div className="flex items-center gap-3">
          <div className="relative flex-1">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder={t("filters.search")}
                className="pl-9 bg-background border-input shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          {/* Assignment Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[160px] justify-between shadow-none">
                <span className="text-sm">{currentAssignment?.label}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {assignmentOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setAssignmentFilter(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 min-w-[140px] justify-between shadow-none">
                <div className="flex items-center gap-2">
                  {currentStatus?.color && (
                    <div className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
                  )}
                  <span className="text-sm">{currentStatus?.label}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className="gap-2"
                >
                  {option.color && (
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                  )}
                  <span>{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
       </div>

       {/* List */}
       <ActionFlowList data={filtered} isLoading={isLoading && executions.length === 0} />
    </div>
  );
}
