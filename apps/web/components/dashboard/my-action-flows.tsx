"use client"

import * as React from "react"
import useSWR from "swr"
import { useRouter } from "@/navigation"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface MyActionFlowsProps {
  slug: string
}

const fetcher = async (url: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

function getStatusLabel(status: string) {
  switch (status) {
    case "IN_PROGRESS":
    case "RUNNING":
      return "In Progress"
    case "COMPLETED":
      return "Complete"
    case "FAILED":
      return "Failed"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status
  }
}

export function MyActionFlows({ slug }: MyActionFlowsProps) {
  const router = useRouter()

  const { data: flows, error, isLoading } = useSWR<any[]>(
    slug ? `/api/action-flows?slug=${slug}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  // Show in-progress flows first, then others
  const activeFlows = React.useMemo(() => {
    if (!Array.isArray(flows)) return []
    return flows
      .filter((f) => f.status === "IN_PROGRESS" || f.status === "RUNNING")
  }, [flows])

  const handleFlowClick = (flowId: string) => {
    router.push(`/nodal/${slug}/dashboard/action-flows/${flowId}`)
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-foreground mb-5">My Action Flows</h2>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))
        ) : error ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Unable to load flows
          </div>
        ) : activeFlows.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-muted-foreground">No active flows</p>
          </div>
        ) : (
          activeFlows.map((flow) => (
            <button
              key={flow.id}
              onClick={() => handleFlowClick(flow.id)}
              className="w-full text-left rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-border transition-all p-4 group"
            >
              {/* Title */}
              <h4 className="text-sm font-semibold text-foreground leading-tight truncate group-hover:text-foreground/90 transition-colors">
                {flow.title}
              </h4>

              {/* Reference & Status */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                <span className="font-mono">{flow.reference_id}</span>
                <span>·</span>
                <span>{getStatusLabel(flow.status)}</span>
              </div>

              {/* Current Action */}
              {flow.current_action && (
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-muted-foreground">Current Action</span>
                  <span className="font-medium text-foreground truncate max-w-[55%] text-right">
                    {flow.current_action}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full h-1 rounded-full bg-muted mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-foreground/25 transition-all duration-500"
                  style={{ width: `${flow.progress || 0}%` }}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
