import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { MyActions } from "@/components/dashboard/my-actions"

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div className="h-full w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column (Main Content) */}
      <div className="lg:col-span-2 flex flex-col gap-6 h-full">
        {/* Stats / Main Wrapper */}
        <div className="h-48 bg-muted/20 rounded-xl border-2 border-dashed flex items-center justify-center shrink-0">
          <span className="text-muted-foreground">Main Dashboard Wrapper (Stats/Metrics)</span>
        </div>
        
        {/* Activity Feed (Stacked below stats) */}
        <div className="flex-1 min-h-[400px]">
           <ActivityFeed slug={slug} scope="org" />
        </div>
      </div>

      {/* Right Column (My Actions) */}
      <div className="lg:col-span-1 h-full min-h-[500px]">
        <MyActions slug={slug} />
      </div>
    </div>
  );
}
