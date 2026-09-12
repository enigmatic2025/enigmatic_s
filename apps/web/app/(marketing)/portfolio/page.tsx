import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactBand } from "@/components/marketing/contact-band";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { contactHref, contactLabel, siteName } from "@/lib/site";

const description = "Explore Enigmatic Partners projects: practical automation that connects operational data to the work businesses need done.";

export const metadata: Metadata = {
  title: "Portfolio",
  description,
  alternates: { canonical: "/portfolio" },
  openGraph: { title: `Portfolio | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
  twitter: { card: "summary_large_image", title: `Portfolio | ${siteName}`, description, images: ["/images/brand/brand-image.jpg"] },
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        title="Real work."
        accent="Lasting impact."
        description="A closer look at the processes we simplify, the solutions we build, and the time we give back to our clients."
        actions={<Button asChild><a href={contactHref}>{contactLabel}<ArrowRight size={17} aria-hidden="true" /></a></Button>}
      />

      <Section pad="md" className="border-t border-border" aria-labelledby="projects-title">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Heading id="projects-title" size="lg">Selected projects</Heading>
          <Eyebrow>01 / Completed project</Eyebrow>
        </div>
        <article>
          <Link href="/portfolio/dubuque-moving-storage" className="group grid overflow-hidden rounded-md border border-border transition-colors hover:border-border-strong lg:grid-cols-2">
            <div className="relative flex min-h-64 items-center justify-center bg-black p-8 sm:min-h-80 sm:p-12">
              <span className="absolute top-6 left-6 text-eyebrow text-white/65">Moving &amp; storage</span>
              <Image src="/images/portfolio/dms.jpg" alt="Dubuque Moving & Storage, Inc." width={1500} height={844} priority className="h-auto w-full max-w-lg" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div className="flex flex-col bg-surface-1 p-7 sm:p-10 lg:p-12">
              <Eyebrow className="mb-5">Dubuque Moving &amp; Storage</Eyebrow>
              <Heading as="h3" size="xl">Automating fleet reporting.<br />From source to delivery.</Heading>
              <Text className="mt-5">Integrating Samsara HOS and ELD data to calculate billable driver hours, reconstruct detailed activity records, and deliver two Excel workbooks. More than three hours of manual reporting reduced to a 30-second automated workflow.</Text>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-5 border-t border-border pt-6">
                <div><p className="text-heading-xl">3+ hours</p><Text size="sm">of manual work before</Text></div>
                <div><p className="text-heading-xl">30 seconds</p><Text size="sm">automated runtime now</Text></div>
              </div>
              <span className="mt-9 inline-flex items-center gap-3 text-body-sm">Read the case study<ArrowUpRight size={18} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
            </div>
          </Link>
        </article>
      </Section>
      <ContactBand />
    </>
  );
}
