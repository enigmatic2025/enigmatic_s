import { ArrowRight } from "lucide-react";
import { contactBand } from "@/lib/content";
import { contactHref, contactLabel } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

/** Closing call to action on every page. The brand glow is its signature. */
export function ContactBand() {
  return (
    <section aria-labelledby="contact-title" className="border-t border-border bg-surface-1 bg-brand-glow">
      <div className="wrap py-16 lg:py-24">
        <Eyebrow dot="pink" tone="default">{contactBand.label}</Eyebrow>
        <Heading id="contact-title" size="cta" className="mt-6 max-w-[800px]">{contactBand.title}</Heading>
        <div className="mt-8 flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <Text className="max-w-[490px]">{contactBand.description}</Text>
          <Button asChild size="lg">
            <a href={contactHref}>{contactLabel}<ArrowRight size={17} /></a>
          </Button>
        </div>
      </div>
    </section>
  );
}
