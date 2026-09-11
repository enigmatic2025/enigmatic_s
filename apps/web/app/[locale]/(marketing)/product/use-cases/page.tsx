import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { DriverOnboardingFlow, AssetMaintenanceFlow, ManufacturingFlow, ConstructionFlow } from "@/components/layout/use-case-flows";
import { BillingClaimsPreview, ManufacturingMaterialFlowPreview, ConstructionSiteCoordinationPreview } from "@/components/layout/use-case-visualizations";
import { PageHero, ContactBand, contactHref, styles } from "@/components/marketing/editorial";

const cases = [
  { id: "onboarding", group: "people", Visual: DriverOnboardingFlow },
  { id: "maintenance", group: "operations", Visual: AssetMaintenanceFlow },
  { id: "billing", group: "documents", Visual: BillingClaimsPreview },
  { id: "predictive", group: "operations", Visual: ManufacturingFlow },
  { id: "production", group: "operations", Visual: ManufacturingMaterialFlowPreview },
  { id: "field", group: "people", Visual: ConstructionSiteCoordinationPreview },
  { id: "construction", group: "operations", Visual: ConstructionFlow },
];

export default async function UseCasesPage() {
  const t = await getTranslations("UseCasesPage");
  const e = await getTranslations("Editorial");
  const h = await getTranslations("HomeRefresh");
  const nav = await getTranslations("Navigation");
  return <div className={styles.page}>
    <PageHero label={nav("items.useCases")} title={e("cases.title")} accent={e("cases.accent")} description={e("cases.intro")} />
    <div className={styles.wrap}>
      <nav className={styles.jumpLinks} aria-label={nav("items.useCases")}>{cases.map(item => <a key={item.id} href={`#${item.id}`}>{t(`cards.${item.id}`)}</a>)}</nav>
      <p className={styles.caseNote}>{e("cases.note")}</p>
      {cases.map(({id,group,Visual},index) => <section key={id} id={id} className={styles.caseRow} aria-labelledby={`${id}-title`}>
        <div><p className={styles.eyebrow}>0{index+1} / {e(`cases.${group}`)}</p><h2 id={`${id}-title`}>{t(`cards.${id}`)}</h2><p>{t(`cards.${id}Desc`)}</p><a href={contactHref} className={styles.textLink}>{h("contact")}<ArrowRight size={16} /></a></div>
        <div className={styles.caseVisual}><Visual /></div>
      </section>)}
    </div>
    <ContactBand />
  </div>;
}
