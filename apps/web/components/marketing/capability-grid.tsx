import { pad2 } from "@/lib/tones";
import { Heading, Text } from "@/components/ui/typography";

type Capability = { key: string; title: string; description: string; tags: string };

/**
 * Technology explained for executives: a plain title and one line each, with a
 * small mono tag line underneath for technical readers. Icon-free by design.
 */
export function CapabilityGrid({ items, note, className }: { items: readonly Capability[]; note?: string; className?: string }) {
  return (
    <div className={className}>
      <ul className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ key, title, description, tags }, i) => (
          <li key={key} className="flex flex-col bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2 lg:p-7">
            <span className="mb-10 font-mono text-micro tabular-nums text-subtle">{pad2(i + 1)}</span>
            <Heading as="h3" size="md">{title}</Heading>
            <Text size="sm" className="mt-2">{description}</Text>
            <p className="mt-auto pt-6 font-mono text-micro text-subtle">{tags}</p>
          </li>
        ))}
      </ul>
      {note && <Text size="caption" tone="subtle" className="mt-5">{note}</Text>}
    </div>
  );
}
