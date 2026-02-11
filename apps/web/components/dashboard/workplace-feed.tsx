"use client"

import * as React from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, MoreHorizontal, Workflow, TriangleAlert } from "lucide-react"
import { PriorityBadge } from "@/components/shared/priority-badge";
import { FeedEmptyState } from "@/components/dashboard/feed-empty-state"
import { supabase } from "@/lib/supabase"
import { useRouter } from "@/navigation"

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

interface WorkplaceFeedProps {
  orgId?: string
  slug?: string
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

export function WorkplaceFeed({ orgId, slug, scope = "org", limit = 20 }: WorkplaceFeedProps) {
  const router = useRouter()
  const queryParams = new URLSearchParams({ scope, limit: limit.toString() })
  if (orgId) queryParams.append("org_id", orgId)
  if (slug) queryParams.append("slug", slug)

  const { data, error, isLoading } = useSWR<ActivityLog[]>(
    (orgId || slug) ? `/api/activity-feed?${queryParams.toString()}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )


  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-5">Workplace Feed</h2>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border p-5 space-y-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted" />
                  <div className="h-4 w-1/3 bg-muted rounded" />
                </div>
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Unable to load feed
          </div>
        ) : data?.length === 0 ? (
          <FeedEmptyState 
            title="No actions found" 
            description="There are no actions to display at this time."
          />
        ) : (
          data?.filter(activity => {
              // Filter out noise: 
              // 1. Hide task.completed (history)
              // 2. Hide redundant task.created if flow.started exists for same time? (Harder)
              // For now, let's just hide task.completed as it's less actionable
              // User said "Hide redundant task.created", maybe they only want Flow Started for high level view?
              // But "Workplace Feed" suggests "What is happening now".
              // Let's filter to: flow.started, system.alert, and task.created (assignments)
              const relevantTypes = ['flow.started', 'system.alert', 'task.created']
              return relevantTypes.includes(activity.event_type)
          }).map((activity) => (
            <WorkplaceItem
              key={activity.id}
              activity={activity}
              slug={slug}
              onFlowClick={(flowId) =>
                router.push(`/nodal/${slug}/dashboard/action-flows/${flowId}`)
              }
            />
          ))
        )}
      </div>
    </div>
  )
}

function WorkplaceItem({
  activity,
  slug,
  onFlowClick,
}: {
  activity: ActivityLog
  slug?: string
  onFlowClick: (flowId: string) => void
}) {
  const { event_type, details, user, created_at } = activity
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: true })
  
  // Try to determine flow ID
  const flowId = details.flow_id || details.action_flow_id || null
  const isAlert = event_type.includes("alert") || event_type.includes("monitoring") || details.status === "critical"

  return (
    <div className="rounded-xl border border-border bg-card p-5 group transition-colors">
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center h-10 w-10 rounded-full ${isAlert ? "bg-red-50 text-red-600 dark:bg-red-950/20" : "bg-muted text-muted-foreground"}`}>
             {isAlert ? <TriangleAlert className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">
               {renderTitle(activity)}
            </div>
            <div className="text-xs text-muted-foreground">
               {timeAgo}
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="pl-[52px]">
        {details.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {details.description}
          </p>
        )}

        {/* Nested Action Flow Card */}
        {(details.reference_id || flowId) && (
          <div 
             onClick={() => flowId && onFlowClick(flowId)}
             className="flex items-center justify-between rounded-lg border border-border bg-gray-50 dark:bg-accent/10 p-3 hover:bg-gray-100 dark:hover:bg-accent/20 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border border-border flex items-center justify-center bg-card">
                 <Workflow className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-0.5">
                   <span className="text-sm font-semibold text-foreground">
                     {details.flow_name || details.title || details.reference_id || formatFlowID(flowId) || "Action Flow"}
                   </span>
                   {details.priority && (
                     <PriorityBadge priority={details.priority} className="text-[10px] px-1.5 py-0 h-5" />
                   )}
                </div>
                <div className="text-xs text-muted-foreground">
                  View full flow details
                </div>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  )
}

function renderTitle(activity: ActivityLog) {
  const { event_type, details, user } = activity
  
  // If a user is associated, show "User did X"
  if (user && user.full_name) {
      return (
        <>
          <span className="font-semibold">{user.full_name}</span>
          {" "}
          {event_type.replace(".", " ")}
          {" "}
          <span className="font-semibold">{details.flow_name || details.task_title || ""}</span>
        </>
      )
  }

  // System events (no user)
  // User requested to remove "System Monitor" and just describe activity
  
  if (event_type === "flow.started") {
      return (
          <>
            Action Flow started
            {details.flow_name ? (
                <>
                    {": "}
                    <span className="font-semibold">{details.flow_name}</span>
                </>
            ) : ""}
          </>
      )
  }

  if (event_type === "task.created") {
      return (
          <>
            Action Flow Created
            {details.task_title ? (
                 <>
                    {": "}
                    <span className="font-semibold">{details.task_title}</span>
                 </>
            ) : ""}
          </>
      )
  }

  if (event_type === "system.alert" || details.type === "anomaly") {
       return (
          <>
            <span className="text-red-600 dark:text-red-400 font-semibold">Anomaly Detected</span>
            {details.target ? (
                <>
                    {" in "}
                    <span className="font-semibold">{details.target}</span>
                </>
            ) : ""}
          </>
       )
  }

  // Fallback
  return (
    <>
      {event_type.replace(".", " ")}
      {" "}
      <span className="font-semibold">{details.flow_name || details.task_title || ""}</span>
    </>
  )
}

function formatFlowID(id: string | undefined): string {
    if (!id) return "AF-UNKNOWN"
    // If it's already a friendly ID (e.g. starting with AF-), return it
    if (id.startsWith("AF-")) return id
    
    // Otherwise, generate a pseudo-friendly ID from the UUID
    // e.g. flow-038961d2... -> AF-0389
    // or just take first 4 chars of UUID part
    const parts = id.split("-")
    if (parts.length > 1) {
        // flow-0389... -> parts[1] is 038961d2
        // just take first 4 chars
        return `AF-${parts[1].substring(0, 4).toUpperCase()}`
    }
    return `AF-${id.substring(0, 4).toUpperCase()}`
}
