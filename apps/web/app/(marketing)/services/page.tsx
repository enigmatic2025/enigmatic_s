import { ArrowRight, Layers3, Plus, ScanText, Workflow } from "lucide-react";
import { PageHero, EditorialPhoto, ContactBand, contactHref, styles } from "@/components/marketing/editorial";

const h = {
  contact: "Discuss your process",
  capabilitiesTitle: "Practical technology. Powerful possibilities.",
  capabilities: {
    automation: { title: "Connected workflows", description: "Connect the tools you already use and automate the steps between them. n8n brings your systems, rules, and people together.", examples: "Approvals · Onboarding · System integration" },
    ai: { title: "AI that does useful work", description: "Bring intelligence to document-heavy and information-heavy processes, with validation and human oversight built in.", examples: "Document processing · Classification · Triage" },
    applications: { title: "Software that fits", description: "Give your team a clear interface for the work that matters. Bespoke applications built around your process and connected to your data.", examples: "Internal tools · Operational portals · Dashboards" },
  } as const,
  approachLabel: "03 / How we work",
  approachTitle: "Map. Build. Improve.",
};

const e = {
  title: "Better processes.",
  accent: "Built for your business.",
  intro: "From the first process map to a working solution, we bring consulting, AI, and engineering together to make your operations run better.",
  photoAlt: "Glass office towers viewed from street level.",
  deliveryIntro: "A clear path from understanding the problem to building and improving the solution. Explore each stage for its scope, deliverables, and tools.",
  engineeringNote: "Build a focused pilot, validate it with your team, and expand what works. Each stage connects the design to day-to-day operations.",
  beforeWeBegin: "Before we begin",
};

const phases = {
  consulting: "Consulting",
  consultingNote: "We begin by understanding the operational reality behind your challenge and clarifying the strategic path forward before any build work begins.",
  engineering: "Engineering",
};

const steps = [
  {
    title: "Executive Alignment",
    description: "Establish clear transformation objectives and secure executive sponsorship to drive organizational buy-in and target operational goals.",
    deliverables: ["Measurable transformation objectives", "EBITDA or operational target definition", "Executive sponsorship agreement"],
    tools: ["PDF"],
  },
  {
    title: "Diagnostic & Financial Modeling",
    description: "Map current systems and workflows to identify bottlenecks, building a financial baseline and transformation thesis with quantified impact.",
    deliverables: ["Current-state process maps", "System architecture diagram", "Financial baseline model", "Bottleneck analysis", "Transformation thesis"],
    tools: ["Lucid Chart", "Excel", "SQL", "BPMN 2.0", "PDF"],
  },
  {
    title: "Future State Architecture",
    description: "Design the target operating model, including technology blueprints, workflow redesigns, and governance structures for scalable operations.",
    deliverables: ["Future-state operating model", "Workflow redesigns", "Technology blueprint", "Governance model", "Change rollout plan"],
    tools: ["BPMN 2.0", "Lucid Chart", "PDF"],
  },
  {
    title: "Solution Engineering & Pilot",
    description: "Validate the solution through a limited-scope pilot. We engineer bespoke standalone solutions that are designed around your current systems, goals, and operating constraints.",
    deliverables: ["Custom environment configuration", "Working pilot solution", "KPI tracking dashboard", "Adoption measurement report"],
    tools: ["n8n", "React", "Node.JS", "Supabase", "Power BI", "PDF"],
  },
  {
    title: "Scaled Rollout",
    description: "Expand successful workflows across departments and locations, institutionalizing governance to ensure full solution adoption.",
    deliverables: ["Multi-department workflow expansion", "Institutionalized governance playbook", "Full solution adoption"],
    tools: ["n8n", "React", "Node.JS", "Supabase", "Power BI"],
  },
  {
    title: "Continuous Optimization",
    description: "Provide ongoing white-glove support and quarterly reviews to refined the solution and drive continuous improvement.",
    deliverables: ["Quarterly solution reviews", "Optimization roadmap", "Performance improvement report"],
    tools: ["Power BI", "PDF"],
  },
];

