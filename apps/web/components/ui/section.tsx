import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("", {
  variants: {
    tone: {
      base: "",
      raised: "border-y border-border bg-surface-1",
    },
    pad: {
      lg: "py-14 sm:py-18 lg:py-24",
      md: "py-14 lg:py-18",
      none: "",
    },
  },
  defaultVariants: { tone: "base", pad: "lg" },
});

type SectionProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
    /** Classes for the inner page-width wrapper. */
    innerClassName?: string;
  };

/** A full-bleed band with the page-width wrapper inside. */
export function Section({ tone, pad, className, innerClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn(sectionVariants({ tone, pad }), className)} {...props}>
      <div className={cn("wrap", innerClassName)}>{children}</div>
    </section>
  );
}
