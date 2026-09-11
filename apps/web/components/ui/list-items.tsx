import * as React from "react";
import { Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { pad2, toneText, type Tone } from "@/lib/tones";
import { Heading, Text } from "@/components/ui/typography";
import { IconTile } from "@/components/ui/surface";

// --- NumberedItem: "01" + title + description, for <ol> lists ---------------

type NumberedItemProps = {
  index: number;
  title: React.ReactNode;
  children: React.ReactNode;
  /** Swap the number column for an icon tile (the number moves above the title). */
  icon?: LucideIcon;
  tone?: Tone;
  size?: "lg" | "md" | "sm";
  /** Hairline above each item, for stacked lists. */
  divided?: boolean;
  className?: string;
};

export function NumberedItem({ index, title, children, icon, tone = "violet", size = "lg", divided, className }: NumberedItemProps) {
  return (
    <li className={cn("flex items-start gap-5", divided && "border-t border-border py-7 last:pb-0", className)}>
      {icon ? (
        <IconTile icon={icon} tone={tone} />
      ) : (
        <span className={cn("pt-1.5 text-caption tabular-nums", toneText[tone])}>{pad2(index)}</span>
      )}
      <div className="min-w-0">
        {icon && <span className="text-micro tabular-nums text-subtle">{pad2(index)}</span>}
        <Heading as="h3" size={size} className={icon ? "mt-1 mb-2" : "mb-2.5"}>{title}</Heading>
        <Text size="sm">{children}</Text>
      </div>
    </li>
  );
}

// --- Disclosure: expandable row with an optional number ---------------------

type DisclosureProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  number?: number;
  defaultOpen?: boolean;
  className?: string;
};

export function Disclosure({ title, children, number, defaultOpen, className }: DisclosureProps) {
  return (
    <details className={cn("group border-t border-border last:border-b", className)} open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-5 py-6 [&::-webkit-details-marker]:hidden">
        {number !== undefined && <span className="text-caption tabular-nums text-brand-violet">{pad2(number)}</span>}
        <h3 className="flex-1 text-title-md transition-colors duration-200 group-hover:text-foreground">{title}</h3>
        <Plus size={18} aria-hidden className="shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-open:rotate-45" />
      </summary>
      <div className="pb-7">{children}</div>
    </details>
  );
}
