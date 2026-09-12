import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactBand } from "@/components/marketing/contact-band";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { siteName } from "@/lib/site";

const title = "Automating fleet reporting for Dubuque Moving & Storage";
const description = "Dubuque Moving & Storage partnered with Enigmatic Partners to modernize a recurring weekly reporting process that required significant manual effort to compile driver Hours of Service data, calculate billable time, organize detailed ELD activity, and distribute reporting to the operations team.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/portfolio/dubuque-moving-storage" },
  openGraph: { title: `${title} | ${siteName}`, description, images: ["/images/portfolio/dms.jpg"] },
  twitter: { card: "summary_large_image", title: `${title} | ${siteName}`, description, images: ["/images/portfolio/dms.jpg"] },
};

export default function DmsCaseStudyPage() {
  return (
    <>
      <section className="pt-28 pb-14 sm:pt-32 lg:pt-38 lg:pb-20" aria-labelledby="case-study-title">
        <div className="wrap">
          <Link href="/portfolio" className="mb-10 inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} aria-hidden="true" />All projects</Link>
          <div className="grid items-center gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div>
              <Eyebrow className="mb-5">Dubuque Moving &amp; Storage / Case study</Eyebrow>
              <Heading as="h1" id="case-study-title" size="cta" accent="From source to delivery.">Automating fleet reporting.</Heading>
            </div>
            <div className="overflow-hidden rounded-md bg-black p-7 sm:p-10">
              <Image src="/images/portfolio/dms.jpg" alt="Dubuque Moving & Storage, Inc." width={1500} height={844} priority className="h-auto w-full" sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          </div>
        </div>
      </section>

      <Section pad="none" className="pb-14 lg:pb-24" aria-label="Case study article">
        <article aria-labelledby="case-study-title" className="mx-auto max-w-3xl space-y-6">
          <Text>Dubuque Moving &amp; Storage partnered with Enigmatic Partners to modernize a recurring weekly reporting process that required significant manual effort to compile driver Hours of Service data, calculate billable time, organize detailed ELD activity, and distribute reporting to the operations team. Enigmatic designed and implemented an end-to-end automation that integrates directly with Samsara, applies DMS-specific business rules, and transforms raw fleet data into standardized, decision-ready reporting with no manual intervention.</Text>
          <Text>Each week, the solution automatically identifies the applicable reporting period, retrieves driver HOS and ELD activity, calculates billable hours using defined on-duty, driving, and yard-move logic, and reconstructs detailed daily driver activity including shift duration, driving time, mileage, vehicles used, duty-status transitions, locations, and driver remarks. The workflow then generates two structured Excel reports, one providing a consolidated view of weekly billable hours by driver and another delivering detailed HOS activity, before automatically distributing both to the DMS team on a consistent schedule.</Text>
          <Text>Beyond eliminating a repetitive administrative task, the solution improved the reliability and consistency of a business-critical reporting process by reducing manual data handling, calculation risk, and dependence on individual staff knowledge. The automation now saves approximately 2 to 3 hours of administrative effort each week, representing more than 100 hours of recovered capacity annually, while giving the DMS team faster and more dependable access to the operational information required for billing and driver oversight.</Text>
          <Text>The result is a scalable reporting process that runs predictably in the background and allows staff to redirect time from data collection and spreadsheet preparation toward higher-value operational work.</Text>
        </article>
      </Section>
      <ContactBand />
    </>
  );
}
