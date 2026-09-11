import { ArrowRight } from "lucide-react";
import { services, servicesTitle } from "@/lib/content";
import { contactHref, contactLabel } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/list-items";
import { ParallaxPhoto } from "@/components/marketing/parallax-photo";
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
  { question: "How do we know automation is worth the investment?", answer: "We start by understanding what the process costs today: time spent, errors, delays, and missed capacity. Then we weigh the potential benefits against the cost of building and running a solution. You get a prioritized business case, with assumptions made clear, so you can decide which opportunities are worth funding." },
  { question: "What does an engagement cost, and how is it scoped?", answer: "Cost depends on the processes involved, the systems we need to connect, and the complexity of delivery. We define the scope, deliverables, and pricing with you before work begins. Strategy establishes the business case and roadmap, giving you a basis for deciding how much to invest in delivery." },
  { question: "How much time will you need from our team?", answer: "We'll need a process owner, people who do the work, and access to the relevant systems or IT contacts. Their involvement is focused on mapping the current process, reviewing the proposed approach, and testing the solution. We agree on those touchpoints up front so your team can plan around day-to-day responsibilities." },
  { question: "Can we end the engagement after strategy?", answer: "Ideally, we build what we design. But you can end the engagement after the strategy phase, with no obligation to continue into delivery. You'll leave with a prioritized roadmap, business case, and solution blueprint that your internal team or another partner can use to move forward." },
  { question: "How quickly can we expect measurable results?", answer: "Timing depends on scope, access to your systems, and data readiness. We start with a focused pilot and agree on success measures before building, such as hours saved, faster turnaround, or fewer errors. The pilot lets you compare results against the current process before committing to a wider rollout." },
  { question: "Can you work with our existing systems?", answer: "Yes. We design around the systems your team already uses and assess integration options during strategy. If a system limitation or data issue affects feasibility, cost, or timing, we make that clear before delivery so you can weigh the options." },
  { question: "What happens if the assessment or pilot shows it isn't worth pursuing?", answer: "That is a useful outcome, too. We review the evidence with you and recommend stopping, narrowing the scope, or pursuing a stronger opportunity. Each phase gives you a decision point, so further investment depends on a business case that still holds up." },
  { question: "Who owns and maintains the solution after launch?", answer: "We agree on ownership, access, and any third-party licensing as part of the engagement scope. After launch, we can provide managed operations, including monitoring, maintenance, and improvements. If your team will run the solution, we hand over documentation and provide training, with ongoing responsibilities made clear." },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        title="From strategy."
        accent="To automation that lasts."
        description="Automation strategy, process automation, AI, and data: one partner from the first assessment to a solution your teams rely on."
        actions={<Button asChild><a href={contactHref}>{contactLabel}<ArrowRight size={17} /></a></Button>}
        media={<ParallaxPhoto src="/images/home/freight.jpg" alt="An aerial view of shipping containers in a freight terminal." />}
      />

      <Section aria-labelledby="services-title">
        <SectionHeader id="services-title" title={servicesTitle} />
        <ServiceList items={services} showExamples />
      </Section>

      <SplitSection
        tone="inverse"
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

      <SplitSection title="Frequently asked questions">
        {faqItems.map(item => (
          <Disclosure key={item.question} title={item.question}><Text>{item.answer}</Text></Disclosure>
        ))}
      </SplitSection>

      <ContactBand />
    </>
  );
}
