import { pad2 } from "@/lib/tones";
import { AssetMaintenanceFlow, DriverOnboardingFlow, OperationsReportingFlow } from "@/components/layout/use-case-flows";
import { BillingClaimsPreview, ManufacturingMaterialFlowPreview } from "@/components/layout/use-case-visualizations";
import { Panel } from "@/components/ui/surface";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { PageHero } from "@/components/marketing/page-hero";

const cases = [
  {
    id: "driver-onboarding", industry: "Logistics", service: "Workflow automation", Visual: DriverOnboardingFlow, flow: true,
    title: "Driver onboarding & hiring",
    description: "Onboarding is spread across a recruiting system, HR, email, spreadsheets, and safety checks. A connected workflow collects documents, validates them against your rules, and hands each step to the right person, so recruiters see one clear status instead of chasing it.",
  },
  {
    id: "maintenance", industry: "Logistics", service: "Workflow automation", Visual: AssetMaintenanceFlow, flow: true,
    title: "Maintenance & inspections",
    description: "When a technician submits an inspection with a defect, the workflow flags it, drafts the work order with suggested parts and labor, and updates fleet status in your ERP and TMS. Nothing waits on someone noticing an email.",
  },
  {
    id: "billing-claims", industry: "Logistics", service: "App development", Visual: BillingClaimsPreview, flow: false,
    title: "Billing & claims",
    description: "A focused internal app gives your team one view of invoices and claims, with attachments, validation, and exceptions in one place. Clean data goes to your TMS or accounting system, and cash comes in faster.",
  },
  {
    id: "operations-reporting", industry: "Logistics", service: "Data engineering", Visual: OperationsReportingFlow, flow: true,
    title: "Unified operations reporting",
    description: "Pipelines bring TMS and telematics data into one validated model. Leaders get a single source of truth for on-time performance, cost per mile, and detention, and the team gets alerts on the exceptions that need attention.",
  },
  {
    id: "material-replenishment", industry: "Manufacturing", service: "Workflow automation", Visual: ManufacturingMaterialFlowPreview, flow: false,
    title: "Material replenishment",
    description: "When production output puts material levels at risk, the workflow reads the signal from your ERP, suggests a reorder, and confirms delivery with the supplier, so the line keeps running without manual chasing.",
  },
] as const;

export default function UseCasesPage() {
  return (
    <>
      <PageHero
        title="Real processes."
        accent="New possibilities."
        description="Examples of the workflows, data systems, and applications we build for logistics and operations teams."
      />
      <div className="wrap pb-10">
        <nav aria-label="Use cases" className="flex flex-wrap gap-x-6 gap-y-2.5 border-y border-border py-5 text-body-sm text-muted-foreground">
          {cases.map(item => <a key={item.id} href={`#${item.id}`} className="transition-colors duration-200 hover:text-foreground">{item.title}</a>)}
        </nav>
        <Text size="caption" tone="subtle" className="mt-4">Illustrative workflows and sample interfaces. Each solution is designed around the client&apos;s process.</Text>
        {cases.map(({ id, industry, service, Visual, flow, title, description }, index) => (
          <section
            key={id}
            id={id}
            aria-labelledby={`${id}-title`}
            className="grid scroll-mt-24 items-center gap-7 border-b border-border py-10 last:border-b-0 sm:py-14 md:grid-cols-[1fr_1.3fr] md:gap-9 lg:grid-cols-[1fr_1.5fr] lg:gap-14"
          >
            <div>
              <Eyebrow tone="violet" className="mb-5">{pad2(index + 1)} / {industry} · {service}</Eyebrow>
              <Heading id={`${id}-title`} size="lg" className="mb-5">{title}</Heading>
              <Text>{description}</Text>
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
