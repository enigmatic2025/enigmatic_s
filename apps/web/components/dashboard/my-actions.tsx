"use client"

import * as React from "react"
import useSWR from "swr"
import { useRouter } from "@/navigation"
import { ArrowRight, CheckCircle2, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  status: string
  flow_id: string
  created_at: string
}

interface MyActionsProps {
  slug: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MyActions({ slug }: MyActionsProps) {
  const { user } = useAuth()
  const router = useRouter()

  const { data: tasks, error, isLoading } = useSWR<Task[]>(
    user?.id ? `/api/tasks?user_id=${user.id}&status=PENDING` : null,
    fetcher
  )

  const handleTaskClick = (flowId: string) => {
    router.push(`/nodal/${slug}/dashboard/action-flows/${flowId}`)
  }

  if (error) return <div className="text-sm text-red-500">Failed to load actions</div>

  return (
    <Card className="h-full flex flex-col border-l-0 rounded-l-none rounded-r-none md:rounded-r-xl border-y-0 md:border-y md:border-r shadow-none md:shadow-sm bg-transparent md:bg-card">
      <CardHeader className="pb-3 px-4 pt-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          My Actions
          <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
            {tasks?.length || 0}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[calc(100vh-200px)] px-4">
          <div className="space-y-3 pb-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-lg border bg-card/50 animate-pulse" />
              ))
            ) : tasks?.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium">All caught up!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  You have no pending actions assigned to you.
                </p>
              </div>
            ) : (
              tasks?.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task.flow_id)}
                  className="group relative flex flex-col gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
                      {task.title}
                    </h4>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Pending</span>
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
