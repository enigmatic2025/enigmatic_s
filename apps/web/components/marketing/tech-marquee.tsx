import type { SimpleIcon } from "simple-icons";
import { cn } from "@/lib/utils";

type Tech = { key: string; icon: SimpleIcon; name: string };

/**
 * A quiet, continuously scrolling band of monochrome tool marks with names.
 * The list is rendered twice for a seamless loop (the copy is hidden from
 * assistive tech), pauses on hover, and becomes a static wrapped row when the
 * visitor prefers reduced motion.
 */
export function TechMarquee({ items, label, note, className }: { items: readonly Tech[]; label: string; note?: string; className?: string }) {
  return (
    <div className={cn("border-t border-border pt-6", className)}>
      <div className="mb-6 flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <p className="text-eyebrow text-muted-foreground">{label}</p>
        {note && <p className="text-caption text-subtle">{note}</p>}
      </div>
      <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:[mask-image:none]">
        <ul aria-label={label} className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-y-4">
          {[...items, ...items].map(({ key, icon, name }, i) => {
            const duplicate = i >= items.length;
            return (
              <li
                key={`${key}-${i}`}
                aria-hidden={duplicate || undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 pr-10 text-muted-foreground transition-colors duration-200 hover:text-foreground lg:pr-14",
                  duplicate && "motion-reduce:hidden"
                )}
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
                  <path d={icon.path} />
                </svg>
                <span className="whitespace-nowrap text-body-sm font-medium tracking-[-0.01em]">{name}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
