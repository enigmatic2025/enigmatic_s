"use client"

import { Workflow, Code2, Users, Blocks } from "lucide-react"
import { useRouter } from "@/navigation"

interface QuickLinksProps {
  slug: string
}

export function QuickLinks({ slug }: QuickLinksProps) {
  const router = useRouter()

  const links = [
    {
      icon: Workflow,
      label: "Action Flows",
      href: `/nodal/${slug}/dashboard/action-flows`,
    },
    {
      icon: Code2,
      label: "Flow Studio",
      href: `/nodal/${slug}/dashboard/flow-studio`,
    },
    {
      icon: Users,
      label: "Organization",
      href: `/nodal/${slug}/dashboard/organization`,
    },
    {
      icon: Blocks,
      label: "Integrations",
      href: `/nodal/${slug}/dashboard/integration`,
    },
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => router.push(link.href)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <link.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
