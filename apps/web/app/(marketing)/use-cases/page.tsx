import { AssetMaintenanceFlow, CustomerServiceFlow, EmployeeOnboardingFlow, OperationsIntelligenceFlow } from "@/components/layout/use-case-flows";
import { BillingClaimsPreview, DemandForecastPreview } from "@/components/layout/use-case-visualizations";
import { Panel, Tag } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { PageHero } from "@/components/marketing/page-hero";

// Organized by business function; each case draws its example from a different industry.
const cases = [
  {
    id: "finance", fn: "Finance & back office", industry: "Transportation", pillar: "Process automation", Visual: BillingClaimsPreview, flow: false,
    title: "Invoice & claims processing",
    description: "Invoices and claims are captured automatically, with AI reading each document. The process matches them to contracts and records and flags anything that doesn't add up, so your team works from one view of exceptions instead of rekeying, and cash comes in faster.",
  },
  {
    id: "onboarding", fn: "People & HR", industry: "Healthcare", pillar: "Process automation", Visual: EmployeeOnboardingFlow, flow: true,
    title: "Employee onboarding",
    description: "Onboarding touches HR systems, email, credentials, and scheduling. Automation collects documents, checks licenses and certifications, and hands each step to the right person, so new hires are ready on day one.",
  },
  {
    id: "customer-service", fn: "Customer service", industry: "Distribution", pillar: "AI & agents", Visual: CustomerServiceFlow, flow: true,
    title: "Inquiry triage",
    description: "AI reads every incoming email, understands what the customer needs, and answers routine questions like order status automatically. Complex requests go to a specialist with the context and a draft reply already attached.",
  },
  {
    id: "operations", fn: "Operations", industry: "Transportation", pillar: "Process automation", Visual: AssetMaintenanceFlow, flow: true,
    title: "Maintenance & inspections",
    description: "When an inspection reports a defect, automation flags it, drafts the work order with suggested parts and labor, and updates asset status across your systems. Nothing waits on someone noticing an email.",
  },
  {
    id: "planning", fn: "Planning", industry: "Manufacturing", pillar: "AI & agents", Visual: DemandForecastPreview, flow: false,
    title: "Demand & inventory forecasting",
    description: "Machine learning forecasts material needs from live output and past usage. When a shortage is likely, the process drafts the reorder and confirms delivery with the supplier, so the line keeps running.",
  },
  {
    id: "reporting", fn: "Reporting & insights", industry: "Professional services", pillar: "Data & insights", Visual: OperationsIntelligenceFlow, flow: true,
    title: "Operations intelligence",
    description: "Data from finance and operations systems flows into one trusted model. Leaders get a live dashboard by location, plus a weekly briefing, written with AI, on the trends and anomalies worth their attention.",
  },
] as const;

export default function UseCasesPage() {
  return (
    <>
      <PageHero
        title="Real processes."
        accent="New possibilities."
        description="How automation changes everyday work across finance, people, customer service, operations, and planning, with AI and data where they add the most. Illustrative examples from a range of industries."
      />
      <div className="wrap pb-10">
        <nav aria-label="Use cases" className="flex flex-wrap gap-x-6 gap-y-2.5 border-y border-border py-5 text-body-sm text-muted-foreground">
          {cases.map(item => <a key={item.id} href={`#${item.id}`} className="transition-colors duration-200 hover:text-foreground">{item.fn}</a>)}
        </nav>
        <Text size="caption" tone="subtle" className="mt-4">Illustrative processes and sample interfaces. Each solution is designed around the client&apos;s process.</Text>
        {cases.map(({ id, industry, pillar, Visual, flow, title, description }) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-title`}
            className="grid scroll-mt-24 items-center gap-7 border-b border-border py-10 last:border-b-0 sm:py-14 md:grid-cols-[1fr_1.3fr] md:gap-9 lg:grid-cols-[1fr_1.5fr] lg:gap-14"
          >
            <div>
              <Heading id={`${id}-title`} size="lg" className="mb-5">{title}</Heading>
              <Text>{description}</Text>
              <div className="mt-6 flex flex-wrap gap-2">
                <Tag tone="violet">{pillar}</Tag>
                <Tag>Industry example: {industry}</Tag>
              </div>
            </div>
            {/* ReactFlow needs a fixed height; sample UIs grow to fit on small screens. */}
            <Panel className={flow ? "h-[440px] min-w-0 sm:h-[540px] lg:h-[560px]" : "min-h-[540px] min-w-0 lg:h-[560px]"}><Visual /></Panel>
          </section>
        ))}
      </div>
      <ContactBand />
    </>
  );
}
