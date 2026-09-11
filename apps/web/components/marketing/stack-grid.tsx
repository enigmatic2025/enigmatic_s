import type { SimpleIcon } from "simple-icons";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/ui/typography";

type StackItem = { key: string; icon: SimpleIcon; name: string; role: string; accent?: boolean };

/** Monochrome logo from simple-icons, drawn in currentColor. */
function BrandIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("size-7 fill-current", className)}>
      <path d={icon.path} />
    </svg>
  );
}

/** The tools we build with, each with the job it does. */
export function StackGrid({ items, note, className }: { items: readonly StackItem[]; note?: string; className?: string }) {
  return (
    <div className={className}>
      <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ key, icon, name, role, accent }) => (
          <li key={key} className="group flex flex-col gap-10 bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2 lg:p-7">
            <BrandIcon icon={icon} className={accent ? "text-brand-pink" : "text-foreground"} />
            <div>
              <Heading as="h3" size="md">{name}</Heading>
              <Text size="sm" className="mt-1.5">{role}</Text>
            </div>
          </li>
        ))}
      </ul>
      {note && <Text size="caption" tone="subtle" className="mt-5">{note}</Text>}
    </div>
  );
}
