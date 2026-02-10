"use client"

import * as React from "react"
import useSWR from "swr"
import { CalendarDays, CheckCircle2, PlayCircle, PlusCircle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ActivityLog {
  id: string
  event_type: string
  details: Record<string, any>
  created_at: string
  user?: {
    full_name: string
    avatar_url: string
  }
}

interface ActivityFeedProps {
  orgId?: string // Now optional
  slug?: string  // Added support for slug
  scope?: "org" | "team" | "personal"
  limit?: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ActivityFeed({ orgId, slug, scope = "org", limit = 10 }: ActivityFeedProps) {
  const queryParams = new URLSearchParams({
    scope,
    limit: limit.toString(),
  })
  
  if (orgId) queryParams.append("org_id", orgId)
  if (slug) queryParams.append("slug", slug)

  const { data, error, isLoading } = useSWR<ActivityLog[]>(
    (orgId || slug) ? `/api/activity-feed?${queryParams.toString()}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  if (error) return <div className="text-sm text-red-500">Failed to load activity feed</div>
  
  return (
    <Card className="col-span-1 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
        <CardDescription>Recent updates across your organization</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-6">
          <div className="space-y-4 pb-6">
            {isLoading ? (
              // Simple Loading Skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-secondary/50" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 rounded bg-secondary/50" />
                    <div className="h-3 w-1/4 rounded bg-secondary/30" />
                  </div>
                </div>
              ))
            ) : data?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No recent activity</div>
            ) : (
              data?.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={activity.user?.avatar_url} alt={activity.user?.full_name || "System"} />
                    <AvatarFallback>{activity.user?.full_name?.charAt(0) || "S"}</AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1 flex-1">
                    <div className="text-sm font-medium leading-none">
                      {renderActivityMessage(activity)}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {getActivityIcon(activity.event_type)}
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function renderActivityMessage(activity: ActivityLog) {
  const { event_type, details, user } = activity
  const actor = user?.full_name || "System"

  switch (event_type) {
    case "flow.started":
      return (
        <span>
          <span className="font-semibold">{actor}</span> started flow
          <span className="font-semibold mx-1 text-primary">{details.flow_name || "Unknown Flow"}</span>
        </span>
      )
    case "flow.completed":
      return (
        <span>
          Flow <span className="font-semibold text-primary">{details.title || "Unknown Flow"}</span> completed
          <span className="text-muted-foreground ml-1">({details.status})</span>
        </span>
      )
    case "task.created":
      return (
        <span>
            Task <span className="font-semibold">{details.task_title}</span> assigned to 
            <span className="font-semibold mx-1">{details.assignee || "Someone"}</span>
        </span>
      )
    case "task.completed":
      return (
        <span>
          <span className="font-semibold">{actor}</span> completed task
          <span className="font-semibold mx-1 text-primary">{details.task_title}</span>
        </span>
      )
    default:
      return <span>Activity recorded: {event_type}</span>
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "flow.started":
      return <PlayCircle className="h-3 w-3 text-blue-500" />
    case "flow.completed":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />
    case "task.created":
      return <PlusCircle className="h-3 w-3 text-yellow-500" />
    case "task.completed":
      return <CheckCircle2 className="h-3 w-3 text-green-500" />
    default:
      return <CalendarDays className="h-3 w-3" />
  }
}
