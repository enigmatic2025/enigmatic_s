"use client"

import * as React from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, MoreHorizontal, Workflow } from "lucide-react"
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

interface ActivityFeedProps {
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ActivityFeed({ orgId, slug, scope = "org", limit = 20 }: ActivityFeedProps) {
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
      <h2 className="text-base font-semibold text-foreground mb-5">Latest Activity</h2>

      <div className="space-y-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse py-4">
                <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/3 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Unable to load activity
          </div>
        ) : data?.length === 0 ? (
          <FeedEmptyState />
        ) : (
          data?.map((activity) => (
            <ActivityItem
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

function ActivityItem({
  activity,
  slug,
  onFlowClick,
}: {
  activity: ActivityLog
  slug?: string
  onFlowClick: (flowId: string) => void
}) {
  const { event_type, details, user, created_at } = activity
  const actor = user?.full_name || "System"
  const initials = actor === "System" ? "S" : getInitials(actor)
  const timeAgo = formatDistanceToNow(new Date(created_at), { addSuffix: false })

  // Determine clickable flow ID from any available field
  const flowId = details.flow_id || details.action_flow_id || null

  return (
    <div className="group py-5 border-b border-border/40 last:border-b-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground shrink-0">
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-foreground leading-snug">
              {renderActivityMessage(activity)}
            </p>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-1 rounded hover:bg-muted">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {timeAgo} ago
          </p>

          {/* Description */}
          {details.description && (
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
              {details.description}
            </p>
          )}

          {/* Linked Action Flow Card */}
          {(details.reference_id || flowId) && (
            <div
              onClick={() => flowId && onFlowClick(flowId)}
              className="mt-3 flex items-center justify-between rounded-lg border border-border bg-card px-3.5 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                  <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {details.reference_id || details.flow_name || "Action Flow"}
                    </span>
                    {details.priority && (
                       <PriorityBadge priority={details.priority} className="text-[10px] px-1.5 py-0 h-5 border-none bg-transparent pl-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">View full flow details</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function renderActivityMessage(activity: ActivityLog) {
  const { event_type, details, user } = activity
  const actor = user?.full_name || "System"

  switch (event_type) {
    case "flow.started":
      return (
        <>
          <span className="font-semibold">{actor}</span>
          {" started "}
          <span className="font-semibold">{details.flow_name}</span>
        </>
      )
    case "flow.completed":
      return (
        <>
          <span className="font-semibold">{actor}</span>
          {" completed "}
          <span className="font-semibold">{details.title || details.flow_name}</span>
        </>
      )
    case "task.created":
      return (
        <>
          {"Task "}
          <span className="font-semibold">{details.task_title}</span>
          {" created"}
          {details.assignee && details.assignee !== "unassigned" && (
            <span className="text-muted-foreground"> for {details.assignee}</span>
          )}
        </>
      )
    case "task.completed":
      return (
        <>
          <span className="font-semibold">{actor}</span>
          {" completed "}
          <span className="font-semibold">{details.task_title}</span>
        </>
      )
    default:
      return <span>{event_type}</span>
  }
}
