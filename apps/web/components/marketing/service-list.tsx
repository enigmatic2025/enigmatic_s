import { pad2 } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Heading, Text } from "@/components/ui/typography";

type Service = { key: string; label: string; title: string; description: string; examples?: string };

/**
 * Editorial index of services: number, plain service name, title on the left,
 * one sentence on the right, hairlines between rows. Deliberately icon-free.
 */
export function ServiceList({ items, showExamples, className }: { items: readonly Service[]; showExamples?: boolean; className?: string }) {
  return (
    <ol className={cn("border-t border-border", className)}>
      {items.map(({ key, label, title, description, examples }, i) => (
        <li key={key} className="grid gap-4 border-b border-border py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12 lg:py-10">
          <div className="flex gap-6 lg:gap-10">
            <span className="pt-1 font-mono text-caption tabular-nums text-subtle">{pad2(i + 1)}</span>
            <div>
              <p className="text-eyebrow text-muted-foreground">{label}</p>
              <Heading as="h3" size="lg" className="mt-3">{title}</Heading>
            </div>
          </div>
          <div className="pl-11 md:pt-7 md:pl-0">
            <Text className="max-w-[540px]">{description}</Text>
            {showExamples && examples && <p className="mt-4 text-caption text-subtle">{examples}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
