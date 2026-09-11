import * as React from "react";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

type SplitSectionProps = {
  label?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Extra content under the intro in the left column (links, images). */
  aside?: React.ReactNode;
  children: React.ReactNode;
  tone?: "base" | "raised";
  id?: string;
};

/** Heading column on the left, content on the right. */
export function SplitSection({ label, title, intro, aside, children, tone, id }: SplitSectionProps) {
  const titleId = React.useId();
  return (
    <Section tone={tone} id={id} aria-labelledby={titleId} innerClassName="grid gap-10 md:grid-cols-[1fr_1.3fr] md:gap-9 lg:grid-cols-[1fr_1.5fr] lg:gap-18">
      <div>
        {label && <Eyebrow className="mb-4">{label}</Eyebrow>}
        <Heading id={titleId}>{title}</Heading>
        {intro && <Text className="mt-6 max-w-[520px]">{intro}</Text>}
        {aside}
      </div>
      <div className="min-w-0">{children}</div>
    </Section>
  );
}
