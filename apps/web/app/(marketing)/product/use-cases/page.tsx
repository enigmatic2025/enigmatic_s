import { ArrowRight } from "lucide-react";
import { DriverOnboardingFlow, AssetMaintenanceFlow, ManufacturingFlow, ConstructionFlow } from "@/components/layout/use-case-flows";
import { BillingClaimsPreview, ManufacturingMaterialFlowPreview, ConstructionSiteCoordinationPreview } from "@/components/layout/use-case-visualizations";
import { PageHero, ContactBand, contactHref, styles } from "@/components/marketing/editorial";

const copy = {
  cards: {
    onboarding: ["Driver Onboarding & Hiring", "Every carrier deals with chaotic onboarding workflows spread across Tenstreet, HRIS, email, spreadsheets, and safety checks. Our bespoke workflow layer brings this messy process into one unified view, automating compliance steps and document collection."],
    maintenance: ["Asset Maintenance & Inspections", "Maintenance is often reactive and fragmented. A custom workflow can trigger parts ordering, work assignments, and approvals automatically when a technician submits a DVIR, keeping cross-team work aligned beyond the TMS."],
    billing: ["Billing & Claims Processing", "Accelerate cash flow by reducing leakage. A bespoke workflow gives your team a single operational view for billing and claims, handling tasks, attachments, and validations before clean data is submitted to your TMS or accounting system."],
    predictive: ["Predictive Manufacturing Operations", "Connect the shop floor to top floor. Ingest live sensor data to detect anomalies, automatically trigger work orders in your CMMS, and reschedule production shifts in your ERP without manual intervention."],
    production: ["Production Line Visibility", "Real-time monitoring of material inputs and outputs. When inventory drops below thresholds, an automated trigger can coordinate replenishment decisions with suppliers and internal teams without manual chasing."],
    field: ["Field Communication Integration", "Bridge the gap between the job site and the back office. Site foremen can report issues via SMS or Chat, and custom workflows can turn those reports into structured RFI documents and ticket requests."],
    construction: ["Construction Material Logistics", "Just-in-time delivery for complex sites. Coordinate concrete pours and material drops by syncing site requests directly with batch plants and logistics dispatchers."],
  } as Record<string, [string, string]>,
  groups: {
    people: "People & coordination",
    operations: "Operations & systems",
    documents: "Documents & data",
  } as Record<string, string>,
  contact: "Discuss your process",
};

const cases = [
  { id: "onboarding", group: "people", Visual: DriverOnboardingFlow },
  { id: "maintenance", group: "operations", Visual: AssetMaintenanceFlow },
  { id: "billing", group: "documents", Visual: BillingClaimsPreview },
  { id: "predictive", group: "operations", Visual: ManufacturingFlow },
  { id: "production", group: "operations", Visual: ManufacturingMaterialFlowPreview },
  { id: "field", group: "people", Visual: ConstructionSiteCoordinationPreview },
  { id: "construction", group: "operations", Visual: ConstructionFlow },
];

export default function UseCasesPage() {
  const t = copy.cards;
  const e = copy.groups;
  return <div className={styles.page}>
    <PageHero title="Real processes." accent="New possibilities." description="Explore how connected workflows and custom applications can simplify the work between your people, documents, and systems." />
    <div className={styles.wrap}>
      <nav className={styles.jumpLinks} aria-label="Use Cases">{cases.map(item => <a key={item.id} href={`#${item.id}`}>{t[item.id][0]}</a>)}</nav>
      <p className={styles.caseNote}>Illustrative workflows and sample interfaces. Each solution is designed around the client&apos;s process.</p>
      {cases.map(({id,group,Visual},index) => <section key={id} id={id} className={styles.caseRow} aria-labelledby={`${id}-title`}>
        <div><p className={styles.eyebrow}>0{index+1} / {e[group]}</p><h2 id={`${id}-title`}>{t[id][0]}</h2><p>{t[id][1]}</p><a href={contactHref} className={styles.textLink}>{copy.contact}<ArrowRight size={16} /></a></div>
        <div className={styles.caseVisual}><Visual /></div>
      </section>)}
    </div>
    <ContactBand />
  </div>;
}
