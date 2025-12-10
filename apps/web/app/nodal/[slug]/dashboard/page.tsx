import { AskNatalieHeader } from "@/components/dashboard/ask-natalie-header";
import { LiveFlows } from "@/components/dashboard/live-flows";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { NewActionFlow } from "@/components/dashboard/new-action-flow";
import { ActionFlowVolume } from "@/components/dashboard/action-flow-volume";
import { SystemStatus } from "@/components/dashboard/system-status";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <AskNatalieHeader />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-4">
          <div className="grid lg:grid-cols-5 gap-4">
            <SystemStatus className="col-span-4 lg:col-span-2 h-full" />
            <ActionFlowVolume className="col-span-4 lg:col-span-3 h-full" />
          </div>
          <div className="grid lg:grid-cols-2 gap-4">
            <LiveFlows className="h-full" />
            <NewActionFlow className="h-full" />
          </div>
        </div>
        <div className="col-span-2 xl:col-span-1 flex flex-col">
          <RecentActivity className="h-full" />
        </div>
      </div>
    </div>
  );
}
