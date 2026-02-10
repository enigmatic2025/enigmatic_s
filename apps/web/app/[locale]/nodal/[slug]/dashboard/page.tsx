import { ActivityFeed } from "@/components/dashboard/activity-feed"

export default function DashboardPage({ params }: { params: { slug: string } }) {
  return (
    <div className="h-full w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-48 bg-muted/20 rounded-lg border-2 border-dashed flex items-center justify-center">
          <span className="text-muted-foreground">Main Dashboard Wrapper (Stats/Metrics)</span>
        </div>
      </div>
      <div className="lg:col-start-3 h-full">
        <ActivityFeed slug={params.slug} scope="org" />
      </div>
    </div>
  );
}
