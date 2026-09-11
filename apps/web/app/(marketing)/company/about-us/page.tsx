import { ArrowUpRight } from "lucide-react";
import { principles } from "@/lib/content";
import { Media } from "@/components/ui/media";
import { Section } from "@/components/ui/section";
import { Heading, Text } from "@/components/ui/typography";
import { ContactBand } from "@/components/marketing/contact-band";
import { PrinciplesRow } from "@/components/marketing/feature-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { SplitSection } from "@/components/marketing/split-section";

const team = [
  { name: "Chris Schmitt", role: "Consulting", description: "Chris leads consulting and client partnerships, working with operations teams to find the processes worth fixing and define what success looks like.", image: "/images/company/team/chris.jpg", linkedin: "https://www.linkedin.com/in/chris-schmitt-92086442/" },
  { name: "Phi Tran", role: "Engineering", description: "Phi leads engineering — data pipelines, applications, and automated workflows — from the first build through deployment and ongoing support.", image: "/images/company/team/phitran.jpg", linkedin: "https://www.linkedin.com/in/phi-tran-m-s/" },
];

export default function AboutUsPage() {
  return (
    <>
      <PageHero
        title="Operational experience."
        accent="Engineering curiosity."
        description="We bring the people who understand the work together with the people who build the technology. One team, focused on making your business work better."
      />

      <Section className="pt-0 sm:pt-0 lg:pt-0" aria-labelledby="team-title">
        <SectionHeader id="team-title" title="Our team" description="The people connecting business needs with technical possibilities." />
        <div className="grid gap-11 md:grid-cols-2 md:gap-8 lg:gap-12">
          {team.map(member => (
            <article key={member.name}>
              <Media src={member.image} alt={member.name} sizes="half" className="aspect-[4/3]" imgClassName="object-[center_30%]" />
              <div className="mt-6 flex items-center justify-between gap-5">
                <Heading as="h3" size="lg">{member.name}</Heading>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  className="grid size-11 place-items-center rounded-sm border border-border-strong text-muted-foreground transition-colors duration-200 hover:border-foreground/40 hover:text-foreground"
                >
                  <ArrowUpRight size={18} />
                </a>
              </div>
              <Text size="caption" className="mt-2 mb-4 text-brand-violet">{member.role}</Text>
              <Text>{member.description}</Text>
            </article>
          ))}
        </div>
      </Section>

      <SplitSection tone="raised" label="Why Enigmatic" title="Founded by efficiency enthusiasts.">
        <div className="space-y-6">
          <Text>We come from logistics operations and engineering, with hands-on experience running and improving the processes we now help clients fix. We pair that operational depth with engineering expertise to deliver consulting, data engineering, and software that makes day-to-day work simpler.</Text>
          <Text>We believe the strongest solutions are quick to build, versatile enough to adapt, and scalable enough to grow. As technology keeps advancing and competition keeps intensifying, the key to staying ahead is creating solutions that can evolve with change while delivering value today.</Text>
        </div>
      </SplitSection>

      <Section aria-labelledby="principles-title">
        <SectionHeader id="principles-title" title="Practical by design." />
        <PrinciplesRow items={principles} />
      </Section>

      <ContactBand />
    </>
  );
}
