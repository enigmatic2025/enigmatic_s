import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, FileText, GitBranch, ScanText, ShieldCheck } from "lucide-react";
import { capabilities, capabilitiesIntro, capabilitiesNote, capabilitiesTitle, principles, principlesTitle, services, servicesTitle, techNote, techStack } from "@/lib/content";
import { getInsightPosts } from "@/lib/insights-data";
import { contactHref, contactLabel, siteDescription, siteName } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { NumberedItem } from "@/components/ui/list-items";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { Panel, Tag } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import { ArticleRow } from "@/components/marketing/articles";
import { CapabilityGrid } from "@/components/marketing/capability-grid";
import { ContactBand } from "@/components/marketing/contact-band";
import { PrinciplesRow } from "@/components/marketing/principles-row";
import { ServiceList } from "@/components/marketing/service-list";
import { ParallaxPhoto } from "@/components/marketing/parallax-photo";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { SplitSection } from "@/components/marketing/split-section";
import { TechMarquee } from "@/components/marketing/tech-marquee";

const intro = "We solve business problems with automation: from the first process map to systems that run on their own, with AI and data where they make the biggest difference.";

const stages = [
  { key: "receive", icon: FileText, tone: "blue", title: "Receive", description: "A document arrives by email, upload, or a connected system." },
  { key: "extract", icon: ScanText, tone: "violet", title: "Extract", description: "AI reads the document and pulls out the fields that matter." },
  { key: "review", icon: ShieldCheck, tone: "violet", title: "Validate", description: "Business rules check the data. Exceptions go to your team." },
  { key: "sync", icon: GitBranch, tone: "pink", title: "Put it to work", description: "Approved data updates your systems and triggers the next step." },
] as const;

const steps = [
  { key: "map", title: "Find what's worth automating.", description: "Understand the process, the data, and the cost of manual work. Prioritize the opportunities with a clear return and define what success looks like." },
  { key: "build", title: "Make it work in the real world.", description: "Build a focused pilot around your existing systems, and validate it with the people who will use it." },
  { key: "run", title: "Deploy, support, and improve.", description: "Take it to production, monitor and maintain it, and expand what works with a clear plan for ownership." },
];

const invoiceFields = [
  ["Supplier", "Acme Supply Co."],
  ["Invoice number", "INV-2026-042"],
  ["Total", "$2,450.00"],
];

export const metadata: Metadata = {
  title: { absolute: `${siteName} | Intelligent Automation Consulting` },
  description: siteDescription,
  openGraph: { title: siteName, description: siteDescription, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription, images: ["/images/brand/brand-image.jpg"] },
};

export default function Home() {
  const [latest] = getInsightPosts();
  return (
    <>
      <PageHero
        title="Less busywork."
        accent="More possibility."
        description={intro}
        media={<ParallaxPhoto src="/images/home/corporate.jpg" alt="Glass office towers viewed from street level." />}
        actions={<>
          <Button asChild><a href={contactHref}>{contactLabel}<ArrowRight size={17} /></a></Button>
          <Button asChild variant="link"><a href="#in-practice">See automation in practice<ArrowDown size={16} /></a></Button>
        </>}
      >
        <TechMarquee items={techStack} label="Built on open technology" note={techNote} />
      </PageHero>

      <Section aria-labelledby="services-title">
        <SectionHeader
          id="services-title"
          title={servicesTitle}
          action={<Button asChild variant="link"><Link href="/services">Explore our services<ArrowRight size={16} /></Link></Button>}
        />
        <ServiceList items={services} />
      </Section>

      <Section id="in-practice" tone="raised" pad="md" aria-labelledby="demo-title" className="scroll-mt-(--header-height)">
        <SectionHeader
          id="demo-title"
          title="From incoming document to work done."
          description="Documents arrive, AI extracts the data, rules validate it, and the process moves on its own. People review only the exceptions."
        />
        <Panel variant="inset">
          <div className="flex flex-wrap justify-between gap-4 border-b border-border px-4 py-4 text-caption sm:px-6">
            <span className="flex items-center gap-2.5"><span aria-hidden className="size-1.5 rounded-full bg-brand-violet" />Invoice intake process</span>
            <span className="text-subtle">Illustrative process · Sample data</span>
          </div>
          <div className="grid items-center gap-9 bg-dot-grid px-5 py-7 sm:p-8 md:grid-cols-[240px_1fr] lg:grid-cols-[290px_1fr] lg:gap-14 lg:p-11">
            <Panel className="w-full max-w-[290px] justify-self-center p-6 md:-rotate-2">
              <div className="flex items-center gap-3 text-body"><FileText size={22} strokeWidth={1.4} className="text-brand-violet" aria-hidden />Supplier invoice</div>
              <div className="my-6 h-px bg-border" />
              <dl className="space-y-4">
                {invoiceFields.map(([label, value]) => (
                  <div key={label} className="text-caption"><dt className="text-subtle">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>
                ))}
              </dl>
              <Tag tone="violet" className="mt-6 w-full justify-start rounded-sm px-2.5 py-2"><ScanText size={14} aria-hidden />Fields extracted by AI</Tag>
            </Panel>
            <ol className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {stages.map((stage, i) => (
                <NumberedItem key={stage.key} index={i + 1} icon={stage.icon} tone={stage.tone} size="sm" title={stage.title}>{stage.description}</NumberedItem>
              ))}
            </ol>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-4 text-caption text-muted-foreground sm:px-6">
            <ShieldCheck size={16} aria-hidden className="shrink-0 text-brand-violet" />
            Human review where it matters. Clear rules for everything that follows.
          </div>
        </Panel>
        <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <Text size="sm">Less rekeying. Fewer handoffs. A process your team can follow.</Text>
          <Button asChild variant="link"><Link href="/use-cases">Explore use cases<ArrowRight size={16} /></Link></Button>
        </div>
      </Section>

      <Section tone="inverse" aria-labelledby="capabilities-title">
        <SectionHeader id="capabilities-title" title={capabilitiesTitle} description={capabilitiesIntro} />
        <CapabilityGrid items={capabilities} note={capabilitiesNote} />
      </Section>

      <SplitSection
        tone="raised"
        title="Map. Build. Improve."
        intro="Start with a worthwhile problem. Build a focused solution. Improve it as your business grows."
        aside={<>
          <Button asChild variant="link" className="mt-7"><Link href="/services">Our delivery approach<ArrowRight size={16} /></Link></Button>
          <Media
            src="/images/home/stat3.jpg"
            alt="A person working on a laptop at a desk, viewed from above."
            sizes="half"
            className="mt-8 aspect-video md:aspect-[2/1]"
          />
        </>}
      >
        <ol>
          {steps.map((step, i) => <NumberedItem key={step.key} index={i + 1} title={step.title} divided>{step.description}</NumberedItem>)}
        </ol>
      </SplitSection>

      <Section aria-labelledby="principles-title">
        <SectionHeader id="principles-title" title={principlesTitle} />
        <PrinciplesRow items={principles} />
      </Section>

      {latest && (
        <Section className="pt-0 sm:pt-0 lg:pt-0" aria-labelledby="insights-title">
          <SectionHeader
            id="insights-title"
            title="Latest perspective"
            action={<Button asChild variant="link"><Link href="/insights">All insights<ArrowRight size={16} /></Link></Button>}
          />
          <ArticleRow post={latest} />
        </Section>
      )}

      <ContactBand />
    </>
  );
}
