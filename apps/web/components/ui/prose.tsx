import { cn } from "@/lib/utils";

/** Long-form article body. All typography comes from here, not from the HTML. */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose max-w-none text-body dark:prose-invert",
        "prose-p:my-6 prose-p:leading-[1.8] prose-p:text-muted-foreground",
        "prose-headings:font-normal prose-headings:text-foreground",
        "prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-title-lg",
        "prose-li:text-muted-foreground prose-li:marker:text-subtle prose-ul:my-6",
        "prose-strong:font-medium prose-strong:text-foreground",
        "prose-a:text-brand-violet prose-a:underline-offset-4",
        "prose-blockquote:border-brand-violet prose-blockquote:font-normal prose-blockquote:text-foreground",
        "prose-hr:border-border",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
