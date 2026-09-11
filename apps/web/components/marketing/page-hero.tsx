import * as React from "react";
import { Heading, Text } from "@/components/ui/typography";

type PageHeroProps = {
  title: React.ReactNode;
  /** Second headline line, rendered in the brand gradient. */
  accent?: React.ReactNode;
  description: React.ReactNode;
  /** Buttons / links shown beside the lead on desktop. */
  actions?: React.ReactNode;
  /** Full-width media below the headline block. */
  media?: React.ReactNode;
  /** Content under the headline block — usually a <Media />. */
  children?: React.ReactNode;
};

/** The one hero for every marketing page. Clears the fixed header. */
export function PageHero({ title, accent, description, actions, media, children }: PageHeroProps) {
  const titleId = React.useId();
  return (
    <section aria-labelledby={titleId} className="pt-28 pb-14 sm:pt-32 lg:pt-38 lg:pb-16">
      <div className="wrap">
      <Heading as="h1" id={titleId} size="display" accent={accent} className="max-w-[1080px]">{title}</Heading>
      <div className="mt-8 flex flex-col items-start gap-7 lg:mt-9 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <Text size="lead" className="max-w-[600px]">{description}</Text>
        {actions && <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:flex-col lg:items-start lg:gap-5">{actions}</div>}
      </div>
      </div>
      {media && <div className="mt-10 lg:mt-12">{media}</div>}
      {children && <div className="wrap mt-10 lg:mt-12">{children}</div>}
    </section>
  );
}
