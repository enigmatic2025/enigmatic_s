import * as React from "react";
import { cn } from "@/lib/utils";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

type SectionHeaderProps = {
  label?: string;
  title: React.ReactNode;
  /** id for the <h2>, so the parent section can use aria-labelledby. */
  id?: string;
  /** Short intro shown on the right on desktop. */
  description?: React.ReactNode;
  /** Link or button shown on the right on desktop (instead of, or after, the description). */
  action?: React.ReactNode;
  className?: string;
};

/** Eyebrow + h2 on the left, intro or link on the right. */
export function SectionHeader({ label, title, id, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10", className)}>
      <div>
        {label && <Eyebrow className="mb-4">{label}</Eyebrow>}
        <Heading id={id} className="max-w-[640px]">{title}</Heading>
      </div>
      {description && <Text className="max-w-[560px] lg:max-w-[380px]">{description}</Text>}
      {action}
    </div>
  );
}
