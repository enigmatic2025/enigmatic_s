"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    Play,
    Pause,
    RotateCcw,
    FileText,
    Filter,
    Plus,
    MousePointerClick,
    Bot,
    Zap,
    Settings,
    Users,
    Download,
    XCircle
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { TimelineItem, TimelineStep } from "./timeline-item";
import { ActionExecutionPanel } from "./action-execution-panel";
import { CommentSection } from "./comment-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { actionFlows } from "@/components/dashboard/action-flows/data";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getFlowData, MOCK_FILES } from "./flow-data";

export function FlowDetailView() {
    const router = useRouter();
    const params = useParams();
    // Handle both 'id' and 'flowId' depending on route config, fallback to first flow
    const flowId = (params.flowId as string) || (params.id as string) || "AF-2024-001";
    
    const [steps, setSteps] = useState<TimelineStep[]>([]);
    const [flowInfo, setFlowInfo] = useState<any>(null);
    const [dataVisual, setDataVisual] = useState<any[]>([]);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [fileFilter, setFileFilter] = useState<string>("all");
    const currentUser = { name: "Sam Tran", initials: "ST" };

    useEffect(() => {
        // Load data based on ID
        const flow = actionFlows.find(f => f.id === flowId) || actionFlows[0];
        
        // Enhance flow info with detail-view specific stats
        const enhancedInfo = {
            ...flow,
            lastRun: "2 hours ago",
            successRate: 98,
            totalRuns: 142,
            avgDuration: "45s",
        };
        setFlowInfo(enhancedInfo);

        // Determine Steps & Visuals based on Flow Type
        const { steps: newSteps, dataVisual: newDataVisual } = getFlowData(flow.id, flow.name);
        setSteps(newSteps);
        setDataVisual(newDataVisual);
        
        // Reset selection on flow change
        setSelectedStepId(null);

    }, [flowId]);

    if (!flowInfo) return null;

    const selectedStep = steps.find(s => s.id === selectedStepId);

    const handleAddComment = (stepId: string, content: string) => {
        const newComment = {
            id: Math.random().toString(36).substr(2, 9),
            author: currentUser,
            content,
            timestamp: "Just now",
        };

        setSteps(steps.map(step => {
            if (step.id === stepId) {
                return {
                    ...step,
                    comments: [...step.comments, newComment],
                };
            }
            return step;
        }));
    };

    return (
        <div className="flex h-[calc(100vh-7rem)] bg-background border rounded-lg overflow-hidden">
            {/* Left Column: Info & Timeline */}
            <div className="w-1/2 flex flex-col border-r overflow-hidden">
                {/* Header / Info Section */}
                <div className="shrink-0 border-b bg-background z-10">
                    <div className="p-4 pb-4">
                        <div className="flex items-center justify-between mb-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
                                onClick={() => router.back()}
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back
                            </Button>
                            <div className="flex items-center gap-2">
                                <StatusBadge status={flowInfo.status} />
                                <PriorityBadge priority={flowInfo.priority} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-3.5 w-3.5" /> Edit Configuration
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Users className="mr-2 h-3.5 w-3.5" /> Reassign Ownership
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="mr-2 h-3.5 w-3.5" /> Export Audit Log
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                            <XCircle className="mr-2 h-3.5 w-3.5" /> Cancel Execution
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-lg font-semibold">{flowInfo.name}</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">{flowInfo.id}</p>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Description</div>
                                    <p className="text-foreground">{flowInfo.description}</p>
                                    
                                    {/* Data Visual Table */}
                                    <div className="mt-3 border rounded-md overflow-hidden">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                                <tr>
                                                    {dataVisual.map((col, i) => (
                                                        <th key={i} className="px-3 py-2 font-medium">{col.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                <tr>
                                                    {dataVisual.map((col, i) => (
                                                        <td key={i} className="px-3 py-2">
                                                            {col.value}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-muted-foreground mb-2">Assignees</div>
                                    <div className="flex flex-wrap gap-2">
                                        {flowInfo.assignees.map((assignee: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2 p-1 pr-3 rounded-full border bg-card hover:bg-accent transition-colors cursor-pointer group">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={assignee.image} />
                                                    <AvatarFallback className="text-[10px]">{assignee.initials}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs font-medium group-hover:text-accent-foreground">{assignee.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Section with Full Width Dividers */}
                    <div>
                        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-muted-foreground">Current Action</div>
                                <div className="font-medium text-foreground mt-0.5">{flowInfo.currentAction}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Progress</div>
                                <div className="font-medium text-foreground mt-0.5">{flowInfo.progress}%</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Started</div>
                                <div className="font-medium text-foreground mt-0.5">
                                    {new Date(flowInfo.startedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Last Update</div>
                                <div className="font-medium text-foreground mt-0.5">{flowInfo.lastRun}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <Tabs defaultValue="actions" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-4 border-b bg-background">
                        <TabsList className="w-full justify-start h-10 bg-transparent p-0">
                            <TabsTrigger 
                                value="actions"
                                className="h-10 rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                            >
                                Actions
                            </TabsTrigger>
                            <TabsTrigger 
                                value="files"
                                className="h-10 rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                            >
                                Files
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="actions" className="flex-1 flex overflow-hidden mt-0 border-0 data-[state=inactive]:hidden">
                        {/* Timeline List */}
                        <div className="w-1/2 overflow-y-auto p-4 border-r [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-foreground tracking-wide">
                                    Actions
                                </h3>
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                    <Plus className="h-3.5 w-3.5" />
                                    Quick Action
                                </Button>
                            </div>
                            <div className="space-y-0">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className="cursor-pointer"
                                        onClick={() => setSelectedStepId(step.id)}
                                    >
                                        <TimelineItem
                                            step={step}
                                            isLast={index === steps.length - 1}
                                            isSelected={selectedStepId === step.id}
                                            onAddComment={handleAddComment}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="w-1/2 overflow-y-auto p-4 bg-muted/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {selectedStep ? (
                                <div className="h-full flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium mb-3 text-foreground tracking-wide">
                                            Comments
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            For: <span className="font-medium text-foreground">{selectedStep.label}</span>
                                        </p>
                                    </div>
                                    <CommentSection
                                        comments={selectedStep.comments}
                                        onAddComment={(content) => handleAddComment(selectedStep.id, content)}
                                        className="mt-0 border-t-0 pt-0 flex-1"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                                    <MousePointerClick className="h-8 w-8 opacity-20" />
                                    <p>Select an action to view comments</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="files" className="flex-1 overflow-y-auto p-4 mt-0 border-0 data-[state=inactive]:hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-foreground tracking-wide">
                                Files
                            </h3>
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <select 
                                    className="text-xs bg-transparent border-none outline-none text-muted-foreground cursor-pointer"
                                    value={fileFilter}
                                    onChange={(e) => setFileFilter(e.target.value)}
                                >
                                    <option value="all">All Actions</option>
                                    {steps.map(step => (
                                        <option key={step.id} value={step.id}>{step.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            {MOCK_FILES.filter(f => fileFilter === 'all' || f.actionId === fileFilter).map((file) => (
                                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium">{file.name}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span>{file.size}</span>
                                                <span>•</span>
                                                <span>{file.uploadedBy}</span>
                                                <span>•</span>
                                                <span>{file.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs h-7">Download</Button>
                                </div>
                            ))}
                            {MOCK_FILES.filter(f => fileFilter === 'all' || f.actionId === fileFilter).length === 0 && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No files found for this filter.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Right Column: Action Execution Panel */}
            <div className="w-1/2 flex flex-col bg-background overflow-hidden">
                {selectedStep ? (
                    (selectedStep.isAutomated || selectedStep.type === 'alarm') ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Zap className="h-6 w-6 opacity-50" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-foreground">Action Details</p>
                                <p className="text-sm mt-1">No execution is required for this Action.</p>
                            </div>
                        </div>
                    ) : (
                        (!selectedStep.assignee || selectedStep.assignee.name === currentUser.name) ? (
                            <ActionExecutionPanel
                                key={selectedStep.id} // Force re-mount on step change
                                actionName={selectedStep.label}
                                actionType={selectedStep.type}
                                actionDescription={selectedStep.description}
                                requiresExternal={selectedStep.type === 'action' && selectedStep.label.includes("Slack")} // Mock logic for external link
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                    <span className="text-lg font-semibold">{selectedStep.assignee.initials}</span>
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-foreground">Access Restricted</p>
                                    <p className="text-sm mt-1">This action is assigned to {selectedStep.assignee.name}</p>
                                </div>
                            </div>
                        )
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <MousePointerClick className="h-10 w-10 opacity-20" />
                        <p>Select an action to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
