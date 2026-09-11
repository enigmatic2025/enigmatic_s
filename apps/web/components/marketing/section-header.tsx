import * as React from "react";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/ui/typography";

type SectionHeaderProps = {
  title: React.ReactNode;
  /** id for the <h2>, so the parent section can use aria-labelledby. */
  id?: string;
  /** Short intro shown on the right on desktop. */
  description?: React.ReactNode;
  /** Link or button shown on the right on desktop (instead of, or after, the description). */
  action?: React.ReactNode;
  className?: string;
};

/** Heading on the left, intro or link on the right. */
export function SectionHeader({ title, id, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-10 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10", className)}>
      <div>
        <Heading id={id} className="max-w-[640px]">{title}</Heading>
      </div>
      {description && <Text className="max-w-[560px] lg:max-w-[380px]">{description}</Text>}
      {action}
    </div>
  );
}
