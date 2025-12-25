"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { 
  MoreHorizontal, 
  ArrowRight, 
  AlertTriangle, 
  Clock,
  Workflow
} from "lucide-react";

interface FeedItem {
  id: string;
  type: "update" | "alert" | "completion" | "creation";
  user: {
    name: string;
    initials: string;
    avatar?: string;
    role?: string;
  };
  action: string;
  target: string; // The flow or object being acted on
  targetId: string;
  content: string;
  timestamp: string;
  meta?: {
    status?: string;
    priority?: string;
    value?: string;
  };
}

const feedData: FeedItem[] = [
  {
    id: "1",
    type: "alert",
    user: {
      name: "System Monitor",
      initials: "SYS",
      role: "Automated"
    },
    action: "detected an anomaly in",
    target: "Reefer Alert",
    targetId: "AF-2024-004",
    content: "High pressure discharge detected in Reefer TK-882. Automated diagnostic sequence initiated.",
    timestamp: "12 mins ago",
    meta: {
      priority: "Critical",
      value: "High Pressure"
    }
  },
  {
    id: "2",
    type: "update",
    user: {
      name: "Charlie Day",
      initials: "CD",
      role: "Vendor Manager"
    },
    action: "updated the contract for",
    target: "Vendor Contract Renewal",
    targetId: "AF-2024-003",
    content: "Updated renewal terms based on legal review. Sent for final signature.",
    timestamp: "45 mins ago",
    meta: {
      status: "Legal Review"
    }
  },
  {
    id: "3",
    type: "completion",
    user: {
      name: "Bob Jones",
      initials: "BJ",
      role: "HR Manager"
    },
    action: "completed onboarding for",
    target: "Employee Onboarding",
    targetId: "AF-2024-002",
    content: "All onboarding tasks for John Doe have been completed. Welcome packet sent.",
    timestamp: "2 hours ago",
    meta: {
      status: "Complete"
    }
  },
  {
    id: "4",
    type: "creation",
    user: {
      name: "Alice Smith",
      initials: "AS",
      role: "Marketing Director"
    },
    action: "submitted a new request for",
    target: "Budget Approval",
    targetId: "AF-2024-001",
    content: "Q4 Marketing Budget Request - $50k allocation for digital campaigns.",
    timestamp: "4 hours ago",
    meta: {
      priority: "Medium"
    }
  },
  {
    id: "5",
    type: "update",
    user: {
      name: "David Kim",
      initials: "DK",
      role: "Driver"
    },
    action: "uploaded proof of delivery for",
    target: "Order #5521",
    targetId: "FLOW-2024-855",
    content: "Delivery completed at dock 4. Signed by J. Smith.",
    timestamp: "5 hours ago",
    meta: {
      status: "Delivered"
    }
  },
  {
    id: "6",
    type: "alert",
    user: {
      name: "System Monitor",
      initials: "SYS",
      role: "Automated"
    },
    action: "flagged a delay in",
    target: "Route Optimization",
    targetId: "FLOW-2024-910",
    content: "Traffic congestion on I-95 is causing a 45-minute delay. Rerouting options generated.",
    timestamp: "6 hours ago",
    meta: {
      priority: "Medium",
      value: "+45m"
    }
  },
  {
    id: "7",
    type: "completion",
    user: {
      name: "Sarah Connor",
      initials: "SC",
      role: "Logistics Manager"
    },
    action: "approved the budget for",
    target: "Q4 Marketing Campaign",
    targetId: "AF-2024-001",
    content: "Budget approved. Proceeding with vendor selection.",
    timestamp: "Yesterday",
    meta: {
      status: "Approved"
    }
  },
  {
    id: "8",
    type: "creation",
    user: {
      name: "Mike Ross",
      initials: "MR",
      role: "Warehouse Lead"
    },
    action: "initiated a safety audit for",
    target: "Warehouse Zone B",
    targetId: "FLOW-2024-912",
    content: "Scheduled safety inspection for Zone B following new protocols.",
    timestamp: "Yesterday",
    meta: {
      priority: "High"
    }
  },
  {
    id: "9",
    type: "update",
    user: {
      name: "Natalie",
      initials: "AI",
      role: "AI Assistant"
    },
    action: "updated the risk score for",
    target: "Driver: John Smith",
    targetId: "FLOW-2024-905",
    content: "Risk score decreased to 45 based on recent safe driving metrics.",
    timestamp: "2 days ago",
    meta: {
      value: "45/100"
    }
  },
  {
    id: "10",
    type: "alert",
    user: {
      name: "System Monitor",
      initials: "SYS",
      role: "Automated"
    },
    action: "detected low inventory for",
    target: "SKU-9921",
    targetId: "FLOW-2024-920",
    content: "Inventory levels dropped below threshold (50 units). Reorder triggered.",
    timestamp: "2 days ago",
    meta: {
      priority: "High",
      value: "48 units"
    }
  }
];

export function ActivityFeed() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const handleFlowClick = (flowId: string) => {
    router.push(`/nodal/${slug}/dashboard/action-flows/${flowId}`);
  };

  return (
    <div className="space-y-4">
      {feedData.map((item) => (
        <Card key={item.id} className="border-border/50 overflow-hidden">
          <CardHeader className="p-4 pb-2 flex flex-row items-start gap-3 space-y-0">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={item.user.avatar} />
              <AvatarFallback>
                {item.user.name === "Natalie" ? <Sparkles className="h-5 w-5" /> : 
                 item.user.name === "System Monitor" ? <AlertTriangle className="h-5 w-5" /> :
                 item.user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  <span className="text-foreground">{item.user.name}</span>
                  <span className="text-muted-foreground font-normal"> {item.action} </span>
                  <span className="text-foreground font-medium">{item.target}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {item.timestamp}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.content}
            </p>
            
            {/* Context Card / Attachment */}
            <div 
              className="bg-muted/30 rounded-md border border-border/50 p-3 flex items-center justify-between group cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleFlowClick(item.targetId)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-background border flex items-center justify-center">
                  <Workflow className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {item.targetId}
                    {item.meta?.priority && (
                      <PriorityBadge priority={item.meta.priority} />
                    )}
                    {item.meta?.status && (
                      <StatusBadge status={item.meta.status} />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    View full flow details
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 9h4" />
    </svg>
  )
}
