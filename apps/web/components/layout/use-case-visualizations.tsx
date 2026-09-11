import { AlertTriangle, CheckCircle, CreditCard, Database, FileText, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toneSoft, toneText, type Tone } from "@/lib/tones";
import { Tag } from "@/components/ui/surface";

// Sample interfaces for the use-case page. Colors come from lib/tones so they
// match the flow diagrams: status tones for state, the brand trio for actors.

const cardClass = "w-full overflow-hidden rounded-md border border-border-strong bg-surface-1 surface-highlight";
const cardHeaderClass = "flex items-center justify-between border-b border-border bg-surface-2/50 px-5 py-4";
const statLabelClass = "block text-micro uppercase tracking-wider text-muted-foreground";

function LiveDot() {
  return <span aria-hidden className="size-1.5 shrink-0 animate-pulse rounded-full bg-success" />;
}

// --- Billing & Claims -------------------------------------------------------

const claims: { id: string; type: string; amount: string; status: string; tone: Tone }[] = [
  { id: "CLM-887", type: "Detention", amount: "$1,240", status: "Approved", tone: "success" },
  { id: "INV-4021", type: "Linehaul Invoice", amount: "$8,930", status: "Matched", tone: "blue" },
  { id: "CLM-892", type: "Detention", amount: "$2,180", status: "Exception", tone: "warning" },
  { id: "INV-4018", type: "Fuel Surcharge", amount: "$560", status: "Synced", tone: "neutral" },
];

export const BillingClaimsPreview = () => (
  <div className="flex h-full w-full items-center justify-center bg-dot-grid p-3 md:p-5">
    <div className={cn(cardClass, "max-w-3xl")}>
      <div className={cn(cardHeaderClass, "py-3")}>
        <div className="flex items-center gap-3">
          <div className={cn("flex size-8 items-center justify-center rounded-sm border", toneSoft.violet)}><CreditCard className="size-4" aria-hidden /></div>
          <div>
            <h4 className="text-body-sm font-medium">Billing & Claims</h4>
            <p className="text-micro text-muted-foreground">Week 24 · 4 items need attention</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-micro text-muted-foreground"><LiveDot />SYNCED</div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {[["Open Claims", "12", ""], ["Flagged for Review", "3", toneText.warning], ["Recovered This Month", "$18.4k", ""]].map(([label, value, cls]) => (
          <div key={label} className="px-5 py-2.5">
            <span className={statLabelClass}>{label}</span>
            <span className={cn("text-title-md font-light", cls)}>{value}</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3">
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border pb-2 text-micro uppercase tracking-wider text-muted-foreground">
          <span>Claim</span><span className="text-right">Amount</span><span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-border">
          {claims.map(claim => (
            <div key={claim.id} className={cn("grid grid-cols-[1fr_auto_auto] items-center gap-x-4 py-1.5 text-caption", claim.tone === "warning" && "-mx-2 rounded-xs bg-warning/8 px-2")}>
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0">
                  <span className="block truncate font-medium">#{claim.id}</span>
                  <span className="text-micro text-muted-foreground">{claim.type}</span>
                </div>
              </div>
              <span className="text-right font-mono">{claim.amount}</span>
              <Tag tone={claim.tone} className="ml-auto">{claim.status}</Tag>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("mx-4 mb-4 rounded-sm border p-3", toneSoft.warning, "text-foreground")}>
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0 text-warning" aria-hidden />
          <span className="text-caption font-medium">Detention Discrepancy — #CLM-892</span>
          <Tag tone="warning" className="ml-auto">Ready for Review</Tag>
        </div>
        <p className="mb-2.5 text-caption text-muted-foreground">
          Carrier log <span className="font-medium text-foreground">4 hours</span> · Geofence record <span className="font-medium text-foreground">2 hours</span>
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5 text-micro text-muted-foreground">
            <CheckCircle className="size-3 shrink-0 text-success" aria-hidden />
            <span className="truncate">Signed_POD.pdf attached · Rate matches contract</span>
          </span>
          <div className="flex shrink-0 gap-2">
            <span className="rounded-sm border border-border-strong bg-background px-3 py-1.5 text-micro font-medium">Review</span>
            <span className="rounded-sm bg-foreground px-3 py-1.5 text-micro font-medium text-background">Approve</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Demand & inventory forecasting ----------------------------------------

const resolutionSteps: { icon: typeof Database; tone: Tone; title: string; meta: string }[] = [
  { icon: TrendingUp, tone: "violet", title: "Forecast updated", meta: "08:42:15 AM" },
  { icon: Database, tone: "blue", title: "Reorder drafted in ERP", meta: "08:42:16 AM" },
  { icon: CheckCircle, tone: "success", title: "Supplier confirmed", meta: "Delivery: Tomorrow, 6 AM" },
];

export const DemandForecastPreview = () => (
  <div className="flex h-full w-full items-center justify-center bg-dot-grid p-6">
    <div className={cn(cardClass, "max-w-lg")}>
      <div className={cn(cardHeaderClass, "px-6")}>
        <div className="flex items-center gap-2"><LiveDot /><span className="text-body-sm font-medium">Line A4 · Demand forecast</span></div>
        <span className="font-mono text-caption text-muted-foreground">LIVE</span>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        {[["Output rate", "98%"], ["Forecast horizon", "7 days"]].map(([label, value]) => (
          <div key={label} className="rounded-sm border border-border bg-background p-4">
            <span className="mb-1 block text-caption text-muted-foreground">{label}</span>
            <span className="text-title-lg font-light">{value}</span>
          </div>
        ))}
      </div>

      <div className={cn("mx-6 mb-6 flex items-start gap-4 rounded-sm border p-4", toneSoft.warning)}>
        <div className="shrink-0 rounded-sm bg-warning/15 p-2"><AlertTriangle className="size-5" aria-hidden /></div>
        <div>
          <h4 className="text-body-sm font-medium text-foreground">Resin shortage likely in 4 hours</h4>
          <p className="mt-1 text-caption text-muted-foreground">Machine-learning forecast from current output and past usage.</p>
        </div>
      </div>

      <div className="px-6 pb-6">
        <h5 className="mb-3 text-center text-micro uppercase tracking-wider text-muted-foreground">What happened next</h5>
        <div className="relative space-y-3">
          <div aria-hidden className="absolute top-2 bottom-2 left-3.5 w-px bg-border" />
          {resolutionSteps.map(({ icon: Icon, tone, title, meta }) => (
            <div key={title} className="relative flex items-center gap-3">
              <div className={cn("z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-surface-1", toneSoft[tone])}>
                <Icon className="size-3.5" aria-hidden />
              </div>
              <div className="text-body-sm">
                <span className="font-medium">{title}</span>
                <span className="ml-2 text-caption text-muted-foreground">{meta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
