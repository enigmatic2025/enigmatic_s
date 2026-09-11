import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, FileText, GitBranch, ScanText, ShieldCheck } from "lucide-react";
import { capabilities, capabilitiesTitle, principles, stack, stackNote, stackTitle } from "@/lib/content";
import { contactHref, contactLabel, siteDescription, siteName } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { NumberedItem } from "@/components/ui/list-items";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { Panel, Tag } from "@/components/ui/surface";
import { Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { FeatureGrid, PrinciplesRow } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { SplitSection } from "@/components/marketing/split-section";
import { StackGrid } from "@/components/marketing/stack-grid";

const intro = siteDescription;

const stages = [
  { key: "receive", icon: FileText, tone: "blue", title: "Receive", description: "A document arrives by email, upload, or a connected system." },
  { key: "extract", icon: ScanText, tone: "violet", title: "Extract", description: "AI reads the document and pulls out the fields that matter." },
  { key: "review", icon: ShieldCheck, tone: "violet", title: "Validate", description: "Business rules check the data. Exceptions go to your team." },
  { key: "sync", icon: GitBranch, tone: "pink", title: "Put it to work", description: "Approved data updates your systems and triggers the next step." },
] as const;

const steps = [
  { key: "map", title: "Find the right opportunity.", description: "Understand the process, the exceptions, and the cost of manual work. Define a clear scope and what success looks like." },
  { key: "build", title: "Make it work in the real world.", description: "Build and test a focused pilot around your existing systems. Validate it with the people who will use it." },
  { key: "run", title: "Deploy, support, and improve.", description: "Take it to production, monitor and maintain it, and expand what works with a clear plan for ownership." },
];

const invoiceFields = [
  ["Supplier", "Acme Supply Co."],
  ["Invoice number", "INV-2026-042"],
  ["Total", "$2,450.00"],
];

export const metadata: Metadata = {
  title: { absolute: siteName },
  description: intro,
  openGraph: { title: siteName, description: intro, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: siteName, description: intro, images: ["/images/brand/brand-image.jpg"] },
};

export default function Home() {
  return (
    <>
      <PageHero
        title="Less busywork."
        accent="More possibility."
        description={intro}
        actions={<>
          <Button asChild><a href={contactHref}>{contactLabel}<ArrowRight size={17} /></a></Button>
          <Button asChild variant="link"><a href="#in-practice">See a workflow in practice<ArrowDown size={16} /></a></Button>
        </>}
      >
        <Media
          src="/images/home/freight.jpg"
          alt="An aerial view of shipping containers and lanes in a freight terminal."
          priority
          scrim
          className="h-60 sm:h-[clamp(280px,29vw,380px)]"
          caption="Behind every operation are people, processes, and work worth making simpler."
        />
        <div className="mt-6 flex justify-between gap-6 border-t border-border pt-5 text-caption text-subtle">
          <span>{siteName}</span><span>Map. Build. Improve.</span>
        </div>
      </PageHero>

      <Section id="in-practice" tone="raised" pad="md" aria-labelledby="demo-title" className="scroll-mt-(--header-height)">
        <SectionHeader
          id="demo-title"
          label="01 / A workflow in practice"
          title="From incoming document to work done."
          description="An invoice intake workflow: documents become validated data and dependable next steps, with people reviewing the exceptions."
        />
        <Panel variant="inset">
          <div className="flex flex-wrap justify-between gap-4 border-b border-border px-4 py-4 text-caption sm:px-6">
            <span className="flex items-center gap-2.5"><span aria-hidden className="size-1.5 rounded-full bg-brand-violet" />Invoice intake workflow</span>
            <span className="text-subtle">Illustrative workflow · Sample data</span>
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
              <Tag tone="violet" className="mt-6 w-full justify-start rounded-sm px-2.5 py-2"><ScanText size={14} aria-hidden />Fields extracted for validation</Tag>
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

      <Section aria-labelledby="capabilities-title">
        <SectionHeader
          id="capabilities-title"
          label="02 / What we build"
          title={capabilitiesTitle}
          action={<Button asChild variant="link"><Link href="/services">Explore our services<ArrowRight size={16} /></Link></Button>}
        />
        <FeatureGrid items={capabilities} />
      </Section>

      <Section pad="md" className="pt-0 sm:pt-0 lg:pt-0" aria-labelledby="stack-title">
        <SectionHeader id="stack-title" label="03 / How it's built" title={stackTitle} />
        <StackGrid items={stack} note={stackNote} />
      </Section>

      <SplitSection
        tone="raised"
        label="04 / How we work"
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

      <Section pad="md" aria-label="Our delivery principles">
        <PrinciplesRow items={principles} />
      </Section>

      <ContactBand />
    </>
  );
}
