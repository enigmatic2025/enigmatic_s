export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your organization's activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Active Workflows</h3>
          <p className="mt-2 text-4xl font-light text-foreground">0</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Total Runs</h3>
          <p className="mt-2 text-4xl font-light text-foreground">0</p>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Team Members</h3>
          <p className="mt-2 text-4xl font-light text-foreground">1</p>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Recent Activity</h3>
        </div>
        <div className="p-6 text-center text-muted-foreground py-12">
          No activity yet. Create a workflow to get started.
        </div>
      </div>
    </div>
  )
}
