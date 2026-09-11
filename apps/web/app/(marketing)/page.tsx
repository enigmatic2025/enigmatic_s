import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown, ArrowRight, Check, FileText, GitBranch, Layers3, ScanText, ShieldCheck, Workflow } from "lucide-react";
import Link from "next/link";
import styles from "./home.module.css";

const contact = "mailto:collaborate@enigmatic.works?subject=Automation%20inquiry";
const intro = "We build AI-powered workflows and custom applications that connect your systems, take manual work off your team, and grow with your business.";

const copy = {
  headline: "Less busywork.",
  headlineAccent: "More possibility.",
  contact: "Discuss your process",
  explore: "See automation in practice",
  mantra: "Map. Build. Improve.",
  exampleLabel: "01 / Automation in practice",
  exampleTitle: "From incoming document to work done.",
  exampleIntro: "Turn invoices, forms, and unstructured documents into usable data and dependable next steps.",
  demoName: "Intelligent document processing",
  illustrative: "Illustrative workflow · Sample data",
  invoice: "Supplier invoice",
  supplier: "Supplier",
  reference: "Invoice number",
  total: "Total",
  extracted: "Fields extracted for validation",
  stages: {
    receive: { title: "Receive", description: "A document arrives by email, upload, or a connected system." },
    extract: { title: "Understand", description: "AI identifies the document and extracts the fields that matter." },
    review: { title: "Validate", description: "Business rules check the data. Exceptions go to your team." },
    sync: { title: "Put it to work", description: "Approved data updates your systems and triggers the next step." },
  } as const,
  demoNote: "Human review where it matters. Clear rules for everything that follows.",
  exampleOutcome: "Less rekeying. Fewer handoffs. A process your team can follow.",
  moreExamples: "Explore use cases",
  capabilitiesLabel: "02 / What we build",
  capabilitiesTitle: "Practical technology. Powerful possibilities.",
  servicesLink: "Explore our services",
  capabilities: {
    automation: { title: "Connected workflows", description: "Connect the tools you already use and automate the steps between them. n8n brings your systems, rules, and people together.", examples: "Approvals · Onboarding · System integration" },
    ai: { title: "AI that does useful work", description: "Bring intelligence to document-heavy and information-heavy processes, with validation and human oversight built in.", examples: "Document processing · Classification · Triage" },
    applications: { title: "Software that fits", description: "Give your team a clear interface for the work that matters. Bespoke applications built around your process and connected to your data.", examples: "Internal tools · Operational portals · Dashboards" },
  } as const,
  stackIntro: "A focused stack. Built to work together.",
  stackNote: "n8n orchestrates the work. React, Node.js, and Supabase bring the interface, logic, and data together.",
  approachLabel: "03 / How we work",
  approachTitle: "Map. Build. Improve.",
  approachIntro: "Start with a worthwhile problem. Build a focused solution. Improve it as your business grows.",
  approachLink: "Our delivery approach",
  steps: {
    map: { title: "Find the right opportunity.", description: "Understand the process, the exceptions, and the cost of manual work. Define a clear scope and what success looks like." },
    build: { title: "Make it work in the real world.", description: "Build and test a focused pilot around your existing systems. Validate it with the people who will use it." },
    improve: { title: "Scale what works.", description: "Measure the results, refine the workflow, and expand with a clear plan for support and ownership." },
  } as const,
  principlesLabel: "Our delivery principles",
  principles: {
    fit: { title: "Built around your business", description: "Bespoke, standalone solutions that fit how you operate." },
    control: { title: "Clarity at every step", description: "Documented workflows, visible exceptions, and human control." },
    scale: { title: "Room to grow", description: "Start with one process. Expand as your needs evolve." },
  } as const,
  contactLabel: "Let's build something useful",
  contactTitle: "What's slowing your team down?",
  contactIntro: "Tell us about the process, the tools, and the bottleneck. We'll help you explore where automation can make a difference.",
};

export const metadata: Metadata = {
  title: { absolute: "Enigmatic Partners" },
  description: intro,
  openGraph: { title: "Enigmatic Partners", description: intro, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: "Enigmatic Partners", description: intro, images: ["/images/brand/brand-image.jpg"] },
};

