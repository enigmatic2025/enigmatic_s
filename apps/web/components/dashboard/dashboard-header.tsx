"use client"

import { useAuth } from "@/components/auth-provider"

export function DashboardHeader() {
  const { user } = useAuth()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || ""
  const firstName = fullName.split(" ")[0]

  return (
    <div className="mb-8 pt-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        {greeting}{firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Here&apos;s what&apos;s happening across your workspace.
      </p>
    </div>
  )
}
