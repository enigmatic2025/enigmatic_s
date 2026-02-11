"use client"

import * as React from "react"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { Clock } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "@/navigation"
import { supabase } from "@/lib/supabase"

interface Task {
  id: string
  title: string
  status: string
  created_at: string
  action_flow_id?: string
  reference_id?: string
}

interface MyActionsProps {
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

export function MyActions({ slug }: MyActionsProps) {
  const { user } = useAuth()
  const router = useRouter()

  const { data: tasks, error, isLoading } = useSWR<Task[]>(
    user?.email ? `/api/tasks?assignee=${user.email}&status=PENDING` : null,
    fetcher,
    { refreshInterval: 30000 }
  )

  const handleTaskClick = (task: Task) => {
    if (task.action_flow_id) {
      router.push(`/nodal/${slug}/dashboard/action-flows/${task.action_flow_id}`)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground">My Actions</h2>
        {tasks && tasks.length > 0 && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          ))
        ) : error ? (
          <div className="text-center text-muted-foreground py-12 text-sm">
            Unable to load actions
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm text-muted-foreground">No pending actions</p>
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className="w-full text-left rounded-lg bg-card border border-border hover:border-primary/50 transition-all p-4 group"
            >
              <h4 className="text-sm font-semibold text-foreground leading-tight truncate">
                {task.title}
              </h4>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-muted-foreground">
                  {task.status === "PENDING" ? "Pending" : task.status}
                </span>
                {task.reference_id && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {task.reference_id}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
