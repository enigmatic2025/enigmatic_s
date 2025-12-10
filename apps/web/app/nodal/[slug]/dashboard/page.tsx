import { StatsCards } from "@/components/dashboard/stats-cards";
import { LiveFlows } from "@/components/dashboard/live-flows";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NewActionFlow } from "@/components/dashboard/new-action-flow";
import { ActionFlowVolume } from "@/components/dashboard/action-flow-volume";
import { NatalieChat } from "@/components/dashboard/natalie-chat";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <StatsCards />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 flex flex-col gap-4">
          <ActionFlowVolume />
          <RecentActivity className="flex-1" />
        </div>
        <div className="col-span-3 space-y-4">
          <NatalieChat />
          <NewActionFlow />
          <LiveFlows />
        </div>
      </div>
    </div>
  );
}
