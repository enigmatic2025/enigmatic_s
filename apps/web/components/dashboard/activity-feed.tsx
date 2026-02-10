"use client"

import * as React from "react"
import useSWR from "swr"
import { CalendarDays, CheckCircle2, PlayCircle, PlusCircle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"

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

const fetcher = async (url: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  
  if (!res.ok) {
     const error = await res.text()
     throw new Error(error || "Failed to fetch")
  }

  return res.json()
}

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
    <Card className="col-span-1 h-full flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-lg font-semibold">Activity</CardTitle>
        {/* Removed description for cleaner look */}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {isLoading ? (
               // ... (skeleton remains, maybe slightly updated)
               <div className="space-y-4">
                 {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </div>
                    </div>
                 ))}
               </div>
            ) : data?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No recent activity</div>
            ) : (
              data?.map((activity) => (
                <div key={activity.id} className="flex gap-4 group">
                  <div className="mt-0.5 relative">
                    {/* Icon Container */}
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-background ring-2 ring-background">
                       {getActivityIcon(activity.event_type)}
                    </div>
                    {/* Connector Line (Optional, maybe for future) */}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm text-foreground/90">
                      {renderActivityMessage(activity)}
                    </div>
                    <p className="text-xs text-muted-foreground">
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

  // Clean, minimal text
  switch (event_type) {
    case "flow.started":
      return (
        <>
          <span className="font-semibold text-foreground">{actor}</span> started{" "}
          <span className="font-medium text-primary">{details.flow_name}</span>
        </>
      )
    case "flow.completed":
      return (
        <>
          Flow <span className="font-medium text-primary">{details.title}</span> completed
        </>
      )
    case "task.created":
      return (
        <>
          Task <span className="font-medium text-primary">{details.task_title}</span> created
          {details.assignee && details.assignee !== "unassigned" && (
            <span className="text-muted-foreground"> for {details.assignee}</span>
          )}
        </>
      )
    case "task.completed":
      return (
        <>
          <span className="font-semibold text-foreground">{actor}</span> completed{" "}
          <span className="font-medium text-primary">{details.task_title}</span>
        </>
      )
    default:
      return <span>{event_type}</span>
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "flow.started":
      return <PlayCircle className="h-4 w-4 text-blue-500" />
    case "flow.completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case "task.created":
      return <PlusCircle className="h-4 w-4 text-orange-500" />
    case "task.completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    default:
      return <CalendarDays className="h-4 w-4 text-muted-foreground" />
  }
}
