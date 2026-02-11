"use client"

import * as React from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, MoreHorizontal, Workflow, TriangleAlert } from "lucide-react"
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
          <div className="text-center text-muted-foreground py-12 text-sm">
            No recent activity
          </div>
        ) : (
          data?.map((activity) => (
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
    <div className="rounded-xl border border-border bg-card p-5 group transition-colors hover:border-primary/20">
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
             className="flex items-center justify-between rounded-lg border border-border bg-background p-3 hover:bg-muted/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border border-border flex items-center justify-center bg-card">
                 <Workflow className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                   <span className="text-sm font-semibold text-foreground">
                     {details.reference_id || flowId || "Action Flow"}
                   </span>
                   {details.priority && details.priority.toLowerCase() === 'critical' ? (
                     <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-[10px] font-medium flex items-center gap-1">
                       <TriangleAlert className="h-3 w-3" />
                       Critical
                     </span>
                   ) : (
                     <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                       {details.priority || "Normal"}
                     </span>
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
  const actor = user?.full_name || "System Monitor"

  // Custom formatting based on screenshot "System Monitor detected an anomaly in Reefer Alert"
  if (event_type === "system.alert" || details.type === "anomaly") {
      return (
        <>
          <span className="font-semibold">{actor}</span>
          {" detected an anomaly in "}
          <span className="font-semibold">{details.target || details.flow_name || "System"}</span>
        </>
      )
  }

  // Fallback to existing logic or generic
  return (
    <>
      <span className="font-semibold">{actor}</span>
      {" "}
      {event_type.replace(".", " ")}
      {" "}
      <span className="font-semibold">{details.flow_name || details.task_title || ""}</span>
    </>
  )
}
