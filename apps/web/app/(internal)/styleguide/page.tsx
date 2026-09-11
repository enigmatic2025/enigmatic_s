import type { Metadata } from "next";
import { ArrowRight, FileText, GitBranch, ScanText } from "lucide-react";
import { capabilities, capabilitiesNote, principles, services, techNote, techStack } from "@/lib/content";
import { accentTones, type Tone } from "@/lib/tones";
import { Button } from "@/components/ui/button";
import { Disclosure, NumberedItem } from "@/components/ui/list-items";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { IconTile, Panel, Tag } from "@/components/ui/surface";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { PrinciplesRow } from "@/components/marketing/principles-row";
import { ServiceList } from "@/components/marketing/service-list";
import { SectionHeader } from "@/components/marketing/section-header";
import { TechMarquee } from "@/components/marketing/tech-marquee";
import { CapabilityGrid } from "@/components/marketing/capability-grid";

export const metadata: Metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const colors = [
  ["background", "bg-background"],
  ["surface-1", "bg-surface-1"],
  ["surface-2", "bg-surface-2"],
  ["border", "bg-border"],
  ["border-strong", "bg-border-strong"],
  ["subtle", "bg-subtle"],
  ["muted-foreground", "bg-muted-foreground"],
  ["foreground", "bg-foreground"],
  ["brand-blue", "bg-brand-blue"],
  ["brand-violet", "bg-brand-violet"],
  ["brand-pink", "bg-brand-pink"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
] as const;

const typeScale = [
  ["display", "text-display", "Less busywork."],
  ["heading-cta", "text-heading-cta", "What's slowing your team down?"],
  ["heading-xl", "text-heading-xl", "From incoming document to work done."],
  ["title-lg", "text-title-lg", "Find what's worth automating"],
  ["title-md", "text-title-md", "How do engagements work?"],
  ["title-sm", "text-title-sm", "Built around your business"],
  ["lead", "text-lead text-muted-foreground", "Your intelligent automation partner."],
  ["body", "text-body text-muted-foreground", "Connect the tools you already use and automate the steps between them."],
  ["body-sm", "text-body-sm text-muted-foreground", "Documented processes, visible exceptions, and human control."],
  ["caption", "text-caption text-subtle", "Illustrative process · Sample data"],
  ["micro", "text-micro text-subtle", "Minimum size. Chips and diagram labels only."],
  ["eyebrow", "text-eyebrow text-muted-foreground", "01 / What we build"],
] as const;

const tones: Tone[] = [...accentTones, "success", "warning", "danger", "neutral"];

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 border-t border-border py-12 lg:grid-cols-[220px_1fr] lg:gap-12">
      <div>
        <Heading as="h2" size="sm">{title}</Heading>
        {note && <Text size="caption" tone="subtle" className="mt-2">{note}</Text>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main>
      <Section pad="md">
        <div className="flex items-center justify-between gap-4">
          <Eyebrow dot="violet">Internal · not indexed</Eyebrow>
          <ThemeToggle />
        </div>
        <Heading as="h1" size="display" accent="Enigmatic design system." className="mt-6">Style guide.</Heading>
        <Text size="lead" className="mt-8 max-w-[640px]">
          Every token lives in <code className="font-mono text-foreground">app/globals.css</code>, with a light set on <code className="font-mono text-foreground">:root</code> and a dark set on <code className="font-mono text-foreground">.dark</code>. Every page is built from the components below. If something new doesn&apos;t fit, add it here first.
        </Text>

        <div className="mt-14">
          <Block title="Color" note="Light and dark sets swap under the .dark class; use the toggle at the top to compare. Brand trio from the logo; status tones for diagrams only.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {colors.map(([name, cls]) => (
                <div key={name}>
                  <div className={`h-16 rounded-md border border-border ${cls}`} />
                  <p className="mt-2 font-mono text-micro text-muted-foreground">{name}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-16 rounded-md" style={{ background: "var(--gradient-brand)" }} />
            <p className="mt-2 font-mono text-micro text-muted-foreground">gradient-brand · headline accent only</p>
          </Block>

          <Block title="Type scale" note="Aspekta. Each step bundles size, line-height, tracking, and weight.">
            <div className="space-y-6">
              {typeScale.map(([name, cls, sample]) => (
                <div key={name} className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-baseline">
                  <span className="font-mono text-micro text-subtle">{name}</span>
                  <p className={`${cls} truncate`}>{sample}</p>
                </div>
              ))}
              <p className="text-display"><span className="text-gradient-brand">More possibility.</span></p>
            </div>
          </Block>

          <Block title="Radius" note="Crisp: 2px tags, 4px controls, 6px surfaces.">
            <div className="flex gap-6">
              {["rounded-xs", "rounded-sm", "rounded-md"].map(r => (
                <div key={r}><div className={`size-20 border border-border-strong bg-surface-1 ${r}`} /><p className="mt-2 font-mono text-micro text-muted-foreground">{r}</p></div>
              ))}
            </div>
          </Block>

          <Block title="Button" note="primary · secondary · ghost · link, sizes sm / md / lg.">
            <div className="flex flex-wrap items-center gap-4">
              <Button>Discuss your process<ArrowRight size={16} /></Button>
              <Button variant="secondary">Secondary<ArrowRight size={16} /></Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Text link<ArrowRight size={16} /></Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button><Button size="md">Medium</Button><Button size="lg">Large</Button>
            </div>
          </Block>

          <Block title="Eyebrow, Tag, IconTile" note="Tone-driven via lib/tones.ts.">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-6">
                <Eyebrow>Default eyebrow</Eyebrow><Eyebrow dot="violet">With dot</Eyebrow><Eyebrow tone="violet">Violet</Eyebrow>
              </div>
              <div className="flex flex-wrap gap-2">{tones.map(t => <Tag key={t} tone={t}>{t}</Tag>)}</div>
              <div className="flex flex-wrap gap-3">{tones.map(t => <IconTile key={t} icon={ScanText} tone={t} />)}</div>
            </div>
          </Block>

          <Block title="Panel & Media">
            <div className="grid gap-6 md:grid-cols-2">
              <Panel className="p-6"><Heading as="h3" size="sm">Raised panel</Heading><Text size="sm" className="mt-2">surface-1, hairline border, inner top highlight.</Text>
                <Panel variant="inset" className="mt-5 p-4"><Text size="caption">Inset panel inside a raised one.</Text></Panel>
              </Panel>
              <Media src="/images/home/stat3.jpg" alt="" sizes="half" scrim className="aspect-video" caption="Media with scrim and caption." />
            </div>
          </Block>

          <Block title="NumberedItem">
            <div className="grid gap-10 md:grid-cols-2">
              <ol>{["Find the right opportunity.", "Make it work in the real world."].map((t, i) => <NumberedItem key={t} index={i + 1} title={t} divided>Numbered, divided list item.</NumberedItem>)}</ol>
              <ol className="grid gap-6">{[FileText, GitBranch].map((icon, i) => <NumberedItem key={i} index={i + 1} icon={icon} tone={accentTones[i]} size="sm" title="With icon">Icon tile replaces the number column.</NumberedItem>)}</ol>
            </div>
          </Block>

          <Block title="Disclosure">
            <Disclosure number={1} title="Numbered disclosure" defaultOpen><Text>Expandable body content.</Text></Disclosure>
            <Disclosure title="Plain disclosure"><Text>Expandable body content.</Text></Disclosure>
          </Block>

          <Block title="Sections" note="SectionHeader, ServiceList, CapabilityGrid, PrinciplesRow, TechMarquee.">
            <SectionHeader label="02 / What we build" title="Practical technology." description="SectionHeader with a right-hand intro." />
            <ServiceList items={services} />
            <CapabilityGrid items={capabilities} note={capabilitiesNote} className="mt-12" />
            <TechMarquee items={techStack} label="Built on open technology" note={techNote} className="mt-12" />
            <PrinciplesRow items={principles} className="mt-12" />
          </Block>
        </div>
      </Section>
      <ContactBand />
    </main>
  );
}
