import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/ui/typography";

type Principle = { key: string; title: string; description: string };

/** Short commitments in a row of three. */
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
