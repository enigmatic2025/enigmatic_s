import { QuickActionsPanel } from "@/components/dashboard/quick-actions-panel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { MyActionFlowsPanel } from "@/components/dashboard/my-action-flows-panel";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Main Feed Area (Center/Left) - Includes Quick Actions */}
      <div className="col-span-12 xl:col-span-9 space-y-6 pb-6">
        <QuickActionsPanel />
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Latest Activity</h2>
          </div>
          <ActivityFeed />
        </div>
      </div>

      {/* Right Sidebar: My Action Flows */}
      <div className="hidden xl:block xl:col-span-3 border-l border-border/50 pl-6">
        <div className="sticky top-20">
          <MyActionFlowsPanel />
        </div>
      </div>
    </div>
  );
}
