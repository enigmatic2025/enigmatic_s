"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    target: "Reefer Unit #402",
    targetId: "FLOW-2024-889",
    content: "Temperature deviation detected. Current reading 4.2°C (Threshold: 2.0°C - 4.0°C). Automated diagnostic sequence initiated.",
    timestamp: "12 mins ago",
    meta: {
      priority: "High",
      value: "4.2°C"
    }
  },
  {
    id: "2",
    type: "update",
    user: {
      name: "Sarah Chen",
      initials: "SC",
      avatar: "/images/avatars/sarah.jpg",
      role: "Logistics Manager"
    },
    action: "updated the manifest for",
    target: "Shipment #AX-992",
    targetId: "FLOW-2024-885",
    content: "Added 3 pallets of high-priority medical supplies to the manifest. Rerouting approved for expedited delivery to Seattle distribution center.",
    timestamp: "45 mins ago",
    meta: {
      status: "In Transit"
    }
  },
  {
    id: "3",
    type: "completion",
    user: {
      name: "Mike Ross",
      initials: "MR",
      role: "Warehouse Lead"
    },
    action: "completed inspection for",
    target: "Inbound Container C-202",
    targetId: "FLOW-2024-870",
    content: "All customs documentation verified. Seal integrity confirmed. Released for cross-docking.",
    timestamp: "2 hours ago",
    meta: {
      status: "Cleared"
    }
  },
  {
    id: "4",
    type: "creation",
    user: {
      name: "Natalie",
      initials: "AI",
      role: "AI Assistant"
    },
    action: "generated a new optimization flow for",
    target: "Route Planning - Q4",
    targetId: "FLOW-2024-901",
    content: "Based on current traffic patterns and weather alerts in the Midwest, I've proposed an alternative route for the Chicago-Denver corridor that could save 4.5 hours.",
    timestamp: "3 hours ago",
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
  }
];

export function ActivityFeed() {
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
            <div className="bg-muted/30 rounded-md border border-border/50 p-3 flex items-center justify-between group cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-background border flex items-center justify-center">
                  <Workflow className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {item.targetId}
                    {item.meta?.priority && (
                      <Badge variant="outline" className={
                        item.meta.priority === 'High' ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900" : ""
                      }>
                        {item.meta.priority}
                      </Badge>
                    )}
                    {item.meta?.status && (
                      <Badge variant="secondary" className="text-xs">
                        {item.meta.status}
                      </Badge>
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
