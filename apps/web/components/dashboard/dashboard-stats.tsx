"use client"

import useSWR from "swr"
import { Activity, CheckCircle2, Clock, Zap } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"

interface DashboardStatsProps {
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

export function DashboardStats({ slug }: DashboardStatsProps) {
  const { user } = useAuth()

  const { data: flows } = useSWR(
    slug ? `/api/action-flows?slug=${slug}` : null,
    fetcher
  )

  const { data: pendingTasks } = useSWR(
    user?.id ? `/api/tasks?status=PENDING` : null,
    fetcher
  )

  const { data: completedTasks } = useSWR(
    user?.id ? `/api/tasks?status=COMPLETED` : null,
    fetcher
  )

  const activeFlows = Array.isArray(flows)
    ? flows.filter((f: any) => f.status === "IN_PROGRESS" || f.status === "RUNNING").length
    : 0

  const pending = Array.isArray(pendingTasks) ? pendingTasks.length : 0

  const today = new Date().toISOString().split("T")[0]
  const completedToday = Array.isArray(completedTasks)
    ? completedTasks.filter((t: any) => t.completed_at?.startsWith(today) || t.updated_at?.startsWith(today)).length
    : 0

  const totalFlows = Array.isArray(flows) ? flows.length : 0

  const stats = [
    {
      label: "Active Flows",
      value: activeFlows,
      icon: Activity,
      subtitle: `of ${totalFlows} total`,
    },
    {
      label: "Pending Tasks",
      value: pending,
      icon: Clock,
      subtitle: "awaiting action",
    },
    {
      label: "Completed",
      value: completedToday,
      icon: CheckCircle2,
      subtitle: "today",
    },
    {
      label: "Throughput",
      value: totalFlows,
      icon: Zap,
      subtitle: "total flows",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group rounded-xl border border-border/40 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <span className="text-3xl font-semibold tabular-nums tracking-tight">
                {stat.value}
              </span>
              <p className="text-[11px] text-muted-foreground">
                {stat.subtitle}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
