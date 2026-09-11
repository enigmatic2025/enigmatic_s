import { ArrowRight } from "lucide-react";
import { capabilities, capabilitiesTitle } from "@/lib/content";
import { contactHref, contactLabel } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/list-items";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { Tag } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { SplitSection } from "@/components/marketing/split-section";

const steps = [
  {
    title: "Executive Alignment",
    description: "Establish clear transformation objectives and secure executive sponsorship to drive organizational buy-in and target operational goals.",
    deliverables: ["Measurable transformation objectives", "EBITDA or operational target definition", "Executive sponsorship agreement"],
    tools: [],
  },
  {
    title: "Diagnostic & Financial Modeling",
    description: "Map current systems and workflows to identify bottlenecks, building a financial baseline and transformation thesis with quantified impact.",
    deliverables: ["Current-state process maps", "System architecture diagram", "Financial baseline model", "Bottleneck analysis", "Transformation thesis"],
    tools: ["Lucid Chart", "Excel", "SQL", "BPMN 2.0"],
  },
  {
    title: "Future State Architecture",
    description: "Design the target operating model, including technology blueprints, workflow redesigns, and governance structures for scalable operations.",
    deliverables: ["Future-state operating model", "Workflow redesigns", "Technology blueprint", "Governance model", "Change rollout plan"],
    tools: ["BPMN 2.0", "Lucid Chart"],
  },
  {
    title: "Solution Engineering & Pilot",
    description: "Validate the solution through a limited-scope pilot. We engineer bespoke standalone solutions that are designed around your current systems, goals, and operating constraints.",
    deliverables: ["Custom environment configuration", "Working pilot solution", "KPI tracking dashboard", "Adoption measurement report"],
    tools: ["Next.js", "Express", "Supabase", "n8n", "SQL"],
  },
  {
    title: "Deployment & Rollout",
    description: "Take the validated solution to production and expand it across departments and locations, with the monitoring and documentation your team needs to rely on it.",
    deliverables: ["Production deployment", "Monitoring and alerting", "Multi-department rollout", "Runbooks and team training"],
    tools: ["Next.js", "Express", "Supabase", "n8n"],
  },
  {
    title: "Support & Optimization",
    description: "Ongoing maintenance, updates, and quarterly reviews keep the solution healthy and improving as your business changes.",
    deliverables: ["Maintenance and updates", "Quarterly solution reviews", "Optimization roadmap"],
    tools: ["Dashboards", "SQL"],
  },
];

const phases = [
  { title: "Consulting", note: "We begin by understanding the operational reality behind your challenge and clarifying the strategic path forward before any build work begins.", steps: steps.slice(0, 3), offset: 1 },
  { title: "Engineering", note: "Build a focused pilot, validate it with your team, then deploy, support, and expand what works. Each stage connects the design to day-to-day operations.", steps: steps.slice(3), offset: 4 },
];

const faqItems = [
  { question: "How do engagements work?", answer: "We assign a dedicated consultant to serve as your strategic partner and primary point of contact. They coordinate the entire diagnostic and design process, working directly with Enigmatic's engineering team to build, test, and deploy your custom solution." },
  { question: "Do I need a platform or off-the-shelf system?", answer: "No. We build bespoke standalone solutions that fit your current infrastructure, teams, and operating model. Our work is designed to solve the gap directly without forcing a platform adoption or a software rip-and-replace." },
  { question: "How long does a typical engagement take?", answer: "Timelines vary by scope, but we move fast. A typical diagnostic phase completes in 2-3 weeks, and we aim to have a pilot solution live within 6-8 weeks. Our goal is to deliver measurable value in a single quarter." },
  { question: "Does this require replacing our current software?", answer: "Rarely. Our philosophy is to connect and orchestrate, not rip and replace. We build the \"missing middle\" that bridges your ERP, CRM, and legacy systems to close gaps in your operations." },
  { question: "What happens after the pilot?", answer: "Once the pilot validates the ROI, we move to a scaled rollout. We help you institutionalize the solution across departments and provide ongoing support. You can choose to manage it internally or retain our team for continuous optimization." },
  { question: "What technology do you use?", answer: "Our core stack is Next.js for applications, Express for APIs and integrations, Supabase for data, and n8n for workflow automation. We work open-source first and check licensing for every tool we bring in. When it makes more sense, we build on the cloud and platforms you already run." },
  { question: "Do you support what you build?", answer: "Yes. We deploy to production, set up monitoring, and offer maintenance and improvement plans after launch. If you'd rather own it in-house, we hand over documentation and train your team." },
  { question: "How do you handle data security?", answer: "Security is paramount. We design architectures that respect your data sovereignty. Whether your solution is a fully custom standalone build or a tightly integrated environment, we adhere to strict enterprise security standards and can deploy within your private cloud environment if required." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="Better processes."
        accent="Built for your business."
        description="From the first process map to a deployed, supported solution, we bring consulting, data engineering, and software development together to make your operations run better."
        actions={<Button asChild><a href={contactHref}>{contactLabel}<ArrowRight size={17} /></a></Button>}
      >
        <Media src="/images/home/corporate.jpg" alt="Glass office towers viewed from street level." priority scrim className="h-[clamp(240px,30vw,380px)]" />
      </PageHero>

      <Section aria-labelledby="capabilities-title">
        <SectionHeader id="capabilities-title" title={capabilitiesTitle} />
        <FeatureGrid items={capabilities} />
      </Section>

      <SplitSection
        tone="raised"
        label="How we work"
        title="Map. Build. Improve."
        intro="A clear path from understanding the problem to building and improving the solution. Explore each stage for its scope, deliverables, and tools."
      >
        <div className="space-y-10">
          {phases.map(phase => (
            <div key={phase.title}>
              <Heading as="h3" size="sm" className="mb-3 text-brand-violet">{phase.title}</Heading>
              <Text size="sm" className="mb-6">{phase.note}</Text>
              {phase.steps.map((step, i) => (
                <Disclosure key={step.title} number={phase.offset + i} title={step.title} defaultOpen={i === 0}>
                  <Text>{step.description}</Text>
                  <div className="mt-6 grid gap-6 sm:grid-cols-[1.5fr_1fr]">
                    <div>
                      <h4 className="mb-3 text-eyebrow text-foreground">Deliverables</h4>
                      <ul className="list-disc space-y-1 pl-4 text-body-sm text-muted-foreground marker:text-subtle">
                        {step.deliverables.map(item => <li key={item}>{item}</li>)}
                      </ul>
                    </div>
                    {step.tools.length > 0 && (
                      <div>
                        <h4 className="mb-3 text-eyebrow text-foreground">Tools</h4>
                        <div className="flex flex-wrap gap-1.5">{step.tools.map(tool => <Tag key={tool}>{tool}</Tag>)}</div>
                      </div>
                    )}
                  </div>
                </Disclosure>
              ))}
            </div>
          ))}
        </div>
      </SplitSection>

      <SplitSection label="Before we begin" title="Frequently asked questions">
        {faqItems.map(item => (
          <Disclosure key={item.question} title={item.question}><Text>{item.answer}</Text></Disclosure>
        ))}
      </SplitSection>

      <ContactBand />
    </>
  );
}
