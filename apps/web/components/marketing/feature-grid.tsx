import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { accentAt, pad2, toneText } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/ui/typography";

type Feature = { key: string; icon: LucideIcon; title: string; description: string; examples?: string; /** Shown top-right instead of the index number. */ label?: string };

const desktopCols: Record<number, string> = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

/** A row of features, each topped by a hairline. Icons cycle through the brand trio. */
export function FeatureGrid({ items, className }: { items: readonly Feature[]; className?: string }) {
  return (
    <div className={cn("grid gap-x-8 gap-y-10 md:grid-cols-2", desktopCols[items.length] ?? "lg:grid-cols-3", className)}>
      {items.map(({ key, icon: Icon, title, description, examples, label }, i) => (
        <article key={key} className="border-t border-border pt-7">
          <div className="mb-8 flex items-center justify-between">
            <Icon size={28} strokeWidth={1.25} aria-hidden className={toneText[accentAt(i)]} />
            <span className="text-micro tabular-nums text-subtle">{label ?? pad2(i + 1)}</span>
          </div>
          <Heading as="h3" size="lg" className="mb-4">{title}</Heading>
          <Text size="sm">{description}</Text>
          {examples && <Text size="caption" tone="default" className="mt-6">{examples}</Text>}
        </article>
      ))}
    </div>
  );
}

type Principle = { key: string; title: string; description: string };

/** Short benefit statements in a row of three. */
export function PrinciplesRow({ items, className }: { items: readonly Principle[]; className?: string }) {
  return (
    <ul className={cn("grid gap-7 md:grid-cols-3 md:gap-10", className)}>
      {items.map(({ key, title, description }) => (
        <li key={key} className="flex gap-3.5 border-t border-border pt-6">
          <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-violet" />
          <div>
            <Heading as="h3" size="sm" className="mb-2">{title}</Heading>
            <Text size="sm">{description}</Text>
          </div>
        </li>
      ))}
    </ul>
  );
}
