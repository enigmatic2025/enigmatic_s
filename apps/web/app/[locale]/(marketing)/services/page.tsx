import { getTranslations } from "next-intl/server";
import { ArrowRight, Layers3, Plus, ScanText, Workflow } from "lucide-react";
import { PageHero, EditorialPhoto, ContactBand, contactHref, styles } from "@/components/marketing/editorial";

export default async function ServicesPage() {
  const t = await getTranslations("ServicesPage");
  const h = await getTranslations("HomeRefresh");
  const e = await getTranslations("Editorial");
  return <div className={styles.page}>
    <PageHero label={t("title")} title={e("services.title")} accent={e("services.accent")} description={e("services.intro")}>
      <a className={styles.primary} href={contactHref}>{h("contact")}<ArrowRight size={17} /></a>
    </PageHero>
    <EditorialPhoto src="/images/home/corporate.jpg" alt={e("services.photoAlt")} />
    <section className={`${styles.wrap} ${styles.section}`}>
      <div className={styles.sectionHeading}><h2>{h("capabilitiesTitle")}</h2></div>
      <div className={styles.serviceGrid}>{[{key:"automation",icon:Workflow},{key:"ai",icon:ScanText},{key:"applications",icon:Layers3}].map(({key,icon:Icon}) => <article className={styles.serviceCard} key={key}><Icon size={30} strokeWidth={1.2} /><h3>{h(`capabilities.${key}.title`)}</h3><p>{h(`capabilities.${key}.description`)}</p><small>{h(`capabilities.${key}.examples`)}</small></article>)}</div>
    </section>
    <section className={styles.tinted}><div className={`${styles.wrap} ${styles.section} ${styles.split}`}>
      <div><p className={styles.eyebrow}>{h("approachLabel")}</p><h2>{h("approachTitle")}</h2><p className={styles.bodyCopy}>{e("services.deliveryIntro")}</p></div>
      <div>{["consulting","engineering"].map((phase, phaseIndex) => <div className={styles.phase} key={phase}>
        <h3>{t(`phases.${phase}`)}</h3><p>{phaseIndex === 0 ? t("phases.consultingNote") : e("services.engineeringNote")}</p>
        {(phaseIndex === 0 ? [1,2,3] : [4,5,6]).map(step => <details className={styles.disclosure} key={step} open={step === 1}>
          <summary><span>0{step}</span><h3>{t(`steps.step${step}.title`)}</h3><Plus size={18} /></summary>
          <div className={styles.disclosureBody}><p>{t(`steps.step${step}.description`)}</p><div className={styles.deliverables}>
            <div><h4>{t("deliverables")}</h4><ul>{(t.raw(`steps.step${step}.deliverables`) as string[]).map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h4>{t("tools")}</h4><div className={styles.tags}>{(t.raw(`steps.step${step}.tools`) as string[]).map(item => <span key={item}>{item}</span>)}</div></div>
          </div></div>
        </details>)}
      </div>)}</div>
    </div></section>
    <section className={`${styles.wrap} ${styles.section} ${styles.split}`}><div><p className={styles.eyebrow}>{e("beforeWeBegin")}</p><h2>{t("faq.title")}</h2></div><div>
      {(t.raw("faq.items") as { question: string; answer: string }[]).map(item => <details className={styles.disclosure} key={item.question}><summary><h3>{item.question}</h3><Plus size={18} /></summary><div className={styles.disclosureBody}><p>{item.answer}</p></div></details>)}
    </div></section>
    <ContactBand />
  </div>;
}
