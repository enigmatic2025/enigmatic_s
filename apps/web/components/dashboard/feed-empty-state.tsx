import { Inbox } from "lucide-react"

export function FeedEmptyState({
  title = "No recent activity",
  description = "When actions are taken or flows run, they will appear here.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-xl bg-card/50">
      <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mx-auto">
        {description}
      </p>
    </div>
  )
}
