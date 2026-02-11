import { WorkplaceFeed } from "@/components/dashboard/workplace-feed"
import { MyActions } from "@/components/dashboard/my-actions"
import { DashboardSearch } from "@/components/dashboard/dashboard-search"
import { QuickLinks } from "@/components/dashboard/quick-links"

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div className="h-full w-full" style={{ display: "flex", gap: "24px" }}>
      {/* Left: 70% — Search, Quick Links, Activity */}
      <div style={{ width: "70%", minWidth: 0 }}>
        <DashboardSearch slug={slug} />
        <QuickLinks slug={slug} />
        <WorkplaceFeed slug={slug} scope="org" />
      </div>

      {/* Vertical Divider */}
      <div className="w-px bg-border h-full mx-2" />

      {/* Right: 30% — My Actions, full height */}
      <div style={{ width: "30%" }}>
        <div className="p-5" style={{ minHeight: "calc(100vh - 6rem)" }}>
          <MyActions slug={slug} />
        </div>
      </div>
    </div>
  );
}