const faqItems = [
  { question: "How do engagements work?", answer: "We assign a dedicated consultant to serve as your strategic partner and primary point of contact. They coordinate the entire diagnostic and design process, working directly with Enigmatic's engineering team to build, test, and deploy your custom solution." },
  { question: "Do I need a platform or off-the-shelf system?", answer: "No. We build bespoke standalone solutions that fit your current infrastructure, teams, and operating model. Our work is designed to solve the gap directly without forcing a platform adoption or a software rip-and-replace." },
  { question: "How long does a typical engagement take?", answer: "Timelines vary by scope, but we move fast. A typical diagnostic phase completes in 2-3 weeks, and we aim to have a pilot solution live within 6-8 weeks. Our goal is to deliver measurable value in a single quarter." },
  { question: "Does this require replacing our current software?", answer: "Rarely. Our philosophy is to connect and orchestrate, not rip and replace. We build the \"missing middle\" that bridges your ERP, CRM, and legacy systems to close gaps in your operations." },
  { question: "What happens after the pilot?", answer: "Once the pilot validates the ROI, we move to a scaled rollout. We help you institutionalize the solution across departments and provide ongoing support. You can choose to manage it internally or retain our team for continuous optimization." },
  { question: "How do you handle data security?", answer: "Security is paramount. We design architectures that respect your data sovereignty. Whether your solution is a fully custom standalone build or a tightly integrated environment, we adhere to strict enterprise security standards and can deploy within your private cloud environment if required." },
];

export default function ServicesPage() {
  return <div className={styles.page}>
    <PageHero title={e.title} accent={e.accent} description={e.intro}>
      <a className={styles.primary} href={contactHref}>{h.contact}<ArrowRight size={17} /></a>
    </PageHero>
    <EditorialPhoto src="/images/home/corporate.jpg" alt={e.photoAlt} />
    <section className={`${styles.wrap} ${styles.section}`}>
      <div className={styles.sectionHeading}><h2>{h.capabilitiesTitle}</h2></div>
      <div className={styles.serviceGrid}>{([{key:"automation",icon:Workflow},{key:"ai",icon:ScanText},{key:"applications",icon:Layers3}] as const).map(({key,icon:Icon}) => <article className={styles.serviceCard} key={key}><Icon size={30} strokeWidth={1.2} /><h3>{h.capabilities[key].title}</h3><p>{h.capabilities[key].description}</p><small>{h.capabilities[key].examples}</small></article>)}</div>
    </section>
    <section className={styles.tinted}><div className={`${styles.wrap} ${styles.section} ${styles.split}`}>
      <div><p className={styles.eyebrow}>{h.approachLabel}</p><h2>{h.approachTitle}</h2><p className={styles.bodyCopy}>{e.deliveryIntro}</p></div>
      <div>{(["consulting","engineering"] as const).map((phase, phaseIndex) => <div className={styles.phase} key={phase}>
        <h3>{phases[phase]}</h3><p>{phaseIndex === 0 ? phases.consultingNote : e.engineeringNote}</p>
        {(phaseIndex === 0 ? steps.slice(0, 3) : steps.slice(3)).map((step, i) => {
          const stepNumber = phaseIndex === 0 ? i + 1 : i + 4;
          return <details className={styles.disclosure} key={step.title} open={phaseIndex === 0 ? stepNumber === 1 : stepNumber === 4}>
          <summary><span>0{stepNumber}</span><h3>{step.title}</h3><Plus size={18} /></summary>
          <div className={styles.disclosureBody}><p>{step.description}</p><div className={styles.deliverables}>
            <div><h4>Deliverables</h4><ul>{step.deliverables.map(item => <li key={item}>{item}</li>)}</ul></div>
            <div><h4>Tools</h4><div className={styles.tags}>{step.tools.map(item => <span key={item}>{item}</span>)}</div></div>
          </div></div>
        </details>;
        })}
      </div>)}</div>
    </div></section>
    <section className={`${styles.wrap} ${styles.section} ${styles.split}`}><div><p className={styles.eyebrow}>{e.beforeWeBegin}</p><h2>Frequently Asked Questions</h2></div><div>
      {faqItems.map(item => <details className={styles.disclosure} key={item.question}><summary><h3>{item.question}</h3><Plus size={18} /></summary><div className={styles.disclosureBody}><p>{item.answer}</p></div></details>)}
    </div></section>
    <ContactBand />
  </div>;
}
