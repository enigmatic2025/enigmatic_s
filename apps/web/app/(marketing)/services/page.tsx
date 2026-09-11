import { ArrowRight } from "lucide-react";
import { services, servicesTitle } from "@/lib/content";
import { contactHref, contactLabel } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/list-items";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { ServiceList } from "@/components/marketing/service-list";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { SplitSection } from "@/components/marketing/split-section";

const steps = [
  {
    title: "Opportunity Assessment",
    description: "Map how work really gets done today, where time and money are lost, and where automation could make the biggest difference.",
    deliverables: ["Current-state process maps", "Pain-point and cost analysis", "Long list of automation opportunities"],
    outcome: "A shared, fact-based view of where to focus.",
  },
  {
    title: "Readiness & Business Case",
    description: "Check whether your data, systems, and teams are ready, and quantify the return for the opportunities that matter most.",
    deliverables: ["Data and systems readiness review", "Prioritized use cases", "Business case and ROI model"],
    outcome: "A short list your leadership can confidently fund.",
  },
  {
    title: "Roadmap & Solution Design",
    description: "Design the future-state process, the role automation and AI play in it, and the controls that keep people in charge.",
    deliverables: ["Future-state process design", "Solution blueprint", "Governance and human-review model", "Phased roadmap"],
    outcome: "A clear plan from first pilot to full rollout.",
  },
  {
    title: "Pilot",
    description: "Build a focused pilot around your existing systems and prove it with the people who will use it every day.",
    deliverables: ["Working pilot solution", "Success metrics and baseline", "User feedback and adoption report"],
    outcome: "Measured results before you scale.",
  },
  {
    title: "Deployment & Scale",
    description: "Take what works to production and expand it across teams and locations, with the monitoring and training that make it stick.",
    deliverables: ["Production deployment", "Monitoring and alerting", "Rollout across teams", "Training and runbooks"],
    outcome: "A solution your organization relies on.",
  },
  {
    title: "Managed Operations",
    description: "We keep automations, models, and integrations accurate and healthy, and review performance with you every quarter.",
    deliverables: ["Maintenance and updates", "Quarterly performance reviews", "Improvement roadmap"],
    outcome: "Results that keep improving over time.",
  },
];

const phases = [
  { title: "Strategy", note: "Understand the operational reality, find the opportunities worth pursuing, and build the case before anything is built.", steps: steps.slice(0, 3), offset: 1 },
  { title: "Delivery", note: "Pilot, deploy, and run solutions that connect the plan to day-to-day work, then keep improving them.", steps: steps.slice(3), offset: 4 },
];

const faqItems = [
  { question: "Where should we start?", answer: "With the work, not the technology. We begin with a short assessment of your processes to find the opportunities with a clear, measurable return, then pilot the strongest one before committing to more." },
  { question: "Do we need perfect data first?", answer: "No. Most organizations start with imperfect data. Part of our readiness review is identifying what's good enough to start with, and what needs to be cleaned up or connected as you scale." },
  { question: "Will automation replace our people?", answer: "Our goal is to take repetitive work off your team's plate, not to remove the judgment and relationships that make your business run. We design every solution with people approving what matters and handling the exceptions." },
  { question: "Is every solution AI-powered?", answer: "No. We use the simplest technology that solves the problem. Often that's straightforward automation; AI comes in where it adds real value, like reading documents or forecasting demand." },
  { question: "How do you keep automation accurate and secure?", answer: "Every solution includes validation rules, human review where it matters, and monitoring in production. Security and privacy are designed in from day one, and solutions can run in environments you control, including your own cloud." },
  { question: "Which technology do you use?", answer: "We're model- and platform-agnostic. We choose proven AI models and open-source tools for each job, check licensing before anything goes into your environment, and build on the systems and cloud platforms you already run." },
  { question: "How long until we see results?", answer: "Timelines vary by scope, but we move fast. An assessment typically takes 2–3 weeks, and we aim to have a pilot live within 6–8 weeks, with measurable value in a single quarter." },
  { question: "Do you support what you build?", answer: "Yes. We deploy to production, set up monitoring, and offer managed operations after launch. If you'd rather run it in-house, we hand over documentation and train your team." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        label="Services"
        title="From strategy."
        accent="To automation that lasts."
        description="Automation strategy, process automation, AI, and data: one partner from the first assessment to a solution your teams rely on."
        actions={<Button asChild><a href={contactHref}>{contactLabel}<ArrowRight size={17} /></a></Button>}
      >
        <Media src="/images/home/energy.jpg" alt="Offshore wind turbines on a calm sea." priority scrim className="h-[clamp(240px,30vw,380px)]" />
      </PageHero>

      <Section aria-labelledby="services-title">
        <SectionHeader id="services-title" title={servicesTitle} />
        <ServiceList items={services} showExamples />
      </Section>

      <SplitSection
        tone="inverse"
        label="How we work"
        title="Map. Build. Improve."
        intro="A clear path from finding the right opportunity to running a solution that keeps improving. Explore each stage for its scope, deliverables, and outcome."
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
                    <div>
                      <h4 className="mb-3 text-eyebrow text-foreground">Outcome</h4>
                      <Text size="sm" tone="default">{step.outcome}</Text>
                    </div>
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
