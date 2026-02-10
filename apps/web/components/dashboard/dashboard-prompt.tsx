"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "@/navigation"
import { Sparkles, FileText, Users, BarChart3, Workflow } from "lucide-react"

interface DashboardPromptProps {
  slug: string
}

export function DashboardPrompt({ slug }: DashboardPromptProps) {
  const { user } = useAuth()
  const router = useRouter()

  const firstName = (user?.user_metadata?.full_name || "").split(" ")[0]
  const initials = (user?.user_metadata?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const quickActions = [
    {
      icon: Workflow,
      label: "Quick Flow",
      onClick: () => router.push(`/nodal/${slug}/dashboard/flow-studio`),
    },
    {
      icon: FileText,
      label: "New Report",
      onClick: () => {},
    },
    {
      icon: Users,
      label: "Team Huddle",
      onClick: () => router.push(`/nodal/${slug}/dashboard/organization`),
    },
    {
      icon: BarChart3,
      label: "Analytics",
      onClick: () => {},
    },
  ]

  return (
    <div className="px-1 mb-6">
      {/* Prompt Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Ask Natalie anything...
          </p>
        </div>
        <Sparkles className="h-4 w-4 text-muted-foreground/50" />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-6 justify-center">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card group-hover:border-border group-hover:bg-muted/50 transition-all">
              <action.icon className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
