import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowDown, ArrowRight, Check, FileText, GitBranch, Layers3, ScanText, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "@/navigation";
import styles from "./home.module.css";

const contact = "mailto:collaborate@enigmatic.works?subject=Automation%20inquiry";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomeRefresh" });
  const title = `${t("eyebrow")} | Enigmatic Partners`;
  return {
    title: { absolute: title },
    description: t("intro"),
    openGraph: { title, description: t("intro"), images: ["/images/brand/brand-image.jpg"] },
    twitter: { card: "summary_large_image", title, description: t("intro"), images: ["/images/brand/brand-image.jpg"] },
  };
}

export default async function Home() {
  const t = await getTranslations("HomeRefresh");
  const capabilities = [
    { key: "automation", icon: Workflow },
    { key: "ai", icon: ScanText },
    { key: "applications", icon: Layers3 },
  ] as const;
  const stages = ["receive", "extract", "review", "sync"] as const;
  const stageIcons = [FileText, ScanText, ShieldCheck, GitBranch];

  return (
    <div className={styles.home}>
      <section className={`${styles.wrap} ${styles.hero}`} aria-labelledby="home-title">
        <div className={styles.eyebrow}><span className={styles.statusDot} />{t("eyebrow")}</div>
        <h1 id="home-title">{t("headline")}<br /><span>{t("headlineAccent")}</span></h1>
        <div className={styles.heroBottom}>
          <p className={styles.lead}>{t("intro")}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={contact}>{t("contact")}<ArrowRight size={17} /></a>
            <a className={styles.textLink} href="#in-practice">{t("explore")}<ArrowDown size={16} /></a>
          </div>
        </div>
        <figure className={styles.industryPhoto}>
          <div className={styles.industryImage}>
            <Image
              src="/images/home/freight.jpg"
              alt={t("photography.industryAlt")}
              fill
              sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1296px) calc(100vw - 96px), 1200px"
              className={styles.industryCrop}
            />
          </div>
          <figcaption>{t("photography.industryCaption")}</figcaption>
        </figure>
        <div className={styles.heroRule}><span>Enigmatic Partners</span><span>{t("mantra")}</span></div>
      </section>

      <section id="in-practice" className={styles.demoSection} aria-labelledby="demo-title">
        <div className={styles.wrap}>
          <div className={styles.sectionTop}>
            <div><p className={styles.eyebrow}>{t("exampleLabel")}</p><h2 id="demo-title">{t("exampleTitle")}</h2></div>
            <p className={styles.sectionIntro}>{t("exampleIntro")}</p>
          </div>
          <div className={styles.demo}>
            <div className={styles.demoBar}><span><span className={styles.statusDot} />{t("demoName")}</span><span>{t("illustrative")}</span></div>
            <div className={styles.demoBody}>
              <div className={styles.document}>
                <div className={styles.documentHeading}><FileText size={24} strokeWidth={1.3} /><span>{t("invoice")}</span></div>
                <div className={styles.documentRule} />
                <div className={styles.documentRow}><span>{t("supplier")}</span><strong>Acme Supply Co.</strong></div>
                <div className={styles.documentRow}><span>{t("reference")}</span><strong>INV-2026-042</strong></div>
                <div className={styles.documentRow}><span>{t("total")}</span><strong>$2,450.00</strong></div>
                <div className={styles.scanBand}><ScanText size={16} />{t("extracted")}</div>
              </div>
              <ol className={styles.pipeline}>
                {stages.map((stage, index) => {
                  const Icon = stageIcons[index];
                  return <li key={stage}><div className={styles.stageIcon}><Icon size={20} strokeWidth={1.4} /></div><div><span className={styles.stageNumber}>0{index + 1}</span><h3>{t(`stages.${stage}.title`)}</h3><p>{t(`stages.${stage}.description`)}</p></div></li>;
                })}
              </ol>
            </div>
            <div className={styles.demoNote}><ShieldCheck size={17} /><p>{t("demoNote")}</p></div>
          </div>
          <div className={styles.exampleFooter}><p>{t("exampleOutcome")}</p><Link className={styles.textLink} href="/product/use-cases">{t("moreExamples")}<ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="capabilities-title">
        <div className={styles.sectionTop}><div><p className={styles.eyebrow}>{t("capabilitiesLabel")}</p><h2 id="capabilities-title">{t("capabilitiesTitle")}</h2></div><Link className={styles.textLink} href="/services">{t("servicesLink")}<ArrowRight size={16} /></Link></div>
        <div className={styles.capabilities}>{capabilities.map(({ key, icon: Icon }, index) => <article key={key} className={styles.capability}><div className={styles.capabilityTop}><Icon size={29} strokeWidth={1.2} /><span>0{index + 1}</span></div><h3>{t(`capabilities.${key}.title`)}</h3><p>{t(`capabilities.${key}.description`)}</p><div className={styles.capabilityExamples}>{t(`capabilities.${key}.examples`)}</div></article>)}</div>
        <div className={styles.stack}><p>{t("stackIntro")}</p><div><span>React</span><span>Node.js</span><span className={styles.n8n}>n8n</span><span>Supabase</span></div><p>{t("stackNote")}</p></div>
      </section>

      <section className={styles.approachSection} aria-labelledby="approach-title"><div className={`${styles.wrap} ${styles.approach}`}>
        <div><p className={styles.eyebrow}>{t("approachLabel")}</p><h2 id="approach-title">{t("approachTitle")}</h2><p className={styles.sectionIntro}>{t("approachIntro")}</p><Link className={styles.textLink} href="/services">{t("approachLink")}<ArrowRight size={16} /></Link>
          <div className={styles.approachPhoto}>
            <Image
              src="/images/home/stat3.jpg"
              alt={t("photography.approachAlt")}
              fill
              sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 112px) / 2), (max-width: 1296px) calc((100vw - 196px) / 2), 550px"
              className={styles.approachCrop}
            />
          </div>
        </div>
        <ol className={styles.steps}>{["map", "build", "improve"].map((step, index) => <li key={step}><span>0{index + 1}</span><div><h3>{t(`steps.${step}.title`)}</h3><p>{t(`steps.${step}.description`)}</p></div></li>)}</ol>
      </div></section>

      <section className={`${styles.wrap} ${styles.principles}`} aria-label={t("principlesLabel")}>
        {["fit", "control", "scale"].map(key => <div key={key}><Check size={18} /><div><h3>{t(`principles.${key}.title`)}</h3><p>{t(`principles.${key}.description`)}</p></div></div>)}
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-title"><div className={styles.wrap}>
        <p className={styles.eyebrow}>{t("contactLabel")}</p><h2 id="contact-title">{t("contactTitle")}</h2><div className={styles.contactBottom}><p>{t("contactIntro")}</p><a className={styles.primary} href={contact}>{t("contact")}<ArrowRight size={17} /></a></div>
      </div></section>
    </div>
  );
}