export default function Home() {
  const t = copy;
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
        <h1 id="home-title">{t.headline}<br /><span>{t.headlineAccent}</span></h1>
        <div className={styles.heroBottom}>
          <p className={styles.lead}>{intro}</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={contact}>{t.contact}<ArrowRight size={17} /></a>
            <a className={styles.textLink} href="#in-practice">{t.explore}<ArrowDown size={16} /></a>
          </div>
        </div>
        <figure className={styles.industryPhoto}>
          <div className={styles.industryImage}>
            <Image
              src="/images/home/freight.jpg"
              alt="An aerial view of shipping containers and lanes in a freight terminal."
              fill
              sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1296px) calc(100vw - 96px), 1200px"
              className={styles.industryCrop}
            />
          </div>
          <figcaption>Behind every operation are people, processes, and work worth making simpler.</figcaption>
        </figure>
        <div className={styles.heroRule}><span>Enigmatic Partners</span><span>{t.mantra}</span></div>
      </section>

      <section id="in-practice" className={styles.demoSection} aria-labelledby="demo-title">
        <div className={styles.wrap}>
          <div className={styles.sectionTop}>
            <div><p className={styles.eyebrow}>{t.exampleLabel}</p><h2 id="demo-title">{t.exampleTitle}</h2></div>
            <p className={styles.sectionIntro}>{t.exampleIntro}</p>
          </div>
          <div className={styles.demo}>
            <div className={styles.demoBar}><span><span className={styles.statusDot} />{t.demoName}</span><span>{t.illustrative}</span></div>
            <div className={styles.demoBody}>
              <div className={styles.document}>
                <div className={styles.documentHeading}><FileText size={24} strokeWidth={1.3} /><span>{t.invoice}</span></div>
                <div className={styles.documentRule} />
                <div className={styles.documentRow}><span>{t.supplier}</span><strong>Acme Supply Co.</strong></div>
                <div className={styles.documentRow}><span>{t.reference}</span><strong>INV-2026-042</strong></div>
                <div className={styles.documentRow}><span>{t.total}</span><strong>$2,450.00</strong></div>
                <div className={styles.scanBand}><ScanText size={16} />{t.extracted}</div>
              </div>
              <ol className={styles.pipeline}>
                {stages.map((stage, index) => {
                  const Icon = stageIcons[index];
                  return <li key={stage}><div className={styles.stageIcon}><Icon size={20} strokeWidth={1.4} /></div><div><span className={styles.stageNumber}>0{index + 1}</span><h3>{t.stages[stage].title}</h3><p>{t.stages[stage].description}</p></div></li>;
                })}
              </ol>
            </div>
            <div className={styles.demoNote}><ShieldCheck size={17} /><p>{t.demoNote}</p></div>
          </div>
          <div className={styles.exampleFooter}><p>{t.exampleOutcome}</p><Link className={styles.textLink} href="/product/use-cases">{t.moreExamples}<ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="capabilities-title">
        <div className={styles.sectionTop}><div><p className={styles.eyebrow}>{t.capabilitiesLabel}</p><h2 id="capabilities-title">{t.capabilitiesTitle}</h2></div><Link className={styles.textLink} href="/services">{t.servicesLink}<ArrowRight size={16} /></Link></div>
        <div className={styles.capabilities}>{capabilities.map(({ key, icon: Icon }, index) => <article key={key} className={styles.capability}><div className={styles.capabilityTop}><Icon size={29} strokeWidth={1.2} /><span>0{index + 1}</span></div><h3>{t.capabilities[key].title}</h3><p>{t.capabilities[key].description}</p><div className={styles.capabilityExamples}>{t.capabilities[key].examples}</div></article>)}</div>
        <div className={styles.stack}><p>{t.stackIntro}</p><div><span>React</span><span>Node.js</span><span className={styles.n8n}>n8n</span><span>Supabase</span></div><p>{t.stackNote}</p></div>
      </section>

      <section className={styles.approachSection} aria-labelledby="approach-title"><div className={`${styles.wrap} ${styles.approach}`}>
        <div><p className={styles.eyebrow}>{t.approachLabel}</p><h2 id="approach-title">{t.approachTitle}</h2><p className={styles.sectionIntro}>{t.approachIntro}</p><Link className={styles.textLink} href="/services">{t.approachLink}<ArrowRight size={16} /></Link>
          <div className={styles.approachPhoto}>
            <Image
              src="/images/home/stat3.jpg"
              alt="A person working on a laptop at a desk, viewed from above."
              fill
              sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 112px) / 2), (max-width: 1296px) calc((100vw - 196px) / 2), 550px"
              className={styles.approachCrop}
            />
          </div>
        </div>
        <ol className={styles.steps}>{(["map", "build", "improve"] as const).map((step, index) => <li key={step}><span>0{index + 1}</span><div><h3>{t.steps[step].title}</h3><p>{t.steps[step].description}</p></div></li>)}</ol>
      </div></section>

      <section className={`${styles.wrap} ${styles.principles}`} aria-label={t.principlesLabel}>
        {(["fit", "control", "scale"] as const).map(key => <div key={key}><Check size={18} /><div><h3>{t.principles[key].title}</h3><p>{t.principles[key].description}</p></div></div>)}
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-title"><div className={styles.wrap}>
        <p className={styles.eyebrow}>{t.contactLabel}</p><h2 id="contact-title">{t.contactTitle}</h2><div className={styles.contactBottom}><p>{t.contactIntro}</p><a className={styles.primary} href={contact}>{t.contact}<ArrowRight size={17} /></a></div>
      </div></section>
    </div>
  );
}
