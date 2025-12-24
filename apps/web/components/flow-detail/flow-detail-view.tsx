"use client";

import { useState } from "react";
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
    Filter
} from "lucide-react";
import { useRouter } from "next/navigation";
import { TimelineItem, TimelineStep } from "./timeline-item";
import { ActionExecutionPanel } from "./action-execution-panel";
import { CommentSection } from "./comment-section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge } from "@/components/dashboard/action-flows/priority-badge";
import { StatusBadge } from "@/components/dashboard/action-flows/status-badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data
const MOCK_FLOW_INFO = {
    id: "AF-2024-001",
    name: "New Employee Onboarding",
    description: "Automates the process of setting up accounts, sending welcome emails, and scheduling orientation for new hires.",
    status: "In Progress" as const,
    priority: "High",
    lastRun: "2 hours ago",
    successRate: 98,
    totalRuns: 142,
    avgDuration: "45s",
    currentAction: "Manager Approval",
    progress: 60,
    assignees: [
        { name: "Alice Smith", initials: "AS" },
        { name: "Bob Jones", initials: "BJ" },
        { name: "Sarah Connor", initials: "SC" },
    ],
    startedAt: "2024-12-20T09:00:00",
};

const MOCK_STEPS: TimelineStep[] = [
    {
        id: "1",
        type: "schedule",
        label: "Review New Hire",
        description: "Listens for new entries in the HR system.",
        status: "completed",
        timestamp: "10:00 AM",
        duration: "0s",
        comments: [
            {
                id: "c1",
                author: { name: "System", initials: "SYS" },
                content: "Triggered by webhook ID: wh_12345",
                timestamp: "10:00 AM"
            }
        ],
        isAutomated: true,
    },
    {
        id: "2",
        type: "action",
        label: "Create Slack Account",
        description: "Provisions a new user in the corporate Slack workspace.",
        status: "completed",
        timestamp: "10:00 AM",
        duration: "2s",
        comments: [],
        isAutomated: true,
    },
    {
        id: "3",
        type: "ai",
        label: "Generate Welcome Email",
        description: "Uses GPT-4 to personalize the welcome message based on department.",
        status: "completed",
        timestamp: "10:00 AM",
        duration: "5s",
        comments: [
            {
                id: "c2",
                author: { name: "Sarah Connor", initials: "SC" },
                content: "The tone seems a bit too formal. Can we adjust the prompt?",
                timestamp: "10:05 AM"
            },
            {
                id: "c3",
                author: { name: "Bob Jones", initials: "BJ" },
                content: "Agreed, let's make it friendlier.",
                timestamp: "10:12 AM"
            }
        ],
        isAutomated: true,
    },
    {
        id: "4",
        type: "human",
        label: "Manager Approval",
        description: "Wait for the hiring manager to approve the equipment request.",
        status: "running",
        timestamp: "10:01 AM",
        duration: "Pending...",
        comments: [
            {
                id: "c4",
                author: { name: "Alice Smith", initials: "AS" },
                content: "Waiting on budget approval before I can sign off.",
                timestamp: "10:30 AM"
            }
        ],
        assignee: { name: "Alice Smith", initials: "AS" },
    },
    {
        id: "5",
        type: "action",
        label: "Send Welcome Packet",
        description: "Emails the final packet to the new employee.",
        status: "pending",
        comments: [],
        isAutomated: true,
    },
];

const MOCK_FILES = [
    { id: "f1", name: "Offer_Letter_Draft.pdf", size: "2.4 MB", uploadedBy: "Sarah Connor", date: "2024-12-20", actionId: "3" },
    { id: "f2", name: "Equipment_Request_Form.docx", size: "1.1 MB", uploadedBy: "Alice Smith", date: "2024-12-20", actionId: "4" },
    { id: "f3", name: "New_Hire_Checklist.xlsx", size: "45 KB", uploadedBy: "System", date: "2024-12-20", actionId: "1" },
];

export function FlowDetailView() {
    const router = useRouter();
    const [steps, setSteps] = useState<TimelineStep[]>(MOCK_STEPS);
    const [selectedStepId, setSelectedStepId] = useState<string>(MOCK_STEPS[0]?.id || "");
    const [fileFilter, setFileFilter] = useState<string>("all");
    const currentUser = { name: "Sam Tran", initials: "ST" };

    const selectedStep = steps.find(s => s.id === selectedStepId) || steps[0];

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
                                <StatusBadge status={MOCK_FLOW_INFO.status} />
                                <PriorityBadge priority={MOCK_FLOW_INFO.priority} />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Play className="mr-2 h-3.5 w-3.5" /> Run Now
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Pause className="mr-2 h-3.5 w-3.5" /> Pause Flow
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <RotateCcw className="mr-2 h-3.5 w-3.5" /> View History
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h1 className="text-lg font-semibold">{MOCK_FLOW_INFO.name}</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">{MOCK_FLOW_INFO.id}</p>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="text-muted-foreground mb-1">Description</div>
                                    <p className="text-foreground">{MOCK_FLOW_INFO.description}</p>
                                </div>

                                <div>
                                    <div className="text-muted-foreground mb-1.5">Assignees</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center -space-x-2">
                                            {MOCK_FLOW_INFO.assignees.map((assignee, i) => (
                                                <Avatar key={i} className="h-6 w-6 border-2 border-background">
                                                    <AvatarFallback className="text-[10px]">
                                                        {assignee.initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        <span className="text-muted-foreground">
                                            {MOCK_FLOW_INFO.assignees.map(a => a.name).join(', ')}
                                        </span>
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
                                <div className="font-medium text-foreground mt-0.5">{MOCK_FLOW_INFO.currentAction}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Progress</div>
                                <div className="font-medium text-foreground mt-0.5">{MOCK_FLOW_INFO.progress}%</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Started</div>
                                <div className="font-medium text-foreground mt-0.5">
                                    {new Date(MOCK_FLOW_INFO.startedAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Last Run</div>
                                <div className="font-medium text-foreground mt-0.5">{MOCK_FLOW_INFO.lastRun}</div>
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
                            <h3 className="text-sm font-medium mb-3 text-foreground tracking-wide">
                                Actions
                            </h3>
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
                                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                    Select a step to view comments
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
                    (!selectedStep.assignee || selectedStep.assignee.name === currentUser.name) ? (
                        <ActionExecutionPanel
                            key={selectedStep.id} // Force re-mount on step change
                            actionName={selectedStep.label}
                            actionType={selectedStep.type}
                            actionDescription={selectedStep.description}
                            requiresExternal={selectedStep.type === 'action' && selectedStep.label.includes("Slack")} // Mock logic for external link
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <AlertCircle className="h-6 w-6 opacity-50" />
                            </div>
                            <h3 className="font-medium text-lg text-foreground mb-1">Access Denied</h3>
                            <p className="text-sm max-w-xs">
                                You do not have access to this Action. It is assigned to {selectedStep.assignee.name}.
                            </p>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <MoreHorizontal className="h-6 w-6 opacity-50" />
                        </div>
                        <h3 className="font-medium text-lg text-foreground mb-1">Select an Action</h3>
                        <p className="text-sm max-w-xs">
                            Select an action from the timeline on the left to view details, execute tasks, or collaborate with your team.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
