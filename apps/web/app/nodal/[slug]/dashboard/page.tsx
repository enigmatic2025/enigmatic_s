import { QuickActionsPanel } from "@/components/dashboard/overview/quick-actions-panel";
import { ActivityFeed } from "@/components/dashboard/overview/activity-feed";
import { MyActionFlowsPanel } from "@/components/dashboard/overview/my-action-flows-panel";

export default function DashboardPage() {
  return (
    <div className="flex gap-6">
      {/* Main Feed Area (Center) */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="w-full max-w-3xl space-y-6 pb-6">
          <QuickActionsPanel />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Latest Activity</h2>
            </div>
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* Right Sidebar: My Action Flows */}
      <div className="hidden xl:block w-[400px] flex-none border-l border-border/50 pl-6">
        <div className="sticky top-20">
          <MyActionFlowsPanel />
        </div>
      </div>
    </div>
  );
}
